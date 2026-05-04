import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class RequestContextService {
  constructor(private readonly cls: ClsService) {}

  private getAuthUser(): { userId?: string; role?: string; agencyId?: string } | null {
    return this.cls.get('authUser') as any;
  }

  setUser(user: any): void {
    this.cls.set('authUser', user);
  }

  getUserId(): string | null {
    return this.getAuthUser()?.userId ?? null;
  }

  getUserRole(): string | null {
    return this.getAuthUser()?.role ?? null;
  }

  getAgencyId(): string | null {
    return this.getAuthUser()?.agencyId ?? null;
  }

  getRequestId(): string {
    return this.cls.getId() ?? 'unknown';
  }
}
