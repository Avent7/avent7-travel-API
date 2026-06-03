import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import {
  BriefingTemplate,
  BriefingTemplateDocument,
} from '../schemas/briefing-template.schema';
import { IBriefingTemplateRepository } from '../interfaces/briefing-template.repository.interface';
import { IBriefingTemplate } from '../interfaces/briefing-template.interface';
import { CreateBriefingTemplateDto } from '../dto/create-briefing-template.dto';
import { UpdateBriefingTemplateDto } from '../dto/update-briefing-template.dto';
import { BriefingTemplateQueryDto } from '../dto/briefing-template-query.dto';
import { PagedResult } from '../../common/types/paged-result.type';

type MongoTpl = BriefingTemplate & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class BriefingTemplateMongooseRepository implements IBriefingTemplateRepository {
  constructor(
    @InjectModel(BriefingTemplate.name)
    private readonly model: Model<BriefingTemplateDocument>,
  ) {}

  private toI(doc: MongoTpl): IBriefingTemplate {
    return {
      id: doc._id.toString(),
      agencyId: doc.agencyId?.toString() ?? null,
      name: doc.name,
      description: doc.description ?? null,
      isGlobal: doc.isGlobal,
      isActive: doc.isActive,
      sections: doc.sections ?? [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findPaged(agencyId: string, query: BriefingTemplateQueryDto): Promise<PagedResult<IBriefingTemplate>> {
    const { page = 1, pageSize = 12 } = query;

    const filter: FilterQuery<BriefingTemplateDocument> = {};

    if (query.isGlobal === true) {
      filter.isGlobal = true;
    } else if (query.isGlobal === false) {
      filter.agencyId = new Types.ObjectId(agencyId);
    } else {
      filter.$or = [
        { agencyId: new Types.ObjectId(agencyId) },
        { isGlobal: true },
      ];
    }

    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.search) {
      const re = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.name = re;
    }

    const dir = query.sortOrder === 'asc' ? 1 : -1;
    const sortField = query.sortBy === 'name' ? 'name' : 'createdAt';
    const sort: Record<string, 1 | -1> = { [sortField]: dir };

    const [docs, total] = await Promise.all([
      this.model
        .find(filter)
        .sort(sort)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean<MongoTpl[]>(),
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

  async findById(id: string): Promise<IBriefingTemplate | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.model.findById(id).lean<MongoTpl>();
    return doc ? this.toI(doc) : null;
  }

  async create(
    dto: CreateBriefingTemplateDto & { agencyId: string | null },
  ): Promise<IBriefingTemplate> {
    const created = await this.model.create({
      ...dto,
      agencyId: dto.agencyId ? new Types.ObjectId(dto.agencyId) : null,
    });
    const doc = await this.model.findById(created._id).lean<MongoTpl>();
    return this.toI(doc!);
  }

  async update(id: string, dto: UpdateBriefingTemplateDto): Promise<IBriefingTemplate | null> {
    const doc = await this.model
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .lean<MongoTpl>();
    return doc ? this.toI(doc) : null;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }
}
