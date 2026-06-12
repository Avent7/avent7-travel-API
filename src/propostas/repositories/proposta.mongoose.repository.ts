import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Proposta, PropostaDocument } from '../schemas/proposta.schema';
import { IPropostaRepository } from '../interfaces/proposta.repository.interface';
import { IProposta } from '../interfaces/proposta.interface';
import { IPropostaBlock } from '../../proposta-blocks/interfaces/proposta-block.interface';
import { BlockType } from '../../proposta-blocks/enums/block.enum';
import { CreatePropostaDto } from '../dto/create-proposta.dto';
import { UpdatePropostaDto } from '../dto/update-proposta.dto';
import { CreateBlockDto } from '../../proposta-blocks/dto/create-block.dto';
import { UpdateBlockDto } from '../../proposta-blocks/dto/update-block.dto';
import { PropostaStatus } from '../enums/proposta.enum';

type MongoBlockSub = {
  _id: Types.ObjectId;
  blockType: string;
  dayNumber: number;
  sortOrder: number;
  saleUsd: number | null;
  blockData: Record<string, any> | null;
  isConfirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type MongoProposta = Proposta & {
  _id: Types.ObjectId;
  briefingId?: Types.ObjectId;
  passengerIds?: Types.ObjectId[];
  clientIsTraveling?: boolean;
  blocks: MongoBlockSub[];
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class PropostaMongooseRepository implements IPropostaRepository {
  constructor(
    @InjectModel(Proposta.name) private readonly model: Model<PropostaDocument>,
  ) {}

  private blockToI(b: MongoBlockSub, propostaId: string): IPropostaBlock {
    return {
      id: b._id.toString(),
      propostaId,
      blockType: b.blockType as BlockType,
      dayNumber: b.dayNumber,
      sortOrder: b.sortOrder,
      title: null,
      description: null,
      imageUrl: null,
      locationName: null,
      costUsd: null,
      saleUsd: b.saleUsd ?? null,
      markupPct: null,
      blockData: b.blockData ?? null,
      isConfirmed: b.isConfirmed,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    };
  }

  private toI(doc: MongoProposta): IProposta {
    const propostaId = doc._id.toString();
    const blocks = (doc.blocks ?? [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((b) => this.blockToI(b, propostaId));

    return {
      id: propostaId,
      agencyId: doc.agencyId?.toString() ?? '',
      viagemId: doc.viagemId?.toString() ?? '',
      briefingId: doc.briefingId?.toString() ?? null,
      propostaCode: doc.propostaCode,
      title: doc.title ?? null,
      status: doc.status as PropostaStatus,
      startDate: doc.startDate ?? null,
      endDate: doc.endDate ?? null,
      totalNights: doc.totalNights ?? null,
      totalCostUsd: doc.totalCostUsd ?? 0,
      totalSaleUsd: doc.totalSaleUsd ?? 0,
      totalMarkupUsd: doc.totalMarkupUsd ?? 0,
      platformFeeUsd: doc.platformFeeUsd ?? 0,
      agencyProfitUsd: doc.agencyProfitUsd ?? 0,
      heroImageUrl: doc.heroImageUrl ?? null,
      destinations: doc.destinations ?? [],
      clientMessage: doc.clientMessage ?? null,
      passengerIds: (doc.passengerIds ?? []).map((id) => id.toString()),
      clientIsTraveling: doc.clientIsTraveling ?? false,
      baseCurrency: doc.baseCurrency ?? 'USD',
      fxRates: doc.fxRates ?? {},
      citiesByDay: doc.citiesByDay ?? {},
      sentToClientAt: doc.sentToClientAt ?? null,
      approvedAt: doc.approvedAt ?? null,
      bookedAt: doc.bookedAt ?? null,
      blocks,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  // ── Proposta CRUD ─────────────────────────────────────────────────────────────

  async findAll(agencyId: string): Promise<IProposta[]> {
    const docs = await this.model
      .find({ agencyId: new Types.ObjectId(agencyId) })
      .sort({ createdAt: -1 })
      .lean<MongoProposta[]>();
    return docs.map((d) => this.toI(d));
  }

  async findByViagem(agencyId: string, viagemId: string): Promise<IProposta[]> {
    const docs = await this.model
      .find({
        agencyId: new Types.ObjectId(agencyId),
        viagemId: new Types.ObjectId(viagemId),
      })
      .sort({ createdAt: -1 })
      .lean<MongoProposta[]>();
    return docs.map((d) => this.toI(d));
  }

  async findById(id: string): Promise<IProposta | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.model.findById(id).lean<MongoProposta>();
    return doc ? this.toI(doc) : null;
  }

  async create(dto: CreatePropostaDto & { agencyId: string; propostaCode: string }): Promise<IProposta> {
    const created = await this.model.create({
      ...dto,
      agencyId: new Types.ObjectId(dto.agencyId),
      viagemId: new Types.ObjectId(dto.viagemId),
      blocks: [],
    });
    const doc = await this.model.findById(created._id).lean<MongoProposta>();
    return this.toI(doc!);
  }

  async update(id: string, dto: UpdatePropostaDto): Promise<IProposta | null> {
    const doc = await this.model
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .lean<MongoProposta>();
    return doc ? this.toI(doc) : null;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }

  // ── Embedded block operations ─────────────────────────────────────────────────

  async findBlocks(propostaId: string): Promise<IPropostaBlock[]> {
    if (!Types.ObjectId.isValid(propostaId)) return [];
    const doc = await this.model.findById(propostaId).lean<MongoProposta>();
    if (!doc) return [];
    return (doc.blocks ?? [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((b) => this.blockToI(b, propostaId));
  }

  async findBlockById(propostaId: string, blockId: string): Promise<IPropostaBlock | null> {
    if (!Types.ObjectId.isValid(propostaId) || !Types.ObjectId.isValid(blockId)) return null;
    const doc = await this.model.findById(propostaId).lean<MongoProposta>();
    if (!doc) return null;
    const block = (doc.blocks ?? []).find((b) => b._id.toString() === blockId);
    return block ? this.blockToI(block, propostaId) : null;
  }

  async addBlock(propostaId: string, dto: CreateBlockDto): Promise<IPropostaBlock> {
    if (!Types.ObjectId.isValid(propostaId)) throw new Error(`propostaId inválido: ${propostaId}`);
    const existing = await this.model.findById(propostaId).lean<MongoProposta>();
    const nextOrder = existing ? (existing.blocks ?? []).length : 0;

    const blockId = new Types.ObjectId();
    const now = new Date();
    const newBlock: MongoBlockSub = {
      _id: blockId,
      blockType: dto.blockType,
      dayNumber: dto.dayNumber,
      sortOrder: dto.sortOrder ?? nextOrder,
      saleUsd: dto.saleUsd ?? null,
      blockData: dto.blockData ?? null,
      isConfirmed: dto.isConfirmed ?? false,
      createdAt: now,
      updatedAt: now,
    };

    await this.model.findByIdAndUpdate(propostaId, { $push: { blocks: newBlock } });
    return this.blockToI(newBlock, propostaId);
  }

  async updateBlock(propostaId: string, blockId: string, dto: UpdateBlockDto): Promise<IPropostaBlock | null> {
    if (!Types.ObjectId.isValid(propostaId) || !Types.ObjectId.isValid(blockId)) return null;

    const setFields: Record<string, unknown> = { 'blocks.$.updatedAt': new Date() };
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) setFields[`blocks.$.${key}`] = value;
    }

    const doc = await this.model
      .findOneAndUpdate(
        { _id: new Types.ObjectId(propostaId), 'blocks._id': new Types.ObjectId(blockId) },
        { $set: setFields },
        { new: true },
      )
      .lean<MongoProposta>();

    if (!doc) return null;
    const block = (doc.blocks ?? []).find((b) => b._id.toString() === blockId);
    return block ? this.blockToI(block, propostaId) : null;
  }

  async reorderBlocks(propostaId: string, orderedIds: string[]): Promise<IPropostaBlock[]> {
    if (!Types.ObjectId.isValid(propostaId)) return [];
    const doc = await this.model.findById(propostaId).lean<MongoProposta>();
    if (!doc) return [];

    const blockMap = new Map((doc.blocks ?? []).map((b) => [b._id.toString(), b]));
    const reordered = orderedIds
      .map((id, index) => {
        const b = blockMap.get(id);
        return b ? { ...b, sortOrder: index } : null;
      })
      .filter((b): b is MongoBlockSub => b !== null);

    const reorderedSet = new Set(orderedIds);
    const rest = (doc.blocks ?? [])
      .filter((b) => !reorderedSet.has(b._id.toString()))
      .map((b, i) => ({ ...b, sortOrder: reordered.length + i }));

    const allBlocks = [...reordered, ...rest];
    await this.model.findByIdAndUpdate(propostaId, { $set: { blocks: allBlocks } });
    return allBlocks.map((b) => this.blockToI(b, propostaId));
  }

  async removeBlock(propostaId: string, blockId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(propostaId) || !Types.ObjectId.isValid(blockId)) return false;
    const result = await this.model.findByIdAndUpdate(
      propostaId,
      { $pull: { blocks: { _id: new Types.ObjectId(blockId) } } },
    );
    return !!result;
  }

  async unsetSupplierFromBlocks(supplierId: string): Promise<number> {
    // Blocos são DocumentArray embutido; limpa supplierId em todos os blocos
    // que referenciam o fornecedor, em qualquer proposta. supplierId é um
    // ObjectId único globalmente, então não precisa de scoping por agência.
    const result = await this.model.updateMany(
      { 'blocks.blockData.supplierId': supplierId },
      { $unset: { 'blocks.$[elem].blockData.supplierId': '' } },
      { arrayFilters: [{ 'elem.blockData.supplierId': supplierId }] },
    );
    return result.modifiedCount ?? 0;
  }
}
