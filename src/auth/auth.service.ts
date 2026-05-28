import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { AgenciesService } from '../agencies/agencies.service';
import { RedisService } from '../redis/redis.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SetupAgencyDto } from './dto/setup-agency.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserRole } from '../users/enums/user-role.enum';

const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const RESET_TTL = 900;          // 15min
const RESET_MAX_ATTEMPTS = 5;   // por código
const RESET_RATE_LIMIT = 3;     // solicitações por janela
const RESET_RATE_TTL = 3600;    // 1h

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly agenciesService: AgenciesService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  // ─── Register ─────────────────────────────────────────────────────────────

  async register(dto: RegisterDto, res: Response) {
    const user = await this.usersService.create(
      { name: dto.name, email: dto.email, password: dto.password, role: UserRole.ADMIN },
      dto.agencyId ?? null,
      null,
    );

    const tokens = await this.generateTokens(user.id, user.email, user.agencyId, user.role as UserRole);
    await this.redisService.setSession(user.id, tokens.accessToken);
    this.setRefreshCookie(res, tokens.refreshToken);

    return { access_token: tokens.accessToken };
  }

  // ─── Setup Agency ─────────────────────────────────────────────────────────

  async setupAgency(userId: string, dto: SetupAgencyDto, res: Response) {
    const user = await this.usersService.findById(userId);
    if (user.agencyId) throw new BadRequestException('Usuário já possui uma agência vinculada.');

    const agency = await this.agenciesService.create(dto);
    const updated = await this.usersService.updateAgencyId(userId, agency.id);

    const tokens = await this.generateTokens(updated.id, updated.email, agency.id, updated.role as UserRole);
    await this.redisService.setSession(updated.id, tokens.accessToken);
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

  // ─── Password reset ───────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.toLowerCase();
    const genericResponse = {
      message: 'Se o e-mail estiver cadastrado, enviaremos as instruções.',
    };

    // Rate limit (anti-enumeração + anti-spam)
    const rateKey = `pwd-reset-rate:${email}`;
    const client = this.redisService.getClient();
    const attempts = await client.incr(rateKey);
    if (attempts === 1) await client.expire(rateKey, RESET_RATE_TTL);
    if (attempts > RESET_RATE_LIMIT) return genericResponse;

    // Buscar usuário silenciosamente (não vazar existência ao cliente)
    const user = await this.usersService.findByEmail(email).catch(() => null);
    if (!user) {
      this.logger.warn(`[DEV] Forgot-password: e-mail não cadastrado (${email}) — nenhum código gerado.`);
      return genericResponse;
    }
    this.logger.log(`[DEV] Forgot-password: usuário encontrado (${email}, id=${user.id}).`);

    // Gerar código 6 dígitos e salvar com TTL
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await this.redisService.set(
      `pwd-reset:${email}`,
      JSON.stringify({ code, attempts: 0 }),
      RESET_TTL,
    );

    // TODO: integrar MailService quando SMTP estiver pronto.
    // Substituir os dois logger.log abaixo por:
    //   await this.mailService.sendResetCode(email, code, magicLink);
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3055');
    const magicLink = `${frontendUrl}/forgot-password?code=${code}&email=${encodeURIComponent(email)}`;
    this.logger.log(`[DEV] Reset code for ${email}: ${code}`);
    this.logger.log(`[DEV] Magic link: ${magicLink}`);

    return genericResponse;
  }

  async verifyResetCode(dto: VerifyResetCodeDto) {
    await this.validateResetCode(dto.email, dto.code);
    return { message: 'Código válido.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    await this.validateResetCode(dto.email, dto.code);

    const email = dto.email.toLowerCase();
    const user = await this.usersService.findByEmail(email);
    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.updatePassword(user.id, hashed);

    // Consome o código + invalida sessões ativas
    await this.redisService.del(`pwd-reset:${email}`);
    await this.redisService.deleteSession(user.id);

    return { message: 'Senha redefinida com sucesso.' };
  }

  private async validateResetCode(email: string, code: string): Promise<void> {
    const key = `pwd-reset:${email.toLowerCase()}`;
    const raw = await this.redisService.get(key);
    if (!raw) throw new UnauthorizedException('Código inválido ou expirado.');

    const data = JSON.parse(raw) as { code: string; attempts: number };

    if (data.attempts >= RESET_MAX_ATTEMPTS) {
      await this.redisService.del(key);
      throw new UnauthorizedException('Muitas tentativas. Solicite um novo código.');
    }

    if (data.code !== code) {
      data.attempts++;
      const ttl = await this.redisService.getClient().ttl(key);
      await this.redisService.set(key, JSON.stringify(data), ttl > 0 ? ttl : RESET_TTL);
      throw new UnauthorizedException('Código inválido.');
    }
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
