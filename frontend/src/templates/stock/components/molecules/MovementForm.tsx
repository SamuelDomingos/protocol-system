import React from 'react';
import { EntryForm } from '../organelles/movement/EntryForm';
import { ExitForm } from '../organelles/movement/ExitForm';

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

  return (
    <EntryForm 
      onSuccess={onSuccess}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}