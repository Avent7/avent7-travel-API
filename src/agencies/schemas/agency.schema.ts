import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AgencyDocument = HydratedDocument<Agency>;

@Schema({ timestamps: true })
export class Agency {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ enum: ['starter', 'pro', 'enterprise'], default: 'starter' })
  plan: string;

  @Prop({
    type: Object,
    default: {},
  })
  brandConfig: {
    logoUrl?: string;
    primaryColor?: string;
    accentColor?: string;
    customDomain?: string;
    supportEmail?: string;
    supportPhone?: string;
  };

  @Prop({
    type: Object,
    default: {
      defaultMarkupPct: 20,
      platformTakeRatePct: 4,
      minCommissionUsd: 0,
      serviceFeeFixed: 50,
      serviceFeeMode: 'fixed',
    },
  })
  pricingConfig: {
    defaultMarkupPct: number;
    platformTakeRatePct: number;
    minCommissionUsd: number;
    serviceFeeFixed: number;
    serviceFeeMode: 'fixed' | 'pct';
  };

  @Prop({ default: true })
  isActive: boolean;
}

export const AgencySchema = SchemaFactory.createForClass(Agency);
