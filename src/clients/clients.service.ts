import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IClientRepository, CLIENT_REPOSITORY } from './interfaces/client.repository.interface';
import { IClient } from './interfaces/client.interface';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly repo: IClientRepository,
  ) {}

  private generateClientCode(): string {
    const ts = Date.now().toString(36).toUpperCase();
    return `AP-${ts}`;
  }

  async findAll(agencyId: string): Promise<IClient[]> {
    return this.repo.findAll(agencyId);
  }

  async findById(id: string): Promise<IClient> {
    const client = await this.repo.findById(id);
    if (!client) throw new NotFoundException('Cliente não encontrado.');
    return client;
  }

  async create(dto: CreateClientDto, agencyId: string): Promise<IClient> {
    const clientCode = this.generateClientCode();
    return this.repo.create({ ...dto, agencyId, clientCode });
  }

  async update(id: string, dto: UpdateClientDto): Promise<IClient> {
    const updated = await this.repo.update(id, dto);
    if (!updated) throw new NotFoundException('Cliente não encontrado.');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.repo.remove(id);
    if (!deleted) throw new NotFoundException('Cliente não encontrado.');
  }
}
