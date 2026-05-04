import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { BriefingStatus, TripStyle, TripType } from '../enums/briefing.enum';

export type BriefingDocument = HydratedDocument<Briefing>;

@Schema({ timestamps: true })
export class Briefing {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true })
  agencyId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Passenger', required: true })
  passengerId: mongoose.Types.ObjectId;

  @Prop({ enum: BriefingStatus, default: BriefingStatus.DRAFT })
  status: BriefingStatus;

  @Prop({ enum: TripType, required: true })
  tripType: TripType;

  @Prop({ enum: TripStyle, required: true })
  tripStyle: TripStyle;

  @Prop({ type: [String], default: [] })
  destinations: string[];

  @Prop({ default: null })
  startDate: Date | null;

  @Prop({ default: null })
  endDate: Date | null;

  @Prop({ default: null })
  totalNights: number | null;

  @Prop({ required: true, default: 1 })
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
BriefingSchema.index({ passengerId: 1 });
BriefingSchema.index({ status: 1 });
