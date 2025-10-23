// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { CustomLoggerService } from './common/logger/logger.service';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Use custom logger
  app.useLogger(app.get(CustomLoggerService));
  const logger = app.get(CustomLoggerService);

  // Security: Helmet - Protect HTTP headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Security: CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Security: Rate Limiting
  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Max 100 requests per IP per 15 minutes
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
      },
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Stricter rate limit for auth endpoints
  app.use(
    '/api/auth',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10, // Max 10 requests per IP per 15 minutes
      message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.',
      },
    }),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // GLOBAL PREFIX
  app.setGlobalPrefix('api');

  // GRACEFUL SHUTDOWN
  app.enableShutdownHooks();

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());

  // START SERVER
  const port = process.env.PORT || 3000;
  await app.listen(port);

  // STARTUP LOGS
  logger.log('========================================');
  logger.log('🚀 Server Started Successfully');
  logger.log('========================================');
  logger.log(`📍 URL: http://localhost:${port}`);
  logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`🔒 Security:`);
  logger.log(`   - Helmet: ✅ Enabled`);
  logger.log(
    `   - CORS: ✅ Enabled (${process.env.FRONTEND_URL || 'http://localhost:5173'})`,
  );
  logger.log(`   - Rate Limiting: ✅ Enabled (100 req/15min)`);
  logger.log(`   - Auth Rate Limit: ✅ Enabled (10 req/15min)`);
  logger.log(`📊 Features:`);
  logger.log(`   - JWT Authentication: ✅`);
  logger.log(`   - Role-based Access: ✅`);
  logger.log(`   - WebSocket (Chat): ✅`);
  logger.log(`   - WebSocket (Notifications): ✅`);
  logger.log(`   - Winston Logging: ✅`);
  logger.log(`   - Health Check: ✅`);
  logger.log('========================================');
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
