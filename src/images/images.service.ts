import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createApi } from 'unsplash-js';
import { createClient } from 'pexels';
import * as nodeFetch from 'node-fetch';

export interface ImageResult {
  id: string;
  urlThumb: string;
  urlRegular: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
  source: 'google' | 'unsplash' | 'pexels';
}

export interface ImageSearchResponse {
  results: ImageResult[];
  total: number;
  source: 'google' | 'unsplash' | 'pexels';
}

const PLACES_BASE_URL = 'https://places.googleapis.com/v1';

interface PlacePhoto {
  name: string;
  widthPx?: number;
  heightPx?: number;
  authorAttributions?: { displayName?: string; uri?: string }[];
}

interface PlacesTextSearchResponse {
  places?: {
    displayName?: { text?: string };
    photos?: PlacePhoto[];
  }[];
}

interface CachedPlace {
  displayName: string | null;
  photos: PlacePhoto[];
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

// Cache em memória: a cota de Text Search é a mais escassa (5k/mês grátis) e
// cada "Carregar mais" / busca repetida re-executaria a mesma consulta.
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX_ENTRIES = 500;

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);
  private readonly placeCache = new Map<string, CacheEntry<CachedPlace>>();
  private readonly photoUriCache = new Map<string, CacheEntry<string>>();

  constructor(private readonly config: ConfigService) {}

  private cacheGet<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      cache.delete(key);
      return null;
    }
    return entry.value;
  }

  private cacheSet<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T): void {
    if (cache.size >= CACHE_MAX_ENTRIES) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
    cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  }

  async searchImages(q: string, page = 1, perPage = 3): Promise<ImageSearchResponse> {
    try {
      const result = await this.searchGooglePlaces(q, page, perPage);
      if (result.results.length > 0) return result;
    } catch (err) {
      this.logger.warn(`Google Places failed, falling back to Unsplash: ${(err as Error).message}`);
    }

    try {
      const result = await this.searchUnsplash(q, page, perPage);
      if (result.results.length > 0) return result;
    } catch (err) {
      this.logger.warn(`Unsplash failed, falling back to Pexels: ${(err as Error).message}`);
    }

    return this.searchPexels(q, page, perPage);
  }

  /**
   * Busca o lugar via Places API (New) Text Search e retorna as fotos reais
   * do estabelecimento (as mesmas do Google Maps). Um lugar tem no máximo
   * ~10 fotos; a paginação é feita fatiando essa lista.
   */
  private async searchGooglePlaces(q: string, page: number, perPage: number): Promise<ImageSearchResponse> {
    const apiKey = this.config.get<string>('GOOGLE_PLACES_API_KEY');
    if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY not configured');

    const place = await this.findPlace(q, apiKey);
    const photos = place?.photos ?? [];
    if (photos.length === 0) return { results: [], total: 0, source: 'google' };

    // O Google não amplia além da resolução nativa; fotos minúsculas ficariam
    // ruins como hero/galeria. Prioriza as ≥800px preservando a ordem de
    // relevância dentro de cada grupo.
    const MIN_WIDTH_PX = 800;
    const ordered = [
      ...photos.filter((p) => (p.widthPx ?? 0) >= MIN_WIDTH_PX),
      ...photos.filter((p) => (p.widthPx ?? 0) < MIN_WIDTH_PX),
    ];

    const start = (page - 1) * perPage;
    const pagePhotos = ordered.slice(start, start + perPage);

    const resolved = await Promise.all(
      pagePhotos.map(async (photo): Promise<ImageResult | null> => {
        const photoUri = await this.resolvePlacePhotoUri(photo.name, apiKey);
        if (!photoUri) return null;
        const author = photo.authorAttributions?.[0];
        return {
          id: photo.name,
          urlThumb: photoUri,
          urlRegular: photoUri,
          alt: place?.displayName ?? q,
          photographer: author?.displayName ?? 'Google Maps',
          photographerUrl: author?.uri ?? '',
          source: 'google',
        };
      }),
    );

    return {
      results: resolved.filter((r): r is ImageResult => r !== null),
      total: photos.length,
      source: 'google',
    };
  }

  private async findPlace(q: string, apiKey: string): Promise<CachedPlace | null> {
    const cacheKey = q.trim().toLowerCase();
    const cached = this.cacheGet(this.placeCache, cacheKey);
    if (cached) return cached;

    const searchRes = await fetch(`${PLACES_BASE_URL}/places:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.photos',
      },
      body: JSON.stringify({ textQuery: q }),
    });
    if (!searchRes.ok) {
      throw new Error(`Places text search failed: ${searchRes.status} ${await searchRes.text()}`);
    }

    const data = (await searchRes.json()) as PlacesTextSearchResponse;
    const first = data.places?.[0];
    const place: CachedPlace = {
      displayName: first?.displayName?.text ?? null,
      photos: first?.photos ?? [],
    };
    this.cacheSet(this.placeCache, cacheKey, place);
    return place;
  }

  /** Troca o resource name da foto por uma URL pública (googleusercontent), sem expor a API key. */
  private async resolvePlacePhotoUri(photoName: string, apiKey: string): Promise<string | null> {
    const cached = this.cacheGet(this.photoUriCache, photoName);
    if (cached) return cached;

    const res = await fetch(`${PLACES_BASE_URL}/${photoName}/media?maxWidthPx=1600&skipHttpRedirect=true`, {
      headers: { 'X-Goog-Api-Key': apiKey },
    });
    if (!res.ok) {
      this.logger.warn(`Place photo media failed (${photoName}): ${res.status}`);
      return null;
    }
    const media = (await res.json()) as { photoUri?: string };
    if (media.photoUri) this.cacheSet(this.photoUriCache, photoName, media.photoUri);
    return media.photoUri ?? null;
  }

  private async searchUnsplash(q: string, page: number, perPage: number): Promise<ImageSearchResponse> {
    const accessKey = this.config.get<string>('UNSPLASH_ACCESS_KEY');
    if (!accessKey) throw new Error('UNSPLASH_ACCESS_KEY not configured');

    const unsplash = createApi({ accessKey, fetch: nodeFetch.default as unknown as typeof fetch });
    const response = await unsplash.search.getPhotos({ query: q, page, perPage });

    if (response.errors) throw new Error(response.errors.join(', '));

    const results: ImageResult[] = (response.response?.results ?? []).map((photo) => ({
      id: photo.id,
      urlThumb: photo.urls.thumb,
      urlRegular: photo.urls.regular,
      alt: photo.alt_description ?? photo.description ?? q,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      source: 'unsplash',
    }));

    return { results, total: response.response?.total ?? 0, source: 'unsplash' };
  }

  private async searchPexels(q: string, page: number, perPage: number): Promise<ImageSearchResponse> {
    const apiKey = this.config.get<string>('PEXELS_API_KEY');
    if (!apiKey) throw new Error('PEXELS_API_KEY not configured');

    const client = createClient(apiKey);
    const response = await client.photos.search({ query: q, page, per_page: perPage });

    if ('error' in response) throw new Error(response.error as string);

    const results: ImageResult[] = response.photos.map((photo) => ({
      id: String(photo.id),
      urlThumb: photo.src.tiny,
      urlRegular: photo.src.large,
      alt: photo.alt ?? q,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      source: 'pexels',
    }));

    return { results, total: response.total_results, source: 'pexels' };
  }
}
