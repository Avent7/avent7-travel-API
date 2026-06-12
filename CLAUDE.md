# Avent7 Travel — API (Backend)

Contexto de produto/domínio: ver [CLAUDE.md da raiz](../CLAUDE.md).

## Stack

NestJS 11 · MongoDB Atlas via Mongoose 8 · Redis (sessões + filas BullMQ) · AWS S3 (SDK v3) · Sharp · OpenAI · Unsplash/Pexels · Swagger.

Porta **3061**, Swagger em `/swagger`. CORS com whitelist em `src/main.ts` (localhost:3055/3056/3000, vercel, IP local). `ValidationPipe` global com `whitelist + forbidNonWhitelisted + transform` — campo fora do DTO derruba a request.

## Comandos

- `npm run dev` — watch mode.
- Seeds (usam `tsconfig.seed.json`): `npm run seed:admin` (cria Agency "Avent7 Travel" + superadmin/admin/employee, senha `123456`), `seed:briefing-template`, `seed:briefing-template-particular`, `seed:sync-client-counts`, `seed:migrate-client-segments`.

## Convenções por módulo (`src/<modulo>/`)

`*.controller.ts` + `*.service.ts` + `*.module.ts`, com `schemas/` (Mongoose), `enums/`, `dto/` (class-validator) e, em módulos maiores, `repositories/` (padrão repository: interface + `*.mongoose.repository.ts`) e `interfaces/`.

Módulos: `auth`, `users`, `agencies`, `clients`, `client-segments`, `passengers`, `viagens`, `propostas`, `proposta-blocks`, `briefings`, `briefing-templates`, `fornecedores`, `images`, `upload`, `ai`, `dashboard`, `storage` (S3), `redis`, `logs`, `common` (guards, decorators, CLS).

## Auth e escopo de dados

- Login → access token JWT (15 min) **validado contra sessão no Redis** + refresh token em cookie httpOnly (7 dias). Refresh: `POST /auth/refresh`.
- Proteja endpoints com `@Auth(...roles)` (`src/common/decorators/auth.decorator.ts`) = JwtAuthGuard + RolesGuard. Roles: `UserRole.ADMIN | EMPLOYEE | SUPERADMIN`.
- **Multi-tenant via CLS**: `RequestContextService` (`src/common/cls/`) injeta `agencyId`/`userId`/`userRole` em toda request — services filtram por agência a partir do contexto, nunca do payload do cliente.
- Reset de senha: código por email, TTL 15 min, 5 tentativas, 3 requests/hora.
- Auditoria: anote endpoints mutadores com `@LogOperation` — `LoggingInterceptor` enfileira no BullMQ (`src/logs/`).

## Regras de negócio importantes

### Blocos de proposta — embutidos, não coleção própria
Os blocos vivem como **subdocumentos no documento da Proposta** (`src/propostas/schemas/proposta.schema.ts`). O módulo `proposta-blocks` é só uma fachada: expõe as rotas `/propostas/:propostaId/blocks` (CRUD + `PUT .../reorder`) e delega tudo ao `PropostasService`. O arquivo `proposta-blocks/schemas/proposta-block.schema.ts` é **legado e não registrado** — não usar.

### Financeiro
Totais da Proposta em USD: `totalCostUsd`, `totalSaleUsd`, `totalMarkupUsd`, `platformFeeUsd`, `agencyProfitUsd`. Parâmetros vêm do `pricingConfig` da Agency (`defaultMarkupPct` 20%, `platformTakeRatePct` 4%, `minCommissionUsd`, `serviceFeeFixed`/`serviceFeeMode`). Moedas: `baseCurrency` (default USD) + `fxRates: Record<string, number>` na Proposta; `blockData.currency` por bloco. Markup/lucro não são convertidos.

### Upload de imagens
Fluxo único: `multipart/form-data` (multer, máx 5 MB) → Sharp (rotate + resize + **WebP** q86) → S3 (`src/upload/upload.service.ts` + `src/storage/s3.service.ts`). Endpoints: `/upload/photo`, `/users/me/avatar`, `/clients/:id/photo`, `/passengers/:id/photo`, `/viagens/:id/cover`, `/fornecedores/:id/logo`. O frontend nunca fala com o S3 diretamente.

### Links públicos (sem auth)
`GET /briefings/public/:id` e `POST /briefings/public/:id/submit` — formulário de briefing preenchido pelo cliente (status → `client_filling`/`completed`). O preview da proposta é renderizado pelo front em `/preview/:id`.

### IA (`src/ai/`)
OpenAI (`OPENAI_MODEL`, default gpt-5-mini, reasoning effort low). Endpoints com rate limit próprio: `/ai/proposta/mensagem-breve` (30/min, + variante `/stream` SSE), `/sugerir-bloco` (20/min), `/sugerir-atividades-dia` (10/min).

### Busca de imagens (`/images/search`)
Cadeia de providers em `src/images/images.service.ts`: **Google Places (New) primário** → Unsplash → Pexels. O Places faz Text Search do estabelecimento e retorna as fotos reais dele (as do Google Maps, máx ~10 por lugar, paginação por fatiamento); a URL pública é resolvida server-side via `skipHttpRedirect` para não expor a API key. Sem `GOOGLE_PLACES_API_KEY` configurada, cai direto pros stocks. O campo `source` da resposta é `google | unsplash | pexels` (front exibe a atribuição correspondente).

### Pipeline de viagens
`GET /viagens/pipeline` retorna colunas por `ViagemStatus` com counts e paginação por coluna. Fluxo: `draft → sent_to_client ↔ revision_requested → approved → booked → completed`; `cancelled` de qualquer estado.

## Variáveis de ambiente (.env)

`PORT` (3061) · `FRONTEND_URL` · `MONGODB_URI` · `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` · `REDIS_URL` / `REDIS_PORT` / `REDIS_PASSWORD` · `OPENAI_API_KEY` / `OPENAI_MODEL` / `OPENAI_REASONING_EFFORT` · `AWS_REGION` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_S3_BUCKET` / `AWS_S3_PUBLIC_URL` · `GOOGLE_PLACES_API_KEY` / `UNSPLASH_ACCESS_KEY` / `PEXELS_API_KEY`.
