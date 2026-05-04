import { ItineraryStatus } from '../enums/itinerary.enum';

export interface IItinerary {
  id: string;
  agencyId: string;
  passengerId: string;
  briefingId: string | null;
  itineraryCode: string;
  title: string | null;
  status: ItineraryStatus;
  startDate: Date | null;
  endDate: Date | null;
  totalNights: number | null;
  totalCostUsd: number;
  totalSaleUsd: number;
  totalMarkupUsd: number;
  platformFeeUsd: number;
  agencyProfitUsd: number;
  heroImageUrl: string | null;
  clientMessage: string | null;
  sentToClientAt: Date | null;
  approvedAt: Date | null;
  bookedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
