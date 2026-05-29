import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Passenger, PassengerDocument } from '../schemas/passenger.schema';
import { Client, ClientDocument } from '../../clients/schemas/client.schema';
import { IPassengerRepository, PassengerQuery } from '../interfaces/passenger.repository.interface';
import { IPassenger, IPassengerPage, IPassengerWithClient } from '../interfaces/passenger.interface';
import { CreatePassengerDto } from '../dto/create-passenger.dto';
import { UpdatePassengerDto } from '../dto/update-passenger.dto';
import { Gender } from '../enums/passenger.enum';

type MongoPax = Passenger & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date };

@Injectable()
export class PassengerMongooseRepository implements IPassengerRepository {
  constructor(
    @InjectModel(Passenger.name) private readonly model: Model<PassengerDocument>,
    @InjectModel(Client.name) private readonly clientModel: Model<ClientDocument>,
  ) {}

  private toIPax(doc: MongoPax): IPassenger {
    return {
      id: doc._id.toString(),
      clientId: doc.clientId?.toString() ?? '',
      agencyId: doc.agencyId?.toString() ?? '',
      fullName: doc.fullName,
      socialName: doc.socialName ?? null,
      dateOfBirth: doc.dateOfBirth ?? null,
      gender: (doc.gender as Gender) ?? null,
      nationality: doc.nationality ?? null,
      documents: doc.documents ?? {},
      travelPreferences: doc.travelPreferences ?? {},
      emergencyContact: doc.emergencyContact ?? {},
      photoUrl: doc.photoUrl ?? null,
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

  async findByClientId(clientId: string): Promise<IPassenger[]> {
    const docs = await this.model
      .find({ clientId: new Types.ObjectId(clientId) })
      .lean<MongoPax[]>();
    return docs.map((d) => this.toIPax(d));
  }

  async findPaginated(agencyId: string, query: PassengerQuery): Promise<IPassengerPage> {
    const { page = 1, limit = 20, search, clientId, segmentId } = query;
    const filter: FilterQuery<PassengerDocument> = {
      agencyId: new Types.ObjectId(agencyId),
    };

    if (clientId && Types.ObjectId.isValid(clientId)) {
      filter.clientId = new Types.ObjectId(clientId);
    } else if (segmentId && Types.ObjectId.isValid(segmentId)) {
      const clientIds = await this.clientModel
        .find({ agencyId: new Types.ObjectId(agencyId), segmentId: new Types.ObjectId(segmentId) })
        .distinct('_id');
      filter.clientId = { $in: clientIds };
    }

    if (search?.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ fullName: regex }, { socialName: regex }];
    }

    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      this.model
        .find(filter)
        .populate({
          path: 'clientId',
          select: 'clientCode fullName socialName emailPrimary phonePrimary photoUrl segmentId',
          populate: { path: 'segmentId', select: 'name icon color' },
        })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.model.countDocuments(filter),
    ]);

    return {
      data: (docs as any[]).map((d) => this.toIPaxWithClient(d)),
      total,
      page,
      limit,
      segments: [],
    };
  }

  private toIPaxWithClient(doc: any): IPassengerWithClient {
    const clientDoc =
      doc.clientId && typeof doc.clientId === 'object' && doc.clientId._id
        ? doc.clientId
        : null;

    const pax = this.toIPax({
      ...doc,
      clientId: clientDoc ? clientDoc._id : doc.clientId,
    });

    return {
      ...pax,
      client: clientDoc
        ? {
            id: clientDoc._id.toString(),
            clientCode: clientDoc.clientCode,
            fullName: clientDoc.fullName,
            socialName: clientDoc.socialName ?? null,
            emailPrimary: clientDoc.emailPrimary,
            phonePrimary: clientDoc.phonePrimary ?? null,
            photoUrl: clientDoc.photoUrl ?? null,
            segmentId: clientDoc.segmentId
              ? (typeof clientDoc.segmentId === 'object' && clientDoc.segmentId._id
                  ? clientDoc.segmentId._id.toString()
                  : clientDoc.segmentId.toString())
              : null,
            segment:
              clientDoc.segmentId && typeof clientDoc.segmentId === 'object' && clientDoc.segmentId._id
                ? {
                    id: clientDoc.segmentId._id.toString(),
                    name: clientDoc.segmentId.name,
                    icon: clientDoc.segmentId.icon,
                    color: clientDoc.segmentId.color,
                  }
                : null,
          }
        : null,
    };
  }

  async findById(id: string): Promise<IPassenger | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.model.findById(id).lean<MongoPax>();
    return doc ? this.toIPax(doc) : null;
  }

  async create(dto: CreatePassengerDto & { agencyId: string }): Promise<IPassenger> {
    const created = await this.model.create({
      ...dto,
      clientId: new Types.ObjectId(dto.clientId),
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
