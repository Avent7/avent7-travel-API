import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';
import { Viagem, ViagemDocument } from '../schemas/viagem.schema';
import { IViagemRepository } from '../interfaces/viagem.repository.interface';
import { IViagem } from '../interfaces/viagem.interface';
import { IPipelineViagem, IPipelineColumnData, IPipelineResponse } from '../interfaces/pipeline-viagem.interface';
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
      coverImageUrl: (doc as any).coverImageUrl ?? null,
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

  async findPaged(agencyId: string, query: ViagemQueryDto): Promise<PagedResult<IPipelineViagem>> {
    const { page = 1, pageSize = 10 } = query;
    const filter = this.buildFilter(agencyId, query);
    const skip = (page - 1) * pageSize;
    const dir: 1 | -1 = query.sortOrder === 'asc' ? 1 : -1;

    // Estágios extras + ordenação. Relações (clientName/createdByName) exigem lookup
    // antes do $sort, pois os lookups de saída ocorrem depois do skip/limit.
    const preSortStages: PipelineStage[] = [];
    let sortStage: PipelineStage = { $sort: { createdAt: -1 } };

    if (query.sortBy === 'clientName') {
      preSortStages.push(
        {
          $lookup: {
            from: 'clients',
            let: { c: '$clientId' },
            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$c'] } } }, { $project: { fullName: 1 } }],
            as: '_sortRef',
          },
        },
        { $addFields: { _sortKey: { $toLower: { $ifNull: [{ $arrayElemAt: ['$_sortRef.fullName', 0] }, ''] } } } },
      );
      sortStage = { $sort: { _sortKey: dir, _id: 1 } };
    } else if (query.sortBy === 'createdByName') {
      preSortStages.push(
        {
          $lookup: {
            from: 'users',
            let: { u: '$createdByUserId' },
            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$u'] } } }, { $project: { name: 1 } }],
            as: '_sortRef',
          },
        },
        { $addFields: { _sortKey: { $toLower: { $ifNull: [{ $arrayElemAt: ['$_sortRef.name', 0] }, ''] } } } },
      );
      sortStage = { $sort: { _sortKey: dir, _id: 1 } };
    } else if (query.sortBy && ['title', 'status', 'createdAt'].includes(query.sortBy)) {
      sortStage = { $sort: { [query.sortBy]: dir } };
    }

    const [result] = await this.model
      .aggregate([
        { $match: filter },
        ...preSortStages,
        sortStage,
        {
          $facet: {
            data: [{ $skip: skip }, { $limit: pageSize }, ...(this.pipelineLookupStages() as any)],
            total: [{ $count: 'count' }],
          },
        },
      ])
      .exec();

    const total: number = result?.total?.[0]?.count ?? 0;
    const data: IPipelineViagem[] = (result?.data ?? []).map((d: any) =>
      this.toIPipelineViagem(d),
    );

    return {
      data,
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

  // ─── Pipeline ────────────────────────────────────────────────────────────────

  private pipelineLookupStages(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'clients',
          let: { clientId: '$clientId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$clientId'] } } },
            { $project: { socialName: 1, fullName: 1, photoUrl: 1 } },
          ],
          as: 'clientDoc',
        },
      },
      { $unwind: { path: '$clientDoc', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          let: { userId: '$createdByUserId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $ne: ['$$userId', null] }, { $eq: ['$_id', '$$userId'] }],
                },
              },
            },
            { $project: { name: 1, profileImageUrl: 1 } },
          ],
          as: 'operatorDoc',
        },
      },
      { $unwind: { path: '$operatorDoc', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'briefings',
          let: { vid: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$viagemId', '$$vid'] } } },
            { $count: 'n' },
          ],
          as: 'briefingsCount',
        },
      },
      {
        $lookup: {
          from: 'propostas',
          let: { vid: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$viagemId', '$$vid'] } } },
            { $count: 'n' },
          ],
          as: 'propostasCount',
        },
      },
    ];
  }

  private toIPipelineViagem(doc: any): IPipelineViagem {
    return {
      id: doc._id.toString(),
      agencyId: doc.agencyId?.toString() ?? '',
      clientId: doc.clientId?.toString() ?? '',
      passengerId: doc.passengerId?.toString() ?? null,
      createdByUserId: doc.createdByUserId?.toString() ?? null,
      viagemCode: doc.viagemCode,
      title: doc.title,
      status: doc.status as ViagemStatus,
      coverImageUrl: doc.coverImageUrl ?? null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      client: doc.clientDoc
        ? {
            id: doc.clientDoc._id.toString(),
            name: doc.clientDoc.socialName || doc.clientDoc.fullName,
            photoUrl: doc.clientDoc.photoUrl ?? null,
          }
        : null,
      operator: doc.operatorDoc
        ? {
            id: doc.operatorDoc._id.toString(),
            name: doc.operatorDoc.name,
            profileImageUrl: doc.operatorDoc.profileImageUrl ?? null,
          }
        : null,
      counts: {
        briefings: doc.briefingsCount?.[0]?.n ?? 0,
        propostas: doc.propostasCount?.[0]?.n ?? 0,
      },
    };
  }

  async findPipelineColumn(
    agencyId: string,
    status: ViagemStatus,
    page: number,
    pageSize: number,
  ): Promise<IPipelineColumnData> {
    const skip = (page - 1) * pageSize;
    const agencyOid = new Types.ObjectId(agencyId);

    const [result] = await this.model
      .aggregate([
        { $match: { agencyId: agencyOid, status } },
        { $sort: { createdAt: -1 } },
        {
          $facet: {
            viagens: [{ $skip: skip }, { $limit: pageSize }, ...this.pipelineLookupStages() as any],
            total: [{ $count: 'count' }],
          },
        },
      ])
      .exec();

    const total: number = result?.total?.[0]?.count ?? 0;
    const viagens: IPipelineViagem[] = (result?.viagens ?? []).map((d: any) =>
      this.toIPipelineViagem(d),
    );

    return {
      status,
      viagens,
      total,
      page,
      pageSize,
      hasMore: skip + viagens.length < total,
    };
  }

  async findPipelineAll(agencyId: string, pageSize: number): Promise<IPipelineResponse> {
    const allStatuses = Object.values(ViagemStatus);
    const columns = await Promise.all(
      allStatuses.map((status) => this.findPipelineColumn(agencyId, status, 1, pageSize)),
    );
    return { columns };
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
