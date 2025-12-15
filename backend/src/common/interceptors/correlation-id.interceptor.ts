import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const existing = request.headers['x-request-id'];
    const correlationId = typeof existing === 'string' && existing.length > 0 ? existing : uuid();

    request.correlationId = correlationId;
    response.setHeader('X-Request-Id', correlationId);

    return next.handle();
  }
}

