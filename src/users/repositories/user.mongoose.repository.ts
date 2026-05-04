import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { IUserRepository } from '../interfaces/user.repository.interface';
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
      agencyId: doc.agencyId?.toString() ?? '',
      name: doc.name,
      email: doc.email,
      password: (doc as any).password ?? '',
      role: doc.role as UserRole,
      profileImageUrl: doc.profileImageUrl ?? null,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findAll(agencyId: string): Promise<IUser[]> {
    const docs = await this.userModel
      .find({ agencyId: new Types.ObjectId(agencyId) })
      .lean<MongoUser[]>();
    return docs.map((d) => this.toIUser(d));
  }

  async findById(id: string): Promise<IUser | null> {
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

  async create(dto: CreateUserDto & { agencyId: string }): Promise<IUser> {
    const created = await this.userModel.create({
      ...dto,
      agencyId: new Types.ObjectId(dto.agencyId),
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
