import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Client, ClientDocument } from '../schemas/client.schema';
import { IClientRepository } from '../interfaces/client.repository.interface';
import { IClient } from '../interfaces/client.interface';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { ClientSegment, DocumentType, Gender } from '../enums/client.enum';

type MongoClient = Client & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date };

@Injectable()
export class ClientMongooseRepository implements IClientRepository {
  constructor(
    @InjectModel(Client.name) private readonly model: Model<ClientDocument>,
  ) {}

  private toIClient(doc: MongoClient): IClient {
    return {
      id: doc._id.toString(),
      agencyId: doc.agencyId?.toString() ?? '',
      clientCode: doc.clientCode,
      fullName: doc.fullName,
      socialName: doc.socialName ?? null,
      dateOfBirth: doc.dateOfBirth ?? null,
      gender: (doc.gender as Gender) ?? null,
      nationality: doc.nationality ?? null,
      profession: doc.profession ?? null,
      company: doc.company ?? null,
      segment: doc.segment as ClientSegment,
      photoUrl: doc.photoUrl ?? null,
      emailPrimary: doc.emailPrimary,
      emailSecondary: doc.emailSecondary ?? null,
      phonePrimary: doc.phonePrimary ?? null,
      phoneAlternative: doc.phoneAlternative ?? null,
      address: doc.address ?? {},
      emergencyContact: doc.emergencyContact ?? {},
      primaryDocument: doc.primaryDocument
        ? {
            type: doc.primaryDocument.type as DocumentType,
            number: doc.primaryDocument.number,
            country: doc.primaryDocument.country,
          }
        : null,
      travelPreferences: doc.travelPreferences ?? {},
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findAll(agencyId: string): Promise<IClient[]> {
    const docs = await this.model
      .find({ agencyId: new Types.ObjectId(agencyId) })
      .lean<MongoClient[]>();
    return docs.map((d) => this.toIClient(d));
  }

  async findById(id: string): Promise<IClient | null> {
    const doc = await this.model.findById(id).lean<MongoClient>();
    return doc ? this.toIClient(doc) : null;
  }

  async findByClientCode(clientCode: string): Promise<IClient | null> {
    const doc = await this.model.findOne({ clientCode }).lean<MongoClient>();
    return doc ? this.toIClient(doc) : null;
  }

  async create(dto: CreateClientDto & { agencyId: string; clientCode: string }): Promise<IClient> {
    const created = await this.model.create({
      ...dto,
      agencyId: new Types.ObjectId(dto.agencyId),
    });
    const doc = await this.model.findById(created._id).lean<MongoClient>();
    return this.toIClient(doc!);
  }

  async update(id: string, dto: UpdateClientDto): Promise<IClient | null> {
    const doc = await this.model
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .lean<MongoClient>();
    return doc ? this.toIClient(doc) : null;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }
}
