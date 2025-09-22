import { ReactNode } from 'react';
import { LoadingState, ErrorState, EmptyState } from './data-states';

interface DataTableWrapperProps {
  isLoading: boolean;
  error: string | null;
  data: any[];
  children: ReactNode;
  loadingMessage?: string;
  emptyMessage?: string;
}

export function DataTableWrapper({
  isLoading,
  error,
  data,
  children,
  loadingMessage,
  emptyMessage,
}: DataTableWrapperProps) {
  if (isLoading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return <>{children}</>;
}