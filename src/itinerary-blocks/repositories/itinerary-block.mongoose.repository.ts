import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ItineraryBlock, ItineraryBlockDocument } from '../schemas/itinerary-block.schema';
import { IBlockRepository } from '../interfaces/itinerary-block.repository.interface';
import { IItineraryBlock } from '../interfaces/itinerary-block.interface';
import { CreateBlockDto } from '../dto/create-block.dto';
import { UpdateBlockDto } from '../dto/update-block.dto';
import { BlockType } from '../enums/block.enum';

type MongoBlock = ItineraryBlock & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date };

@Injectable()
export class BlockMongooseRepository implements IBlockRepository {
  constructor(
    @InjectModel(ItineraryBlock.name) private readonly model: Model<ItineraryBlockDocument>,
  ) {}

  private toI(doc: MongoBlock): IItineraryBlock {
    return {
      id: doc._id.toString(),
      itineraryId: doc.itineraryId?.toString() ?? '',
      blockType: doc.blockType as BlockType,
      dayNumber: doc.dayNumber,
      sortOrder: doc.sortOrder,
      title: doc.title ?? null,
      description: doc.description ?? null,
      imageUrl: doc.imageUrl ?? null,
      locationName: doc.locationName ?? null,
      costUsd: doc.costUsd ?? null,
      saleUsd: doc.saleUsd ?? null,
      markupPct: doc.markupPct ?? null,
      blockData: doc.blockData ?? null,
      isConfirmed: doc.isConfirmed,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findByItinerary(itineraryId: string): Promise<IItineraryBlock[]> {
    const docs = await this.model
      .find({ itineraryId: new Types.ObjectId(itineraryId) })
      .sort({ sortOrder: 1, dayNumber: 1 })
      .lean<MongoBlock[]>();
    return docs.map((d) => this.toI(d));
  }

  async findById(id: string): Promise<IItineraryBlock | null> {
    const doc = await this.model.findById(id).lean<MongoBlock>();
    return doc ? this.toI(doc) : null;
  }

  async create(dto: CreateBlockDto & { itineraryId: string }): Promise<IItineraryBlock> {
    const maxOrder = await this.model
      .findOne({ itineraryId: new Types.ObjectId(dto.itineraryId) })
      .sort({ sortOrder: -1 })
      .lean<MongoBlock>();
    const nextOrder = maxOrder ? maxOrder.sortOrder + 1 : 0;

    const created = await this.model.create({
      ...dto,
      itineraryId: new Types.ObjectId(dto.itineraryId),
      sortOrder: dto.sortOrder ?? nextOrder,
    });
    const doc = await this.model.findById(created._id).lean<MongoBlock>();
    return this.toI(doc!);
  }

  async update(id: string, dto: UpdateBlockDto): Promise<IItineraryBlock | null> {
    const doc = await this.model
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .lean<MongoBlock>();
    return doc ? this.toI(doc) : null;
  }

  async reorder(itineraryId: string, orderedIds: string[]): Promise<IItineraryBlock[]> {
    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(id) },
        update: { $set: { sortOrder: index } },
      },
    }));
    await this.model.bulkWrite(bulkOps);
    return this.findByItinerary(itineraryId);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }
}
