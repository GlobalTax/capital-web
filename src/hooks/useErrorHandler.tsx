
import { useCentralizedErrorHandler } from './useCentralizedErrorHandler';

// Mantener compatibilidad con la interfaz anterior
interface UseErrorHandlerReturn {
  handleError: (error: Error, context?: string) => void;
  handleAsyncError: (asyncFn: () => Promise<void>, context?: string) => Promise<void>;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const { handleError: centralizedHandleError, handleAsyncError: centralizedHandleAsyncError } = useCentralizedErrorHandler();

  const handleError = (error: Error, context?: string) => {
    centralizedHandleError(error, { component: context });
  };

  const handleAsyncError = async (
    asyncFn: () => Promise<void>, 
    context?: string
  ) => {
    await centralizedHandleAsyncError(asyncFn, { component: context });
  };

  return {
    handleError,
    handleAsyncError
  };
};
