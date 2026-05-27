import { IClient } from './client.interface';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { ClientQueryDto } from '../dto/client-query.dto';
import { PagedResult } from '../../common/types/paged-result.type';

export const CLIENT_REPOSITORY = Symbol('IClientRepository');

export interface IClientRepository {
  findAll(agencyId: string): Promise<IClient[]>;
  findPaged(agencyId: string, query: ClientQueryDto): Promise<PagedResult<IClient>>;
  findById(id: string): Promise<IClient | null>;
  findByClientCode(clientCode: string): Promise<IClient | null>;
  create(dto: CreateClientDto & { agencyId: string; clientCode: string }): Promise<IClient>;
  update(id: string, dto: UpdateClientDto): Promise<IClient | null>;
  remove(id: string): Promise<boolean>;
  incrementCount(id: string, field: 'tripCount' | 'passengerCount', delta: 1 | -1): Promise<void>;
}
