import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PropostaBlock, PropostaBlockDocument } from '../schemas/proposta-block.schema';
import { IPropostaBlockRepository } from '../interfaces/proposta-block.repository.interface';
import { IPropostaBlock } from '../interfaces/proposta-block.interface';
import { CreateBlockDto } from '../dto/create-block.dto';
import { UpdateBlockDto } from '../dto/update-block.dto';
import { BlockType } from '../enums/block.enum';

type MongoBlock = PropostaBlock & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date };

@Injectable()
export class PropostaBlockMongooseRepository implements IPropostaBlockRepository {
  constructor(
    @InjectModel(PropostaBlock.name) private readonly model: Model<PropostaBlockDocument>,
  ) {}

  private toI(doc: MongoBlock): IPropostaBlock {
    return {
      id: doc._id.toString(),
      propostaId: doc.propostaId?.toString() ?? '',
      blockType: doc.blockType as BlockType,
      dayNumber: doc.dayNumber,
      sortOrder: doc.sortOrder,
      title: doc.title ?? null,
      description: doc.description ?? null,
      imageUrl: doc.imageUrl ?? null,
      locationName: doc.locationName ?? null,
      costUsd: doc.costUsd ?? null,
      saleUsd: doc.saleUsd ?? null,
      markupPct: doc.markupPct ?? null,
      blockData: doc.blockData ?? null,
      isConfirmed: doc.isConfirmed,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findByProposta(propostaId: string): Promise<IPropostaBlock[]> {
    const docs = await this.model
      .find({ propostaId: new Types.ObjectId(propostaId) })
      .sort({ sortOrder: 1, dayNumber: 1 })
      .lean<MongoBlock[]>();
    return docs.map((d) => this.toI(d));
  }

  async findById(id: string): Promise<IPropostaBlock | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.model.findById(id).lean<MongoBlock>();
    return doc ? this.toI(doc) : null;
  }

  async create(dto: CreateBlockDto & { propostaId: string }): Promise<IPropostaBlock> {
    const maxOrder = await this.model
      .findOne({ propostaId: new Types.ObjectId(dto.propostaId) })
      .sort({ sortOrder: -1 })
      .lean<MongoBlock>();
    const nextOrder = maxOrder ? maxOrder.sortOrder + 1 : 0;

    const created = await this.model.create({
      ...dto,
      propostaId: new Types.ObjectId(dto.propostaId),
      sortOrder: dto.sortOrder ?? nextOrder,
    });
    const doc = await this.model.findById(created._id).lean<MongoBlock>();
    return this.toI(doc!);
  }

  async update(id: string, dto: UpdateBlockDto): Promise<IPropostaBlock | null> {
    const doc = await this.model
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .lean<MongoBlock>();
    return doc ? this.toI(doc) : null;
  }

  async reorder(propostaId: string, orderedIds: string[]): Promise<IPropostaBlock[]> {
    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(id) },
        update: { $set: { sortOrder: index } },
      },
    }));
    await this.model.bulkWrite(bulkOps);
    return this.findByProposta(propostaId);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }
}
