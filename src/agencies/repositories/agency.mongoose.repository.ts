import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Agency, AgencyDocument } from '../schemas/agency.schema';
import { IAgencyRepository } from '../interfaces/agency.repository.interface';
import { IAgency } from '../interfaces/agency.interface';
import { CreateAgencyDto } from '../dto/create-agency.dto';
import { UpdateAgencyDto } from '../dto/update-agency.dto';

type MongoAgency = Agency & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date };

@Injectable()
export class AgencyMongooseRepository implements IAgencyRepository {
  constructor(
    @InjectModel(Agency.name) private readonly agencyModel: Model<AgencyDocument>,
  ) {}

  private toIAgency(doc: MongoAgency): IAgency {
    return {
      id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      plan: doc.plan as IAgency['plan'],
      brandConfig: doc.brandConfig ?? {},
      pricingConfig: doc.pricingConfig ?? {
        defaultMarkupPct: 20,
        platformTakeRatePct: 4,
        minCommissionUsd: 0,
        serviceFeeFixed: 50,
        serviceFeeMode: 'fixed',
      },
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findById(id: string): Promise<IAgency | null> {
    const doc = await this.agencyModel.findById(id).lean<MongoAgency>();
    return doc ? this.toIAgency(doc) : null;
  }

  async findBySlug(slug: string): Promise<IAgency | null> {
    const doc = await this.agencyModel.findOne({ slug }).lean<MongoAgency>();
    return doc ? this.toIAgency(doc) : null;
  }

  async create(dto: CreateAgencyDto): Promise<IAgency> {
    const created = await this.agencyModel.create(dto);
    const doc = await this.agencyModel.findById(created._id).lean<MongoAgency>();
    return this.toIAgency(doc!);
  }

  async update(id: string, dto: UpdateAgencyDto): Promise<IAgency | null> {
    const doc = await this.agencyModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .lean<MongoAgency>();
    return doc ? this.toIAgency(doc) : null;
  }
}
