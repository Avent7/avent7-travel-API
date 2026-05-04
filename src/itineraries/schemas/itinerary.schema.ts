import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { ItineraryStatus } from '../enums/itinerary.enum';

export type ItineraryDocument = HydratedDocument<Itinerary>;

@Schema({ timestamps: true })
export class Itinerary {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true })
  agencyId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Passenger', required: true })
  passengerId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Briefing', default: null })
  briefingId: mongoose.Types.ObjectId | null;

  @Prop({ required: true, unique: true, trim: true })
  itineraryCode: string;

  @Prop({ default: null })
  title: string | null;

  @Prop({ enum: ItineraryStatus, default: ItineraryStatus.DRAFT })
  status: ItineraryStatus;

  @Prop({ default: null })
  startDate: Date | null;

  @Prop({ default: null })
  endDate: Date | null;

  @Prop({ default: null })
  totalNights: number | null;

  @Prop({ default: 0 })
  totalCostUsd: number;

  @Prop({ default: 0 })
  totalSaleUsd: number;

  @Prop({ default: 0 })
  totalMarkupUsd: number;

  @Prop({ default: 0 })
  platformFeeUsd: number;

  @Prop({ default: 0 })
  agencyProfitUsd: number;

  @Prop({ default: null })
  heroImageUrl: string | null;

  @Prop({ default: null })
  clientMessage: string | null;

  @Prop({ default: null })
  sentToClientAt: Date | null;

  @Prop({ default: null })
  approvedAt: Date | null;

  @Prop({ default: null })
  bookedAt: Date | null;
}

export const ItinerarySchema = SchemaFactory.createForClass(Itinerary);
ItinerarySchema.index({ agencyId: 1 });
ItinerarySchema.index({ passengerId: 1 });
ItinerarySchema.index({ status: 1 });
