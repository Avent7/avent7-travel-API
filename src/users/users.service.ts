import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IUserRepository, USER_REPOSITORY } from './interfaces/user.repository.interface';
import { IUser } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
  ) {}

  async findAll(agencyId: string): Promise<Omit<IUser, 'password'>[]> {
    const users = await this.userRepo.findAll(agencyId);
    return users.map(({ password: _, ...u }) => u);
  }

  async findById(id: string): Promise<Omit<IUser, 'password'>> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado.');
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
    agencyId: string,
  ): Promise<Omit<IUser, 'password'>> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email já está em uso.');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepo.create({ ...dto, password: hashed, agencyId });
    const { password: _, ...result } = user;
    return result;
  }

  async update(id: string, dto: UpdateUserDto): Promise<Omit<IUser, 'password'>> {
    const updated = await this.userRepo.update(id, dto);
    if (!updated) throw new NotFoundException('Usuário não encontrado.');
    const { password: _, ...result } = updated;
    return result;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.userRepo.remove(id);
    if (!deleted) throw new NotFoundException('Usuário não encontrado.');
  }
}
