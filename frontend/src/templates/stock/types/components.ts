import { StockMovement } from "@/src/lib/api/types";
import { ProductEntry } from ".";

export interface ExitProductListProps {
  locationId: string;
  entries: ProductEntry[];
  onEntriesChange: (entries: ProductEntry[]) => void;
  exitType: string;
}

export interface BatchInfo {
  id: string;
  sku: string;
  quantity: number;
  expiryDate?: string;
  price: number;
  product: {
    name: string;
    unitPrice: number;
  };
}

export interface BatchDialogProps {
  productId: string;
  batches: BatchInfo[];
  onBatchSelect: (batch: BatchInfo) => void;
  disabled?: boolean;
}

export interface ConsumptionHistoryChartProps {
  movements: StockMovement[]
  productId?: string
}

export interface StockCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: 'default' | 'warning' | 'success' | 'danger';
}

export interface EntryFormProps {
  onSuccess?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ExitFormProps {
  onSuccess?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}