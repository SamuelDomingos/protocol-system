export interface Supplier {
  id: string;
  name: string;
  type: 'unit' | 'supplier';
  category: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierFormData {
  name: string;
  type: 'unit' | 'supplier';
  category: string;
  notes?: string;
}

export interface SupplierTableProps {
  suppliers: Supplier[];
  loading: boolean;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
  onView: (supplier: Supplier) => void;
}

export interface SupplierFormProps {
  supplier?: Supplier;
  onSubmit: (data: SupplierFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export interface SupplierFilters {
  type?: 'unit' | 'supplier';
  category?: string;
  search?: string;
}