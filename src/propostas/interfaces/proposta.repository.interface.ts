import { IProposta } from './proposta.interface';
import { IPropostaBlock } from '../../proposta-blocks/interfaces/proposta-block.interface';
import { CreatePropostaDto } from '../dto/create-proposta.dto';
import { UpdatePropostaDto } from '../dto/update-proposta.dto';
import { CreateBlockDto } from '../../proposta-blocks/dto/create-block.dto';
import { UpdateBlockDto } from '../../proposta-blocks/dto/update-block.dto';

export const PROPOSTA_REPOSITORY = Symbol('IPropostaRepository');

export interface IPropostaRepository {
  findAll(agencyId: string): Promise<IProposta[]>;
  findByViagem(agencyId: string, viagemId: string): Promise<IProposta[]>;
  findById(id: string): Promise<IProposta | null>;
  create(dto: CreatePropostaDto & { agencyId: string; propostaCode: string }): Promise<IProposta>;
  update(id: string, dto: UpdatePropostaDto): Promise<IProposta | null>;
  remove(id: string): Promise<boolean>;

  // Block methods (embedded)
  findBlocks(propostaId: string): Promise<IPropostaBlock[]>;
  findBlockById(propostaId: string, blockId: string): Promise<IPropostaBlock | null>;
  addBlock(propostaId: string, dto: CreateBlockDto): Promise<IPropostaBlock>;
  updateBlock(propostaId: string, blockId: string, dto: UpdateBlockDto): Promise<IPropostaBlock | null>;
  reorderBlocks(propostaId: string, orderedIds: string[]): Promise<IPropostaBlock[]>;
  removeBlock(propostaId: string, blockId: string): Promise<boolean>;

  /** Remove (cascade) a referência a um fornecedor de todos os blocos. Retorna nº de propostas afetadas. */
  unsetSupplierFromBlocks(supplierId: string): Promise<number>;
}
