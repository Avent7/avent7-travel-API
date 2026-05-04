import { IUser } from './user.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

export const USER_REPOSITORY = Symbol('IUserRepository');

export interface IUserRepository {
  findAll(agencyId: string): Promise<IUser[]>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  create(dto: CreateUserDto & { agencyId: string }): Promise<IUser>;
  update(id: string, dto: UpdateUserDto): Promise<IUser | null>;
  remove(id: string): Promise<boolean>;
}
