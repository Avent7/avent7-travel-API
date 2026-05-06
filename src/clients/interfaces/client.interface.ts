import { ClientSegment, DocumentType, Gender } from '../enums/client.enum';

export interface IPrimaryDocument {
  type: DocumentType;
  number: string;
  country: string;
}

export interface IClient {
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
  primaryDocument: IPrimaryDocument | null;
  travelPreferences: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
