import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Supplier, SupplierDocument } from '../schemas/supplier.schema';
import { ISupplierRepository } from '../interfaces/supplier.repository.interface';
import { ISupplier } from '../interfaces/supplier.interface';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';
import { SupplierQueryDto, SUPPLIER_SORT_FIELDS } from '../dto/supplier-query.dto';
import { SupplierCategory } from '../enums/supplier.enum';
import { PagedResult } from '../../common/types/paged-result.type';

type MongoSupplier = Supplier & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class SupplierMongooseRepository implements ISupplierRepository {
  constructor(
    @InjectModel(Supplier.name) private readonly model: Model<SupplierDocument>,
  ) {}

  private toISupplier(doc: MongoSupplier): ISupplier {
    return {
      id: doc._id.toString(),
      agencyId: doc.agencyId?.toString() ?? '',
      name: doc.name,
      categories: (doc.categories ?? []) as SupplierCategory[],
      currency: doc.currency ?? 'USD',
      email: doc.email ?? null,
      phone: doc.phone ?? null,
      website: doc.website ?? null,
      city: doc.city ?? null,
      state: doc.state ?? null,
      country: doc.country ?? null,
      logoUrl: doc.logoUrl ?? null,
      notes: doc.notes ?? null,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findAll(agencyId: string): Promise<ISupplier[]> {
    const docs = await this.model
      .find({ agencyId: new Types.ObjectId(agencyId) })
      .sort({ createdAt: -1 })
      .lean<MongoSupplier[]>();
    return docs.map((d) => this.toISupplier(d));
  }

  async findPaged(agencyId: string, query: SupplierQueryDto): Promise<PagedResult<ISupplier>> {
    const { page = 1, pageSize = 10 } = query;

    const filter: FilterQuery<SupplierDocument> = {
      agencyId: new Types.ObjectId(agencyId),
    };
    if (query.category) filter.categories = query.category;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.search) {
      const re = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: re }, { email: re }, { city: re }];
    }

    const skip = (page - 1) * pageSize;
    const dir: 1 | -1 = query.sortOrder === 'asc' ? 1 : -1;
    const sortField =
      query.sortBy && (SUPPLIER_SORT_FIELDS as readonly string[]).includes(query.sortBy)
        ? query.sortBy
        : 'createdAt';
    const sort: Record<string, 1 | -1> = { [sortField]: dir };

    const [docs, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(pageSize).lean<MongoSupplier[]>(),
      this.model.countDocuments(filter),
    ]);

    return {
      data: docs.map((d) => this.toISupplier(d)),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async findById(id: string): Promise<ISupplier | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.model.findById(id).lean<MongoSupplier>();
    return doc ? this.toISupplier(doc) : null;
  }

  async create(dto: CreateSupplierDto & { agencyId: string }): Promise<ISupplier> {
    const created = await this.model.create({
      ...dto,
      agencyId: new Types.ObjectId(dto.agencyId),
    });
    const doc = await this.model.findById(created._id).lean<MongoSupplier>();
    return this.toISupplier(doc!);
  }

  async update(id: string, dto: UpdateSupplierDto): Promise<ISupplier | null> {
    const doc = await this.model
      .findByIdAndUpdate(id, { $set: { ...dto } }, { new: true })
      .lean<MongoSupplier>();
    return doc ? this.toISupplier(doc) : null;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }
}
