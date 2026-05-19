import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ─── CORS ─────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: [
      'http://localhost:3055',
      'http://localhost:3056',
      'http://localhost:3000',
      'https://v0-avent7-travel.vercel.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  });

  // ─── Middleware ────────────────────────────────────────────────────────────
  app.use(cookieParser());

  // ─── Global pipes ─────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Swagger ──────────────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Avent7 Privé API')
    .setDescription('Backend para a plataforma de gestão de viagens de luxo Avent7 Privé')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth')
    .addTag('users')
    .addTag('agencies')
    .addTag('passengers')
    .addTag('propostas')
    .addTag('proposta-blocks')
    .addTag('bookings')
    .addTag('briefings')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  // ─── Start ────────────────────────────────────────────────────────────────
  const port = process.env.PORT ?? 3061;
  await app.listen(port);

  console.log(`\n🚀 Avent7 Privé API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/swagger\n`);
}

bootstrap();
