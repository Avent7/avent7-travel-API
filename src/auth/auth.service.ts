import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../users/enums/user-role.enum';

const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  // ─── Register ─────────────────────────────────────────────────────────────

  async register(dto: RegisterDto, res: Response) {
    const user = await this.usersService.create(
      { name: dto.name, email: dto.email, password: dto.password, role: UserRole.ADMIN },
      dto.agencyId,
    );

    const tokens = await this.generateTokens(user.id, user.email, user.agencyId, user.role as UserRole);
    await this.redisService.setSession(user.id, tokens.accessToken);
    this.setRefreshCookie(res, tokens.refreshToken);

    return { access_token: tokens.accessToken };
  }

  // ─── Login ────────────────────────────────────────────────────────────────

  async login(dto: LoginDto, res: Response) {
    const user = await this.usersService.findByEmail(dto.email).catch(() => {
      throw new UnauthorizedException('Credenciais inválidas.');
    });

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Credenciais inválidas.');

    const tokens = await this.generateTokens(user.id, user.email, user.agencyId, user.role);
    await this.redisService.setSession(user.id, tokens.accessToken);
    this.setRefreshCookie(res, tokens.refreshToken);

    return { access_token: tokens.accessToken };
  }

  // ─── Refresh ──────────────────────────────────────────────────────────────

  async refresh(payload: { sub: string; email: string; agencyId: string; role: UserRole }, res: Response) {
    const tokens = await this.generateTokens(payload.sub, payload.email, payload.agencyId, payload.role);
    await this.redisService.setSession(payload.sub, tokens.accessToken);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { access_token: tokens.accessToken };
  }

  // ─── Logout ───────────────────────────────────────────────────────────────

  async logout(userId: string, res: Response) {
    await this.redisService.deleteSession(userId);
    res.clearCookie('refresh_token');
    return { message: 'Sessão encerrada.' };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async generateTokens(
    userId: string,
    email: string,
    agencyId: string,
    role: UserRole,
  ) {
    const payload = { sub: userId, email, agencyId, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: ACCESS_EXPIRES,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: REFRESH_EXPIRES,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_COOKIE_MAX_AGE,
    });
  }
}
