export interface UseTransferProductListProps {
  locationId: string;
  entries: TransferProductEntry[];
  onEntriesChange: (entries: TransferProductEntry[]) => void;
}

export interface TransferProductEntry {
  id: string;
  productId: string;
  productName: string;
  batchNumber: string;
  expiryDate?: Date;
  availableQuantity: number;
  transferQuantity: number;
  unitPrice: number;
}