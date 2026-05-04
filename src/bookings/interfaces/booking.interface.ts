import { BookingStatus, Provider } from '../enums/booking.enum';

export interface IBooking {
  id: string;
  agencyId: string;
  itineraryId: string | null;
  blockId: string | null;
  passengerId: string | null;
  provider: Provider;
  providerBookingRef: string | null;
  status: BookingStatus;
  netCostUsd: number;
  saleUsd: number;
  markupUsd: number;
  platformFeeUsd: number;
  agencyProfitUsd: number;
  serviceFeeUsd: number;
  pricingSnapshot: Record<string, any> | null;
  confirmedAt: Date | null;
  cancelledAt: Date | null;
  refundedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
