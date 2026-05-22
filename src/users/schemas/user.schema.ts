import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { UserRole } from '../enums/user-role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: false, default: null })
  agencyId: mongoose.Types.ObjectId | null;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ enum: UserRole, default: UserRole.EMPLOYEE })
  role: UserRole;

  @Prop({ default: null })
  profileImageUrl: string | null;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
