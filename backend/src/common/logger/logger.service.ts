// backend/src/common/logger/logger.service.ts
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomLoggerService implements NestLoggerService {
  constructor(private prisma: PrismaService) {}

  log(message: string, context?: string) {
    console.log(`[LOG] [${context}] ${message}`);
    this.saveLog('log', message, context);
  }

  error(message: string, trace?: string, context?: string) {
    console.error(`[ERROR] [${context}] ${message}`, trace);
    this.saveLog('error', message, context, trace);
  }

  warn(message: string, context?: string) {
    console.warn(`[WARN] [${context}] ${message}`);
    this.saveLog('warn', message, context);
  }

  debug(message: string, context?: string) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] [${context}] ${message}`);
    }
  }

  verbose(message: string, context?: string) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[VERBOSE] [${context}] ${message}`);
    }
  }

  private async saveLog(
    level: string,
    message: string,
    context?: string,
    trace?: string,
  ) {
    // Save critical logs to database (optional)
    if (level === 'error' && process.env.NODE_ENV === 'production') {
      try {
        // You can create a logs table in Prisma to store logs
        // await this.prisma.log.create({ data: { level, message, context, trace } });
      } catch (error) {
        console.error('Failed to save log to database:', error);
      }
    }
  }
}