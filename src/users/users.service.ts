import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as sharp from 'sharp';
import { IUserRepository, USER_REPOSITORY } from './interfaces/user.repository.interface';
import { IUser } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserRole } from './enums/user-role.enum';
import { S3Service } from '../storage/s3.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    private readonly s3: S3Service,
  ) {}

  async findAll(agencyId: string): Promise<Omit<IUser, 'password'>[]> {
    const users = await this.userRepo.findAll(agencyId);
    return users
      .filter(u => u.role !== UserRole.SUPERADMIN)
      .map(({ password: _, ...u }) => u);
  }

  async findById(
    id: string,
    requesterRole?: string | null,
    requesterAgencyId?: string | null,
  ): Promise<Omit<IUser, 'password'>> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    if (requesterRole === UserRole.ADMIN) {
      if (user.role === UserRole.SUPERADMIN) throw new ForbiddenException('Acesso negado.');
      if (user.agencyId !== requesterAgencyId) throw new ForbiddenException('Acesso negado.');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async findByEmail(email: string): Promise<IUser> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }

  async create(
    dto: CreateUserDto,
    agencyId: string | null,
    requesterRole: string | null,
  ): Promise<Omit<IUser, 'password'>> {
    if (dto.role === UserRole.SUPERADMIN) {
      if (agencyId) throw new BadRequestException('Superadmin não pode ter agência associada.');
      if (requesterRole !== UserRole.SUPERADMIN) {
        throw new ForbiddenException('Apenas superadmins podem criar outros superadmins.');
      }
    }

    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email já está em uso.');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepo.create({ ...dto, password: hashed, agencyId: agencyId! });
    const { password: _, ...result } = user;
    return result;
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    requesterRole?: string | null,
    requesterAgencyId?: string | null,
  ): Promise<Omit<IUser, 'password'>> {
    const target = await this.userRepo.findById(id);
    if (!target) throw new NotFoundException('Usuário não encontrado.');

    if (requesterRole === UserRole.ADMIN) {
      if (target.role === UserRole.SUPERADMIN) throw new ForbiddenException('Acesso negado.');
      if (target.agencyId !== requesterAgencyId) throw new ForbiddenException('Acesso negado.');
      if (dto.role === UserRole.SUPERADMIN) throw new ForbiddenException('Acesso negado.');
    }

    const updated = await this.userRepo.update(id, dto);
    if (!updated) throw new NotFoundException('Usuário não encontrado.');
    const { password: _, ...result } = updated;
    return result;
  }

  async remove(
    id: string,
    requesterRole?: string | null,
    requesterAgencyId?: string | null,
  ): Promise<void> {
    const target = await this.userRepo.findById(id);
    if (!target) throw new NotFoundException('Usuário não encontrado.');

    if (requesterRole === UserRole.ADMIN) {
      if (target.role === UserRole.SUPERADMIN) throw new ForbiddenException('Acesso negado.');
      if (target.agencyId !== requesterAgencyId) throw new ForbiddenException('Acesso negado.');
    }

    const deleted = await this.userRepo.remove(id);
    if (!deleted) throw new NotFoundException('Usuário não encontrado.');
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    const updated = await this.userRepo.update(id, { password: hashedPassword } as any);
    if (!updated) throw new NotFoundException('Usuário não encontrado.');
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const profile = await this.userRepo.findById(id);
    if (!profile) throw new NotFoundException('Usuário não encontrado.');

    const userWithPassword = await this.userRepo.findByEmail(profile.email);
    if (!userWithPassword?.password) throw new NotFoundException('Usuário não encontrado.');

    const match = await bcrypt.compare(dto.currentPassword, userWithPassword.password);
    if (!match) throw new UnauthorizedException('Senha atual incorreta.');

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepo.update(id, { password: hashed } as any);
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<Omit<IUser, 'password'>> {
    if (!file?.buffer?.length) throw new BadRequestException('Nenhum arquivo enviado.');
    if (!file.mimetype.startsWith('image/')) throw new BadRequestException('Arquivo deve ser uma imagem.');

    const webp = await (sharp as any)(file.buffer)
      .rotate()
      .resize(512, 512, { fit: 'cover' })
      .webp({ quality: 86 })
      .toBuffer();

    const key = `avatars/users/${userId}.webp`;
    const url = await this.s3.uploadFile(key, webp, 'image/webp');
    const profileImageUrl = `${url}?v=${Date.now()}`;

    const updated = await this.userRepo.update(userId, { profileImageUrl });
    if (!updated) throw new NotFoundException('Usuário não encontrado.');
    const { password: _, ...result } = updated;
    return result;
  }
}
