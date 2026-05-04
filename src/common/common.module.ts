import { Global, Module } from '@nestjs/common';
import { RequestContextService } from './cls/request-context.service';
import { RequestContextGuard } from './cls/request-context.guard';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({
  providers: [
    RequestContextService,
    RequestContextGuard,
    RolesGuard,
  ],
  exports: [
    RequestContextService,
    RequestContextGuard,
    RolesGuard,
  ],
})
export class CommonModule {}
