import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Passenger, PassengerDocument } from '../schemas/passenger.schema';
import { IPassengerRepository } from '../interfaces/passenger.repository.interface';
import { IPassenger } from '../interfaces/passenger.interface';
import { CreatePassengerDto } from '../dto/create-passenger.dto';
import { UpdatePassengerDto } from '../dto/update-passenger.dto';
import { ClientSegment, Gender } from '../enums/passenger.enum';

type MongoPax = Passenger & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date };

@Injectable()
export class PassengerMongooseRepository implements IPassengerRepository {
  constructor(
    @InjectModel(Passenger.name) private readonly model: Model<PassengerDocument>,
  ) {}

  private toIPax(doc: MongoPax): IPassenger {
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
      documents: doc.documents ?? {},
      travelPreferences: doc.travelPreferences ?? {},
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findAll(agencyId: string): Promise<IPassenger[]> {
    const docs = await this.model
      .find({ agencyId: new Types.ObjectId(agencyId) })
      .lean<MongoPax[]>();
    return docs.map((d) => this.toIPax(d));
  }

  async findById(id: string): Promise<IPassenger | null> {
    const doc = await this.model.findById(id).lean<MongoPax>();
    return doc ? this.toIPax(doc) : null;
  }

  async findByClientCode(clientCode: string): Promise<IPassenger | null> {
    const doc = await this.model.findOne({ clientCode }).lean<MongoPax>();
    return doc ? this.toIPax(doc) : null;
  }

  async create(dto: CreatePassengerDto & { agencyId: string; clientCode: string }): Promise<IPassenger> {
    const created = await this.model.create({
      ...dto,
      agencyId: new Types.ObjectId(dto.agencyId),
    });
    const doc = await this.model.findById(created._id).lean<MongoPax>();
    return this.toIPax(doc!);
  }

  async update(id: string, dto: UpdatePassengerDto): Promise<IPassenger | null> {
    const doc = await this.model
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .lean<MongoPax>();
    return doc ? this.toIPax(doc) : null;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }
}
