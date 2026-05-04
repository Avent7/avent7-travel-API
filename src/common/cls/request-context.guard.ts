import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RequestContextService } from './request-context.service';

@Injectable()
export class RequestContextGuard implements CanActivate {
  constructor(private readonly requestContextService: RequestContextService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (request.user) {
      this.requestContextService.setUser(request.user);
    }
    return true;
  }
}
