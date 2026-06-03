import { ISupplier } from './supplier.interface';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';
import { SupplierQueryDto } from '../dto/supplier-query.dto';
import { PagedResult } from '../../common/types/paged-result.type';

export const SUPPLIER_REPOSITORY = Symbol('ISupplierRepository');

export interface ISupplierRepository {
  findAll(agencyId: string): Promise<ISupplier[]>;
  findPaged(agencyId: string, query: SupplierQueryDto): Promise<PagedResult<ISupplier>>;
  findById(id: string): Promise<ISupplier | null>;
  create(dto: CreateSupplierDto & { agencyId: string }): Promise<ISupplier>;
  update(id: string, dto: UpdateSupplierDto): Promise<ISupplier | null>;
  remove(id: string): Promise<boolean>;
}
