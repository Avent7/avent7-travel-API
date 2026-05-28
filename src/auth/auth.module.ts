import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersModule } from '../users/users.module';
import { AgenciesModule } from '../agencies/agencies.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}), // secrets provided per-call in service
    UsersModule,
    AgenciesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshTokenStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
