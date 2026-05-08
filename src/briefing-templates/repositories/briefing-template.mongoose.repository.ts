import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  BriefingTemplate,
  BriefingTemplateDocument,
} from '../schemas/briefing-template.schema';
import { IBriefingTemplateRepository } from '../interfaces/briefing-template.repository.interface';
import { IBriefingTemplate } from '../interfaces/briefing-template.interface';
import { CreateBriefingTemplateDto } from '../dto/create-briefing-template.dto';
import { UpdateBriefingTemplateDto } from '../dto/update-briefing-template.dto';

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

  async findAllForAgency(agencyId: string): Promise<IBriefingTemplate[]> {
    const docs = await this.model
      .find({
        $or: [
          { agencyId: new Types.ObjectId(agencyId) },
          { isGlobal: true },
        ],
        isActive: true,
      })
      .sort({ createdAt: -1 })
      .lean<MongoTpl[]>();
    return docs.map((d) => this.toI(d));
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
