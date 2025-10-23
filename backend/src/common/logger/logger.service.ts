// backend/src/common/logger/logger.service.ts
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomLoggerService implements NestLoggerService {
  private readonly logger: winston.Logger;

  constructor(private prisma: PrismaService) {
    this.logger = this.createWinstonLogger();
  }

  private createWinstonLogger(): winston.Logger {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isProduction = process.env.NODE_ENV === 'production';

    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, context, stack }) => {
        const contextStr = context ? `[${context}]` : '';
        const stackStr = stack ? `\n${stack}` : '';
        return `${timestamp} [${level.toUpperCase()}] ${contextStr} ${message}${stackStr}`;
      })
    );

    const transports: winston.transport[] = [
      // Console transport for development
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
          winston.format.printf(({ timestamp, level, message, context }) => {
            const contextStr = context ? `[${context}]` : '';
            return `${timestamp} ${level} ${contextStr} ${message}`;
          })
        ),
      }),
    ];

    // File transports for production
    if (isProduction) {
      // Error logs
      transports.push(
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '20m',
          maxFiles: '14d',
          format: logFormat,
        })
      );

      // Combined logs
      transports.push(
        new winston.transports.DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          format: logFormat,
        })
      );

      // HTTP request logs
      transports.push(
        new winston.transports.DailyRotateFile({
          filename: 'logs/http-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '7d',
          format: logFormat,
        })
      );
    }

    return winston.createLogger({
      level: isDevelopment ? 'debug' : 'info',
      format: logFormat,
      transports,
      exitOnError: false,
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { context, stack: trace });

    // Save critical errors to database in production
    if (process.env.NODE_ENV === 'production') {
      this.saveErrorToDatabase(message, context, trace);
    }
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  http(message: string, context?: string, meta?: any) {
    this.logger.info(message, { context, type: 'http', ...meta });
  }

  private async saveErrorToDatabase(
    message: string,
    context?: string,
    trace?: string,
  ) {
    try {
      // Create a logs table in Prisma schema if needed
      // await this.prisma.log.create({
      //   data: {
      //     level: 'error',
      //     message,
      //     context: context || 'unknown',
      //     stack: trace,
      //     timestamp: new Date(),
      //   },
      // });
    } catch (error) {
      console.error('Failed to save error log to database:', error);
    }
  }
}