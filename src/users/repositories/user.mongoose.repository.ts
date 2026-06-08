import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { IUserRepository, FindUsersParams, PaginatedUsers } from '../interfaces/user.repository.interface';
import { IUser } from '../interfaces/user.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserRole } from '../enums/user-role.enum';

type MongoUser = User & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date };

@Injectable()
export class UserMongooseRepository implements IUserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  private toIUser(doc: MongoUser): IUser {
    return {
      id: doc._id.toString(),
      agencyId: doc.agencyId?.toString() ?? null,
      name: doc.name,
      email: doc.email,
      password: (doc as any).password ?? '',
      role: doc.role as UserRole,
      profileImageUrl: doc.profileImageUrl ?? null,
      isActive: doc.isActive,
      tourCompleted: doc.tourCompleted ?? false,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findAll(agencyId: string, params: FindUsersParams): Promise<PaginatedUsers<IUser>> {
    const { page, limit, role, status, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const baseFilter: Record<string, unknown> = {
      agencyId: new Types.ObjectId(agencyId),
      role: { $ne: UserRole.SUPERADMIN },
    };

    const dataFilter: Record<string, unknown> = { ...baseFilter };
    if (role && role !== 'all') dataFilter.role = role;
    if (status === 'active') dataFilter.isActive = true;
    else if (status === 'inactive') dataFilter.isActive = false;

    const allowedSort = ['name', 'role', 'isActive', 'email', 'createdAt'];
    const sortField = sortBy && allowedSort.includes(sortBy) ? sortBy : 'createdAt';
    const sort: Record<string, 1 | -1> = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

    const [countResult, docs, total] = await Promise.all([
      this.userModel.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: null,
            admins: { $sum: { $cond: [{ $eq: ['$role', UserRole.ADMIN] }, 1, 0] } },
            employees: { $sum: { $cond: [{ $eq: ['$role', UserRole.EMPLOYEE] }, 1, 0] } },
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
            inactive: { $sum: { $cond: [{ $not: '$isActive' }, 1, 0] } },
          },
        },
      ]),
      this.userModel.find(dataFilter).sort(sort).skip(skip).limit(limit).lean<MongoUser[]>(),
      this.userModel.countDocuments(dataFilter),
    ]);

    const c = countResult[0] ?? { admins: 0, employees: 0, active: 0, inactive: 0 };

    return {
      data: docs.map((d) => this.toIUser(d)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      counts: {
        byRole: { admin: c.admins, employee: c.employees },
        byStatus: { active: c.active, inactive: c.inactive },
      },
    };
  }

  async findById(id: string): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.userModel.findById(id).lean<MongoUser>();
    return doc ? this.toIUser(doc) : null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const doc = await this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password')
      .lean<MongoUser>();
    return doc ? this.toIUser(doc) : null;
  }

  async create(dto: CreateUserDto & { agencyId: string | null }): Promise<IUser> {
    const created = await this.userModel.create({
      ...dto,
      agencyId: dto.agencyId ? new Types.ObjectId(dto.agencyId) : null,
    });
    const doc = await this.userModel
      .findById(created._id)
      .select('+password')
      .lean<MongoUser>();
    return this.toIUser(doc!);
  }

  async update(id: string, dto: UpdateUserDto): Promise<IUser | null> {
    const doc = await this.userModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean<MongoUser>();
    return doc ? this.toIUser(doc) : null;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id);
    return !!result;
  }
}
