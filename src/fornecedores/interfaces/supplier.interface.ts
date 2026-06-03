import { SupplierCategory } from '../enums/supplier.enum';

export interface ISupplier {
  id: string;
  agencyId: string;
  name: string;
  categories: SupplierCategory[];
  currency: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  logoUrl: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
