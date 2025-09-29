export interface Supplier {
  id: string;
  name: string;
  type: 'unit' | 'supplier';
  category: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type SupplierCreateInput = Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>;
export type SupplierUpdateInput = Partial<SupplierCreateInput>;