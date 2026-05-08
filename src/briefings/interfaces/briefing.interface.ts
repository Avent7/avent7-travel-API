import { BriefingDocumentStatus, BriefingStatus, TripStyle, TripType } from '../enums/briefing.enum';

export interface IClientInfo {
  name: string;
  email: string;
  phone?: string;
  cityRegion?: string;
}

export interface IBriefing {
  id: string;
  agencyId: string;
  viagemId: string | null;
  templateId: string | null;
  publicUrl: string | null;
  answers: Record<string, unknown> | null;
  clientInfo: IClientInfo | null;
  briefingDocumentStatus: BriefingDocumentStatus;
  note: string | null;
  expiresAt: Date | null;
  passengerId: string | null;
  status: BriefingStatus;
  // Legacy fields
  tripType: TripType | null;
  tripStyle: TripStyle | null;
  destinations: string[];
  startDate: Date | null;
  endDate: Date | null;
  totalNights: number | null;
  adultCount: number;
  childCount: number;
  budgetUsd: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
