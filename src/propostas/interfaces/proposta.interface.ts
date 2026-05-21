import { PropostaStatus } from '../enums/proposta.enum';
import { IPropostaBlock } from '../../proposta-blocks/interfaces/proposta-block.interface';

export interface IProposta {
  id: string;
  agencyId: string;
  viagemId: string;
  briefingId: string | null;
  propostaCode: string;
  title: string | null;
  status: PropostaStatus;
  startDate: Date | null;
  endDate: Date | null;
  totalNights: number | null;
  totalCostUsd: number;
  totalSaleUsd: number;
  totalMarkupUsd: number;
  platformFeeUsd: number;
  agencyProfitUsd: number;
  heroImageUrl: string | null;
  destinations: string[];
  clientMessage: string | null;
  sentToClientAt: Date | null;
  approvedAt: Date | null;
  bookedAt: Date | null;
  blocks: IPropostaBlock[];
  createdAt: Date;
  updatedAt: Date;
}
