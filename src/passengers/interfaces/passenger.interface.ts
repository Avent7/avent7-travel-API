import { ClientSegment, Gender } from '../enums/passenger.enum';

export interface IPassenger {
  id: string;
  agencyId: string;
  clientCode: string;
  fullName: string;
  socialName: string | null;
  dateOfBirth: Date | null;
  gender: Gender | null;
  nationality: string | null;
  profession: string | null;
  company: string | null;
  segment: ClientSegment;
  photoUrl: string | null;
  emailPrimary: string;
  emailSecondary: string | null;
  phonePrimary: string | null;
  phoneAlternative: string | null;
  address: Record<string, string | undefined>;
  emergencyContact: Record<string, string | undefined>;
  documents: Record<string, string | undefined>;
  travelPreferences: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
