import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from './logger.service';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
  // Sensitive fields that should be redacted from logs
  private readonly sensitiveFields = [
    'password',
    'token',
    'secret',
    'authorization',
    'accesstoken',
    'refreshtoken',
  ];

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const requestId = request.headers['x-request-id'] || uuidv4();
    const correlationId = request.headers['x-correlation-id'] || requestId;

    // Add IDs to response headers
    response.set('X-Request-ID', requestId.toString());
    response.set('X-Correlation-ID', correlationId.toString());

    const startTime = Date.now();
    const requestData = this.getRequestData(request);

    this.logger.log({
      message: `Incoming request ${requestData.method} ${requestData.url}`,
      ...requestData,
      requestId,
      correlationId,
    });

    return next.handle().pipe(
      tap({
        next: (responseBody: any) => {
          const responseTime = Date.now() - startTime;
          this.logger.log({
            message: `Request completed ${requestData.method} ${requestData.url}`,
            ...requestData,
            responseTime,
            statusCode: response.statusCode,
            responseBody: this.shouldLogResponseBody(request)
              ? responseBody
              : undefined,
            requestId,
            correlationId,
          });
        },
        error: (error: any) => {
          const responseTime = Date.now() - startTime;
          this.logger.error({
            message: `Request failed ${requestData.method} ${requestData.url}`,
            ...requestData,
            responseTime,
            statusCode: error.status || 500,
            error: {
              message: error.message,
              stack: error.stack,
              name: error.name,
            },
            requestId,
            correlationId,
          });
        },
      }),
    );
  }

  private getRequestData(request: Request) {
    return {
      method: request.method,
      url: request.url,
      query: request.query,
      body: this.redactSensitiveData(request.body),
      userAgent: request.get('user-agent') || '',
      ip: request.ip,
      headers: this.redactSensitiveHeaders(request.headers),
    };
  }

  private redactSensitiveData(data: any): any {
    if (!data) return data;
    if (typeof data !== 'object') return data;

    const redacted = Array.isArray(data) ? [...data] : { ...data };

    for (const [key, value] of Object.entries(redacted)) {
      if (this.sensitiveFields.includes(key.toLowerCase())) {
        redacted[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        redacted[key] = this.redactSensitiveData(value);
      }
    }

    return redacted;
  }

  private redactSensitiveHeaders(headers: any): any {
    const redacted = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie'];

    for (const header of sensitiveHeaders) {
      if (header in redacted) {
        redacted[header] = '[REDACTED]';
      }
    }
    return redacted;
  }

  private shouldLogResponseBody(request: Request): boolean {
    // Only log response bodies for non-GET requests or when explicitly requested
    return (
      request.method !== 'GET' || request.headers['x-log-response'] === 'true'
    );
  }
}
