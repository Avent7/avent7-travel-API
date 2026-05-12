import { Injectable } from '@nestjs/common';
import { PropostasService } from '../propostas/propostas.service';
import { IPropostaBlock } from './interfaces/proposta-block.interface';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';

@Injectable()
export class PropostaBlocksService {
  constructor(private readonly propostasService: PropostasService) {}

  findByProposta(propostaId: string): Promise<IPropostaBlock[]> {
    return this.propostasService.findBlocks(propostaId);
  }

  findById(propostaId: string, blockId: string): Promise<IPropostaBlock> {
    return this.propostasService.findBlockById(propostaId, blockId);
  }

  create(propostaId: string, dto: CreateBlockDto): Promise<IPropostaBlock> {
    return this.propostasService.addBlock(propostaId, dto);
  }

  update(propostaId: string, blockId: string, dto: UpdateBlockDto): Promise<IPropostaBlock> {
    return this.propostasService.updateBlock(propostaId, blockId, dto);
  }

  reorder(propostaId: string, orderedIds: string[]): Promise<IPropostaBlock[]> {
    return this.propostasService.reorderBlocks(propostaId, orderedIds);
  }

  async remove(propostaId: string, blockId: string): Promise<void> {
    return this.propostasService.removeBlock(propostaId, blockId);
  }
}
