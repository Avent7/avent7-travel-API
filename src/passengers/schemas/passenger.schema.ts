import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { ClientSegment, Gender } from '../enums/passenger.enum';

export type PassengerDocument = HydratedDocument<Passenger>;

@Schema({ timestamps: true })
export class Passenger {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true })
  agencyId: mongoose.Types.ObjectId;

  @Prop({ required: true, unique: true, trim: true })
  clientCode: string;

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

  @Prop({ default: null })
  profession: string | null;

  @Prop({ default: null })
  company: string | null;

  @Prop({ enum: ClientSegment, default: ClientSegment.BRONZE })
  segment: ClientSegment;

  @Prop({ default: null })
  photoUrl: string | null;

  @Prop({ required: true, lowercase: true, trim: true })
  emailPrimary: string;

  @Prop({ default: null })
  emailSecondary: string | null;

  @Prop({ default: null })
  phonePrimary: string | null;

  @Prop({ default: null })
  phoneAlternative: string | null;

  @Prop({ type: Object, default: {} })
  address: {
    street?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };

  @Prop({ type: Object, default: {} })
  emergencyContact: {
    name?: string;
    relationship?: string;
    phone?: string;
  };

  @Prop({ type: Object, default: {} })
  documents: {
    cpf?: string;
    rg?: string;
    passportNumber?: string;
    passportExpiry?: string;
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

  @Prop({ default: true })
  isActive: boolean;
}

export const PassengerSchema = SchemaFactory.createForClass(Passenger);
PassengerSchema.index({ agencyId: 1 });
PassengerSchema.index({ emailPrimary: 1 });
