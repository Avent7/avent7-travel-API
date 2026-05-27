import { Gender } from '../enums/passenger.enum';
import { IClientSegmentWithCount } from '../../client-segments/interfaces/client-segment.interface';

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
  photoUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPassengerClientSegment {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface IPassengerClient {
  id: string;
  clientCode: string;
  fullName: string;
  socialName: string | null;
  emailPrimary: string;
  phonePrimary: string | null;
  photoUrl: string | null;
  segmentId: string | null;
  segment: IPassengerClientSegment | null;
}

export interface IPassengerWithClient extends IPassenger {
  client: IPassengerClient | null;
}

export interface IPassengerPage {
  data: IPassengerWithClient[];
  total: number;
  page: number;
  limit: number;
  segments: IClientSegmentWithCount[];
}
