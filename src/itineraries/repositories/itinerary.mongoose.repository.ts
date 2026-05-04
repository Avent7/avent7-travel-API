import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Itinerary, ItineraryDocument } from '../schemas/itinerary.schema';
import { IItineraryRepository } from '../interfaces/itinerary.repository.interface';
import { IItinerary } from '../interfaces/itinerary.interface';
import { CreateItineraryDto } from '../dto/create-itinerary.dto';
import { UpdateItineraryDto } from '../dto/update-itinerary.dto';
import { ItineraryStatus } from '../enums/itinerary.enum';

type MongoItn = Itinerary & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date };

@Injectable()
export class ItineraryMongooseRepository implements IItineraryRepository {
  constructor(
    @InjectModel(Itinerary.name) private readonly model: Model<ItineraryDocument>,
  ) {}

  private toI(doc: MongoItn): IItinerary {
    return {
      id: doc._id.toString(),
      agencyId: doc.agencyId?.toString() ?? '',
      passengerId: doc.passengerId?.toString() ?? '',
      briefingId: doc.briefingId?.toString() ?? null,
      itineraryCode: doc.itineraryCode,
      title: doc.title ?? null,
      status: doc.status as ItineraryStatus,
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

  async findAll(agencyId: string): Promise<IItinerary[]> {
    const docs = await this.model
      .find({ agencyId: new Types.ObjectId(agencyId) })
      .sort({ createdAt: -1 })
      .lean<MongoItn[]>();
    return docs.map((d) => this.toI(d));
  }

  async findByPassenger(agencyId: string, passengerId: string): Promise<IItinerary[]> {
    const docs = await this.model
      .find({
        agencyId: new Types.ObjectId(agencyId),
        passengerId: new Types.ObjectId(passengerId),
      })
      .sort({ createdAt: -1 })
      .lean<MongoItn[]>();
    return docs.map((d) => this.toI(d));
  }

  async findById(id: string): Promise<IItinerary | null> {
    const doc = await this.model.findById(id).lean<MongoItn>();
    return doc ? this.toI(doc) : null;
  }

  async create(dto: CreateItineraryDto & { agencyId: string; itineraryCode: string }): Promise<IItinerary> {
    const created = await this.model.create({
      ...dto,
      agencyId: new Types.ObjectId(dto.agencyId),
      passengerId: new Types.ObjectId(dto.passengerId),
      briefingId: dto.briefingId ? new Types.ObjectId(dto.briefingId) : null,
    });
    const doc = await this.model.findById(created._id).lean<MongoItn>();
    return this.toI(doc!);
  }

  async update(id: string, dto: UpdateItineraryDto): Promise<IItinerary | null> {
    const doc = await this.model
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .lean<MongoItn>();
    return doc ? this.toI(doc) : null;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }
}
