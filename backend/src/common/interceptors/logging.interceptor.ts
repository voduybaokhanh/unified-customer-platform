// backend/src/common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CustomLoggerService } from '../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, user, ip } = request;
    const userAgent = request.get('User-Agent') || '';
    const now = Date.now();

    // Log incoming request
    this.logger.http(
      `Incoming Request: ${method} ${url}`,
      'HTTP',
      {
        method,
        url,
        ip,
        userAgent,
        userId: user?.id,
        userEmail: user?.email,
        body: this.sanitizeBody(body),
      }
    );

    return next.handle().pipe(
      tap(() => {
        const delay = Date.now() - now;
        
        // Log successful response
        this.logger.http(
          `Outgoing Response: ${method} ${url} - ${response.statusCode}`,
          'HTTP',
          {
            method,
            url,
            statusCode: response.statusCode,
            duration: `${delay}ms`,
            ip,
            userId: user?.id,
          }
        );
      }),
      catchError((error) => {
        const delay = Date.now() - now;
        
        // Log error response
        this.logger.error(
          `Request Error: ${method} ${url} - ${error.status || 500}`,
          error.stack,
          'HTTP',
        );
        
        this.logger.http(
          `Error Response: ${method} ${url} - ${error.status || 500}`,
          'HTTP',
          {
            method,
            url,
            statusCode: error.status || 500,
            duration: `${delay}ms`,
            ip,
            userId: user?.id,
            error: error.message,
          }
        );

        return throwError(() => error);
      })
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    const sanitized = { ...body };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'refreshToken', 'secret', 'key'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}