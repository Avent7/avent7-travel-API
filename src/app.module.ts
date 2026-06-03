import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { ClsModule } from 'nestjs-cls';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { randomUUID } from 'crypto';
import { Request } from 'express';

import { StorageModule } from './storage/storage.module';
import { UploadModule } from './upload/upload.module';
import { CommonModule } from './common/common.module';
import { RedisModule } from './redis/redis.module';
import { LogModule } from './logs/log.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AgenciesModule } from './agencies/agencies.module';
import { ClientsModule } from './clients/clients.module';
import { ClientSegmentsModule } from './client-segments/client-segments.module';
import { FornecedoresModule } from './fornecedores/fornecedores.module';
import { PassengersModule } from './passengers/passengers.module';
import { ViagensModule } from './viagens/viagens.module';
import { PropostasModule } from './propostas/propostas.module';
import { PropostaBlocksModule } from './proposta-blocks/proposta-blocks.module';
import { BriefingsModule } from './briefings/briefings.module';
import { BriefingTemplatesModule } from './briefing-templates/briefing-templates.module';
import { ImagesModule } from './images/images.module';
import { AiModule } from './ai/ai.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    // ─── Config ───────────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ─── CLS (Request context) ────────────────────────────────────────────────
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: Request) =>
          (req.headers['x-request-id'] as string) ?? randomUUID(),
      },
    }),

    // ─── MongoDB ──────────────────────────────────────────────────────────────
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
        maxPoolSize: 50,
        minPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        enableUtf8Validation: false,
      }),
    }),

    // ─── Rate limiting ────────────────────────────────────────────────────────
    ThrottlerModule.forRoot([{ name: 'default', limit: 500, ttl: 60000 }]),

    // ─── BullMQ ───────────────────────────────────────────────────────────────
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_URL', '127.0.0.1'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get<string>('REDIS_PASSWORD') || undefined,
        },
      }),
    }),

    // ─── Global modules ───────────────────────────────────────────────────────
    StorageModule,
    UploadModule,
    RedisModule,
    CommonModule,
    LogModule,

    // ─── Domain modules ───────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    AgenciesModule,
    ClientsModule,
    ClientSegmentsModule,
    FornecedoresModule,
    PassengersModule,
    ViagensModule,
    PropostasModule,
    PropostaBlocksModule,
    BriefingsModule,
    BriefingTemplatesModule,
    ImagesModule,
    AiModule,
    DashboardModule,
  ],

  providers: [
    // Global logging interceptor — logs operations marked with @LogOperation
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
