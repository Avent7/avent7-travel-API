import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from '../schemas/booking.schema';
import { IBookingRepository } from '../interfaces/booking.repository.interface';
import { IBooking } from '../interfaces/booking.interface';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { BookingStatus, Provider } from '../enums/booking.enum';

type MongoBkg = Booking & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date };

@Injectable()
export class BookingMongooseRepository implements IBookingRepository {
  constructor(
    @InjectModel(Booking.name) private readonly model: Model<BookingDocument>,
  ) {}

  private toI(doc: MongoBkg): IBooking {
    return {
      id: doc._id.toString(),
      agencyId: doc.agencyId?.toString() ?? '',
      itineraryId: doc.itineraryId?.toString() ?? null,
      blockId: doc.blockId?.toString() ?? null,
      passengerId: doc.passengerId?.toString() ?? null,
      provider: doc.provider as Provider,
      providerBookingRef: doc.providerBookingRef ?? null,
      status: doc.status as BookingStatus,
      netCostUsd: doc.netCostUsd,
      saleUsd: doc.saleUsd,
      markupUsd: doc.markupUsd,
      platformFeeUsd: doc.platformFeeUsd,
      agencyProfitUsd: doc.agencyProfitUsd,
      serviceFeeUsd: doc.serviceFeeUsd ?? 0,
      pricingSnapshot: doc.pricingSnapshot ?? null,
      confirmedAt: doc.confirmedAt ?? null,
      cancelledAt: doc.cancelledAt ?? null,
      refundedAt: doc.refundedAt ?? null,
      notes: doc.notes ?? null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findAll(agencyId: string): Promise<IBooking[]> {
    const docs = await this.model
      .find({ agencyId: new Types.ObjectId(agencyId) })
      .sort({ createdAt: -1 })
      .lean<MongoBkg[]>();
    return docs.map((d) => this.toI(d));
  }

  async findByItinerary(itineraryId: string): Promise<IBooking[]> {
    const docs = await this.model
      .find({ itineraryId: new Types.ObjectId(itineraryId) })
      .sort({ createdAt: -1 })
      .lean<MongoBkg[]>();
    return docs.map((d) => this.toI(d));
  }

  async findById(id: string): Promise<IBooking | null> {
    const doc = await this.model.findById(id).lean<MongoBkg>();
    return doc ? this.toI(doc) : null;
  }

  async create(dto: CreateBookingDto & { agencyId: string }): Promise<IBooking> {
    const created = await this.model.create({
      ...dto,
      agencyId: new Types.ObjectId(dto.agencyId),
      itineraryId: dto.itineraryId ? new Types.ObjectId(dto.itineraryId) : null,
      blockId: dto.blockId ? new Types.ObjectId(dto.blockId) : null,
      passengerId: dto.passengerId ? new Types.ObjectId(dto.passengerId) : null,
    });
    const doc = await this.model.findById(created._id).lean<MongoBkg>();
    return this.toI(doc!);
  }

  async updateStatus(id: string, status: BookingStatus, extra?: Partial<IBooking>): Promise<IBooking | null> {
    const update: Record<string, any> = { status, ...extra };
    if (status === BookingStatus.CONFIRMED) update.confirmedAt = new Date();
    if (status === BookingStatus.CANCELLED) update.cancelledAt = new Date();
    if (status === BookingStatus.REFUNDED) update.refundedAt = new Date();

    const doc = await this.model
      .findByIdAndUpdate(id, { $set: update }, { new: true })
      .lean<MongoBkg>();
    return doc ? this.toI(doc) : null;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }
}
