import React from 'react';
import { EntryForm } from '../organelles/movement/forms/EntryForm';
import { ExitForm } from '../organelles/movement/forms/ExitForm';
import { TransferForm } from '../organelles/movement/forms/TransferForm';

interface MovementFormProps {
  onSuccess?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: 'entrada' | 'saida' | 'transferencia';
}

export function MovementForm({ onSuccess, open, onOpenChange, initialType }: MovementFormProps) {
  
  if (initialType === 'saida') {
    return (
      <ExitForm 
        onSuccess={onSuccess}
        open={open}
        onOpenChange={onOpenChange}
      />
    );
  }

  if (initialType === 'transferencia') {
    return (
      <TransferForm
        onSuccess={onSuccess}
        open={open}
        onOpenChange={onOpenChange}
      />
    );
  }

  if (initialType === 'entrada') {
    return (
      <EntryForm 
        onSuccess={onSuccess}
        open={open}
        onOpenChange={onOpenChange}
      />
    );
  }

}