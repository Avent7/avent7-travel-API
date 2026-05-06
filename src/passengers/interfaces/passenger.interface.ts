import { Gender } from '../enums/passenger.enum';

export interface IPassenger {
  id: string;
  clientId: string;
  agencyId: string;
  fullName: string;
  socialName: string | null;
  dateOfBirth: Date | null;
  gender: Gender | null;
  nationality: string | null;
  documents: {
    passportNumber?: string;
    passportExpiry?: Date;
    passportCountry?: string;
    visaInfo?: string;
  };
  travelPreferences: Record<string, any>;
  emergencyContact: Record<string, string | undefined>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
