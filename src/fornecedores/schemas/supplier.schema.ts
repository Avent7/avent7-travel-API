import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { SupplierCategory } from '../enums/supplier.enum';

export type SupplierDocument = HydratedDocument<Supplier>;

@Schema({ timestamps: true })
export class Supplier {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true, index: true })
  agencyId: mongoose.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: [String], enum: SupplierCategory, default: [] })
  categories: SupplierCategory[];

  @Prop({ default: 'USD', trim: true })
  currency: string;

  @Prop({ default: null, lowercase: true, trim: true })
  email: string | null;

  @Prop({ default: null })
  phone: string | null;

  @Prop({ default: null })
  website: string | null;

  @Prop({ default: null })
  city: string | null;

  @Prop({ default: null })
  state: string | null;

  @Prop({ default: null })
  country: string | null;

  @Prop({ default: null })
  logoUrl: string | null;

  @Prop({ default: null })
  notes: string | null;

  @Prop({ default: true })
  isActive: boolean;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
SupplierSchema.index({ agencyId: 1 });
SupplierSchema.index({ agencyId: 1, categories: 1 });
