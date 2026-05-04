import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { LOG_OPERATION_KEY } from '../decorators/log-operation.decorator';
import { LogProducer } from '../../logs/log.producer';
import { RequestContextService } from '../cls/request-context.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly logProducer: LogProducer,
    private readonly requestContext: RequestContextService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const now = Date.now();

    const operation = this.reflector.get<string>(
      LOG_OPERATION_KEY,
      context.getHandler(),
    );

    return next.handle().pipe(
      tap(() => {
        const statusCode: number = res.statusCode;
        if (operation && statusCode < 400) {
          this.logProducer
            .enqueue({
              requestId: this.requestContext.getRequestId(),
              level: 'info',
              method: req.method,
              url: req.url,
              statusCode,
              durationMs: Date.now() - now,
              userId: this.requestContext.getUserId(),
              operation,
            })
            .catch(() => {/* fire-and-forget */});
        }
      }),
    );
  }
}
