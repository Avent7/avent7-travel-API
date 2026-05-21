import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROPOSTA_REPOSITORY, IPropostaRepository } from './interfaces/proposta.repository.interface';
import { IProposta } from './interfaces/proposta.interface';
import { IPropostaBlock } from '../proposta-blocks/interfaces/proposta-block.interface';
import { CreatePropostaDto } from './dto/create-proposta.dto';
import { UpdatePropostaDto } from './dto/update-proposta.dto';
import { CreateBlockDto } from '../proposta-blocks/dto/create-block.dto';
import { UpdateBlockDto } from '../proposta-blocks/dto/update-block.dto';

@Injectable()
export class PropostasService {
  constructor(
    @Inject(PROPOSTA_REPOSITORY) private readonly repo: IPropostaRepository,
  ) {}

  private generateCode(): string {
    const ts = Date.now().toString(36).toUpperCase();
    return `PRO-${ts}`;
  }

  // ── Proposta CRUD ─────────────────────────────────────────────────────────────

  async findAll(agencyId: string): Promise<IProposta[]> {
    return this.repo.findAll(agencyId);
  }

  async findByViagem(agencyId: string, viagemId: string): Promise<IProposta[]> {
    return this.repo.findByViagem(agencyId, viagemId);
  }

  async findById(id: string): Promise<IProposta> {
    const proposta = await this.repo.findById(id);
    if (!proposta) throw new NotFoundException('Proposta não encontrada.');
    return proposta;
  }

  async create(dto: CreatePropostaDto, agencyId: string): Promise<IProposta> {
    const propostaCode = this.generateCode();
    return this.repo.create({ ...dto, agencyId, propostaCode });
  }

  async update(id: string, dto: UpdatePropostaDto): Promise<IProposta> {
    const current = await this.repo.findById(id);
    if (!current) throw new NotFoundException('Proposta não encontrada.');

    // Recalcula totalNights quando startDate ou endDate mudam — mantém
    // a contagem de noites/dias do roteiro sincronizada com o período da viagem.
    const finalDto: UpdatePropostaDto = { ...dto };
    if (dto.startDate !== undefined || dto.endDate !== undefined) {
      const startSrc = dto.startDate ?? current.startDate;
      const endSrc = dto.endDate ?? current.endDate;
      if (startSrc && endSrc) {
        const startMs = new Date(startSrc).getTime();
        const endMs = new Date(endSrc).getTime();
        if (!isNaN(startMs) && !isNaN(endMs)) {
          finalDto.totalNights = Math.max(
            0,
            Math.round((endMs - startMs) / 86_400_000),
          );
        }
      }
    }

    const updated = await this.repo.update(id, finalDto);
    if (!updated) throw new NotFoundException('Proposta não encontrada.');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.repo.remove(id);
    if (!deleted) throw new NotFoundException('Proposta não encontrada.');
  }

  // ── Block operations (embedded) ───────────────────────────────────────────────

  async findBlocks(propostaId: string): Promise<IPropostaBlock[]> {
    return this.repo.findBlocks(propostaId);
  }

  async findBlockById(propostaId: string, blockId: string): Promise<IPropostaBlock> {
    const block = await this.repo.findBlockById(propostaId, blockId);
    if (!block) throw new NotFoundException('Bloco não encontrado.');
    return block;
  }

  async addBlock(propostaId: string, dto: CreateBlockDto): Promise<IPropostaBlock> {
    return this.repo.addBlock(propostaId, dto);
  }

  async updateBlock(propostaId: string, blockId: string, dto: UpdateBlockDto): Promise<IPropostaBlock> {
    const updated = await this.repo.updateBlock(propostaId, blockId, dto);
    if (!updated) throw new NotFoundException('Bloco não encontrado.');
    return updated;
  }

  async reorderBlocks(propostaId: string, orderedIds: string[]): Promise<IPropostaBlock[]> {
    return this.repo.reorderBlocks(propostaId, orderedIds);
  }

  async removeBlock(propostaId: string, blockId: string): Promise<void> {
    const removed = await this.repo.removeBlock(propostaId, blockId);
    if (!removed) throw new NotFoundException('Bloco não encontrado.');
  }
}
