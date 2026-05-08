import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { BriefingDocumentStatus, BriefingStatus, TripStyle, TripType } from '../enums/briefing.enum';

export type BriefingDocument = HydratedDocument<Briefing>;

class ClientInfo {
  name: string;
  email: string;
  phone?: string;
  cityRegion?: string;
}

@Schema({ timestamps: true })
export class Briefing {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true })
  agencyId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Viagem', default: null })
  viagemId: mongoose.Types.ObjectId | null;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'BriefingTemplate', default: null })
  templateId: mongoose.Types.ObjectId | null;

  @Prop({ default: null })
  publicUrl: string | null;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: null })
  answers: Record<string, unknown> | null;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: null })
  clientInfo: ClientInfo | null;

  @Prop({ enum: BriefingDocumentStatus, default: BriefingDocumentStatus.PENDING })
  briefingDocumentStatus: BriefingDocumentStatus;

  @Prop({ default: null })
  note: string | null;

  @Prop({ default: null })
  expiresAt: Date | null;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Passenger', default: null })
  passengerId: mongoose.Types.ObjectId | null;

  @Prop({ enum: BriefingStatus, default: BriefingStatus.DRAFT })
  status: BriefingStatus;

  // Legacy fields kept for backward compatibility
  @Prop({ enum: TripType, default: null })
  tripType: TripType | null;

  @Prop({ enum: TripStyle, default: null })
  tripStyle: TripStyle | null;

  @Prop({ type: [String], default: [] })
  destinations: string[];

  @Prop({ default: null })
  startDate: Date | null;

  @Prop({ default: null })
  endDate: Date | null;

  @Prop({ default: null })
  totalNights: number | null;

  @Prop({ default: 1 })
  adultCount: number;

  @Prop({ default: 0 })
  childCount: number;

  @Prop({ default: null })
  budgetUsd: number | null;

  @Prop({ default: null })
  notes: string | null;
}

export const BriefingSchema = SchemaFactory.createForClass(Briefing);
BriefingSchema.index({ agencyId: 1 });
BriefingSchema.index({ viagemId: 1 });
BriefingSchema.index({ status: 1 });
BriefingSchema.index({ templateId: 1 });
