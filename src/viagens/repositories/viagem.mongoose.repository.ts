import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Viagem, ViagemDocument } from '../schemas/viagem.schema';
import { IViagemRepository } from '../interfaces/viagem.repository.interface';
import { IViagem } from '../interfaces/viagem.interface';
import { CreateViagemDto } from '../dto/create-viagem.dto';
import { UpdateViagemDto } from '../dto/update-viagem.dto';
import { ViagemQueryDto } from '../dto/viagem-query.dto';
import { ViagemStatus } from '../enums/viagem.enum';
import { PagedResult } from '../../common/types/paged-result.type';

type MongoViagem = Viagem & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date };

@Injectable()
export class ViagemMongooseRepository implements IViagemRepository {
  constructor(
    @InjectModel(Viagem.name) private readonly model: Model<ViagemDocument>,
  ) {}

  private toI(doc: MongoViagem): IViagem {
    return {
      id: doc._id.toString(),
      agencyId: doc.agencyId?.toString() ?? '',
      clientId: doc.clientId?.toString() ?? '',
      passengerId: doc.passengerId?.toString() ?? null,
      createdByUserId: doc.createdByUserId?.toString() ?? null,
      viagemCode: doc.viagemCode,
      title: doc.title,
      status: doc.status as ViagemStatus,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private buildFilter(agencyId: string, query: Partial<ViagemQueryDto>): FilterQuery<ViagemDocument> {
    const filter: FilterQuery<ViagemDocument> = {
      agencyId: new Types.ObjectId(agencyId),
    };
    if (query.clientId) filter.clientId = new Types.ObjectId(query.clientId);
    if (query.status)   filter.status = query.status;
    if (query.search) {
      const re = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: re }, { viagemCode: re }];
    }
    return filter;
  }

  async findPaged(agencyId: string, query: ViagemQueryDto): Promise<PagedResult<IViagem>> {
    const { page = 1, pageSize = 10 } = query;
    const filter = this.buildFilter(agencyId, query);

    const [docs, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean<MongoViagem[]>(),
      this.model.countDocuments(filter),
    ]);

    return {
      data: docs.map((d) => this.toI(d)),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async findAll(agencyId: string): Promise<IViagem[]> {
    const docs = await this.model
      .find({ agencyId: new Types.ObjectId(agencyId) })
      .sort({ createdAt: -1 })
      .lean<MongoViagem[]>();
    return docs.map((d) => this.toI(d));
  }

  async findByClient(agencyId: string, clientId: string): Promise<IViagem[]> {
    const docs = await this.model
      .find({
        agencyId: new Types.ObjectId(agencyId),
        clientId: new Types.ObjectId(clientId),
      })
      .sort({ createdAt: -1 })
      .lean<MongoViagem[]>();
    return docs.map((d) => this.toI(d));
  }

  async findById(id: string): Promise<IViagem | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.model.findById(id).lean<MongoViagem>();
    return doc ? this.toI(doc) : null;
  }

  async create(
    dto: CreateViagemDto & { agencyId: string; viagemCode: string; createdByUserId: string | null },
  ): Promise<IViagem> {
    const created = await this.model.create({
      ...dto,
      agencyId: new Types.ObjectId(dto.agencyId),
      clientId: new Types.ObjectId(dto.clientId),
      passengerId: dto.passengerId ? new Types.ObjectId(dto.passengerId) : null,
      createdByUserId: dto.createdByUserId ? new Types.ObjectId(dto.createdByUserId) : null,
    });
    const doc = await this.model.findById(created._id).lean<MongoViagem>();
    return this.toI(doc!);
  }

  async update(id: string, dto: UpdateViagemDto): Promise<IViagem | null> {
    const update: Record<string, unknown> = { ...dto };
    if (dto.passengerId) {
      update.passengerId = new Types.ObjectId(dto.passengerId);
    }
    const doc = await this.model
      .findByIdAndUpdate(id, { $set: update }, { new: true })
      .lean<MongoViagem>();
    return doc ? this.toI(doc) : null;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }
}
