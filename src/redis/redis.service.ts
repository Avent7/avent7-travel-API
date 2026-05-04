import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

const SESSION_TTL = 900; // 15 min — matches access token lifetime

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.config.get<string>('REDIS_URL', '127.0.0.1'),
      port: this.config.get<number>('REDIS_PORT', 6379),
      password: this.config.get<string>('REDIS_PASSWORD') || undefined,
      lazyConnect: true,
    });

    this.client.on('error', (err) => this.logger.error('Redis error', err));
    this.client.connect().catch((err) => this.logger.warn('Redis not available:', err.message));
  }

  onModuleDestroy() {
    this.client?.disconnect();
  }

  // ─── Session (JWT access token) ───────────────────────────────────────────

  async setSession(userId: string, token: string): Promise<void> {
    await this.client.set(`session:${userId}`, token, 'EX', SESSION_TTL);
  }

  async getSession(userId: string): Promise<string | null> {
    return this.client.get(`session:${userId}`);
  }

  async deleteSession(userId: string): Promise<void> {
    await this.client.del(`session:${userId}`);
  }

  // ─── Generic key-value ────────────────────────────────────────────────────

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async setJson<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  getClient(): Redis {
    return this.client;
  }
}
