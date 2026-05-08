import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Proposta, PropostaDocument } from '../schemas/proposta.schema';
import { IPropostaRepository } from '../interfaces/proposta.repository.interface';
import { IProposta } from '../interfaces/proposta.interface';
import { CreatePropostaDto } from '../dto/create-proposta.dto';
import { UpdatePropostaDto } from '../dto/update-proposta.dto';
import { PropostaStatus } from '../enums/proposta.enum';

type MongoProposta = Proposta & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date };

@Injectable()
export class PropostaMongooseRepository implements IPropostaRepository {
  constructor(
    @InjectModel(Proposta.name) private readonly model: Model<PropostaDocument>,
  ) {}

  private toI(doc: MongoProposta): IProposta {
    return {
      id: doc._id.toString(),
      agencyId: doc.agencyId?.toString() ?? '',
      viagemId: doc.viagemId?.toString() ?? '',
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
      clientMessage: doc.clientMessage ?? null,
      sentToClientAt: doc.sentToClientAt ?? null,
      approvedAt: doc.approvedAt ?? null,
      bookedAt: doc.bookedAt ?? null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

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
}
