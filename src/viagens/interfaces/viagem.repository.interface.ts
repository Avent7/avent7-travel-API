import { IViagem } from './viagem.interface';
import { IPipelineColumnData, IPipelineResponse, IPipelineViagem } from './pipeline-viagem.interface';
import { CreateViagemDto } from '../dto/create-viagem.dto';
import { UpdateViagemDto } from '../dto/update-viagem.dto';
import { ViagemQueryDto } from '../dto/viagem-query.dto';
import { ViagemStatus } from '../enums/viagem.enum';
import { PagedResult } from '../../common/types/paged-result.type';

export const VIAGEM_REPOSITORY = Symbol('IViagemRepository');

export interface IViagemRepository {
  findPaged(agencyId: string, query: ViagemQueryDto): Promise<PagedResult<IPipelineViagem>>;
  findAll(agencyId: string): Promise<IViagem[]>;
  findPipelineAll(agencyId: string, pageSize: number): Promise<IPipelineResponse>;
  findPipelineColumn(agencyId: string, status: ViagemStatus, page: number, pageSize: number): Promise<IPipelineColumnData>;
  findByClient(agencyId: string, clientId: string): Promise<IViagem[]>;
  findById(id: string): Promise<IViagem | null>;
  create(dto: CreateViagemDto & { agencyId: string; viagemCode: string; createdByUserId: string | null }): Promise<IViagem>;
  update(id: string, dto: UpdateViagemDto): Promise<IViagem | null>;
  remove(id: string): Promise<boolean>;
}
