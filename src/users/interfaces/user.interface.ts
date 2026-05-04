import { UserRole } from '../enums/user-role.enum';

export interface IUser {
  id: string;
  agencyId: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  profileImageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
