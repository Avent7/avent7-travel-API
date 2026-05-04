import { BriefingStatus, TripStyle, TripType } from '../enums/briefing.enum';

export interface IBriefing {
  id: string;
  agencyId: string;
  passengerId: string;
  status: BriefingStatus;
  tripType: TripType;
  tripStyle: TripStyle;
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
