import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { BookingStatus, Provider } from '../enums/booking.enum';

export type BookingDocument = HydratedDocument<Booking>;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true })
  agencyId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary', default: null })
  itineraryId: mongoose.Types.ObjectId | null;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ItineraryBlock', default: null })
  blockId: mongoose.Types.ObjectId | null;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Passenger', default: null })
  passengerId: mongoose.Types.ObjectId | null;

  @Prop({ enum: Provider, required: true })
  provider: Provider;

  @Prop({ default: null })
  providerBookingRef: string | null;

  @Prop({ enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Prop({ required: true })
  netCostUsd: number;

  @Prop({ required: true })
  saleUsd: number;

  @Prop({ required: true })
  markupUsd: number;

  @Prop({ required: true })
  platformFeeUsd: number;

  @Prop({ required: true })
  agencyProfitUsd: number;

  @Prop({ default: 0 })
  serviceFeeUsd: number;

  @Prop({ type: Object, default: null })
  pricingSnapshot: {
    markupPct: number;
    platformTakeRatePct: number;
    serviceFeeMode: 'fixed' | 'pct';
    serviceFeeValue: number;
  } | null;

  @Prop({ default: null })
  confirmedAt: Date | null;

  @Prop({ default: null })
  cancelledAt: Date | null;

  @Prop({ default: null })
  refundedAt: Date | null;

  @Prop({ default: null })
  notes: string | null;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
BookingSchema.index({ agencyId: 1 });
BookingSchema.index({ itineraryId: 1 });
BookingSchema.index({ passengerId: 1 });
BookingSchema.index({ status: 1 });
