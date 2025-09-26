import { toast } from '@/src/hooks/use-toast';
import { useCallback } from 'react';

export function useFeedbackHandler() {
  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const errorMessage = error instanceof Error 
      ? error.message 
      : customMessage || 'Ocorreu um erro inesperado';
    
    console.error('Erro:', error);

    toast({
      title: 'Erro',
      description: errorMessage,
      variant: 'destructive',
    })
    
    return errorMessage;
  }, []);

  const handleSuccess = useCallback((message: string, customTitle?: string) => {
    toast({
      title: customTitle || 'Sucesso',
      description: message,
      variant: 'default',
    });
  }, []);

  return { handleError, handleSuccess };
}