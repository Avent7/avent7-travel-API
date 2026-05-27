import { ViagemStatus } from '../enums/viagem.enum';

export interface IPipelineClient {
  id: string;
  name: string;
  photoUrl: string | null;
}

export interface IPipelineOperator {
  id: string;
  name: string;
  profileImageUrl: string | null;
}

export interface IPipelineViagem {
  id: string;
  agencyId: string;
  clientId: string;
  passengerId: string | null;
  createdByUserId: string | null;
  viagemCode: string;
  title: string;
  status: ViagemStatus;
  coverImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  client: IPipelineClient | null;
  operator: IPipelineOperator | null;
  counts: { briefings: number; propostas: number };
}

export interface IPipelineColumnData {
  status: ViagemStatus;
  viagens: IPipelineViagem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface IPipelineResponse {
  columns: IPipelineColumnData[];
}
