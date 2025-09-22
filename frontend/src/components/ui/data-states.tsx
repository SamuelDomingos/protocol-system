interface LoadingStateProps {
  message?: string;
}

interface ErrorStateProps {
  message: string;
}

interface EmptyStateProps {
  message?: string;
}

export function LoadingState({ message = "Carregando..." }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-muted-foreground">{message}</div>
    </div>
  );
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-destructive">Erro: {message}</div>
    </div>
  );
}

export function EmptyState({ message = "Nenhum item encontrado" }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-muted-foreground">{message}</div>
    </div>
  );
}