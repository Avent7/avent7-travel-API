import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Gender } from '../enums/passenger.enum';

export type PassengerDocument = HydratedDocument<Passenger>;

@Schema({ timestamps: true })
export class Passenger {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true })
  clientId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true })
  agencyId: mongoose.Types.ObjectId;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ default: null })
  socialName: string | null;

  @Prop({ default: null })
  dateOfBirth: Date | null;

  @Prop({ enum: Gender, default: null })
  gender: Gender | null;

  @Prop({ default: null })
  nationality: string | null;

  @Prop({ type: Object, default: {} })
  documents: {
    passportNumber?: string;
    passportExpiry?: Date;
    passportCountry?: string;
    visaInfo?: string;
  };

  @Prop({ type: Object, default: {} })
  travelPreferences: {
    preferredCabinClass?: 'economy' | 'business' | 'first';
    preferredSeat?: 'window' | 'aisle' | 'no_preference';
    dietaryRestrictions?: string[];
    accessibilityNeeds?: string[];
    preferredHotelCategory?: 3 | 4 | 5;
    internalNotes?: string;
  };

  @Prop({ type: Object, default: {} })
  emergencyContact: {
    name?: string;
    relationship?: string;
    phone?: string;
  };

  @Prop({ default: true })
  isActive: boolean;
}

export const PassengerSchema = SchemaFactory.createForClass(Passenger);
PassengerSchema.index({ clientId: 1 });
PassengerSchema.index({ agencyId: 1 });
