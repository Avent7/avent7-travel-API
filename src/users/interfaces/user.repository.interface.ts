import { IUser } from './user.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

export const USER_REPOSITORY = Symbol('IUserRepository');

export interface FindUsersParams {
  page: number;
  limit: number;
  role?: string;
  status?: string;
}

export interface UserAggregateCounts {
  byRole: { admin: number; employee: number };
  byStatus: { active: number; inactive: number };
}

export interface PaginatedUsers<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: UserAggregateCounts;
}

export interface IUserRepository {
  findAll(agencyId: string, params: FindUsersParams): Promise<PaginatedUsers<IUser>>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  create(dto: CreateUserDto & { agencyId: string }): Promise<IUser>;
  update(id: string, dto: UpdateUserDto): Promise<IUser | null>;
  remove(id: string): Promise<boolean>;
}
