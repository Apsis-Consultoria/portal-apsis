/**
 * Hook useApi - Gerenciar requisições HTTP com loading, error, data
 * 
 * Uso:
 * const { data, loading, error, refetch } = useApi(() => apiClient.get('/projects'))
 * const { data, error, loading } = useApi(() => apiClient.post('/projects', formData), { autoFetch: false })
 */

import { useState, useEffect, useCallback } from 'react';
import { ApiClientError } from '@/services/apiClient';

export function useApi(fetchFn, options = {}) {
  const {
    autoFetch = true,
    dependencies = [],
    onSuccess = null,
    onError = null
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchFn();
      setData(response.data);
      
      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (err) {
      const apiError = formatApiError(err);
      setError(apiError);
      
      if (onError) {
        onError(apiError);
      }

      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [fetchFn, onSuccess, onError]);

  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch: fetch,
    reset: () => {
      setData(null);
      setError(null);
      setLoading(false);
    }
  };
}

/**
 * Hook useAsyncOperation - Para operações POST/PATCH/DELETE com loading
 * 
 * Uso:
 * const { execute, loading, error } = useAsyncOperation(data => apiClient.post('/projects', data))
 * const handleSubmit = (formData) => execute(formData)
 */
export function useAsyncOperation(operationFn, options = {}) {
  const { onSuccess = null, onError = null } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (payload) => {
      setLoading(true);
      setError(null);

      try {
        const response = await operationFn(payload);
        
        if (onSuccess) {
          onSuccess(response);
        }

        return response;
      } catch (err) {
        const apiError = formatApiError(err);
        setError(apiError);
        
        if (onError) {
          onError(apiError);
        }

        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [operationFn, onSuccess, onError]
  );

  return {
    execute,
    loading,
    error,
    reset: () => setError(null)
  };
}

/**
 * Formatar erro de API para formato consistente
 * @private
 */
function formatApiError(error) {
  if (error instanceof ApiClientError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      fields: error.details?.fields || null,
      userMessage: getUserMessage(error.code),
      isValidationError: error.code === 'VALIDATION_ERROR',
      isAuthError: error.code === 'UNAUTHORIZED',
      isForbiddenError: error.code === 'FORBIDDEN'
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: error.message || 'Erro desconhecido',
    statusCode: 500,
    fields: null,
    userMessage: 'Erro ao processar solicitação. Por favor, tente novamente.',
    isValidationError: false,
    isAuthError: false,
    isForbiddenError: false
  };
}

/**
 * Obter mensagem amigável para o usuário baseado no código de erro
 * @private
 */
function getUserMessage(code) {
  const messages = {
    'VALIDATION_ERROR': 'Por favor, corrija os campos destacados.',
    'UNAUTHORIZED': 'Sua sessão expirou. Por favor, faça login novamente.',
    'FORBIDDEN': 'Você não tem permissão para acessar este recurso.',
    'NOT_FOUND': 'Recurso não encontrado.',
    'CONFLICT': 'Conflito de dados. Este recurso pode estar duplicado.',
    'RATE_LIMITED': 'Muitas requisições. Por favor, aguarde alguns segundos.',
    'INTERNAL_SERVER_ERROR': 'Erro no servidor. Por favor, tente novamente mais tarde.',
    'TIMEOUT': 'Requisição expirou. Verifique sua conexão e tente novamente.',
    'NETWORK_ERROR': 'Erro de conexão. Verifique sua internet.'
  };

  return messages[code] || 'Erro ao processar solicitação. Por favor, tente novamente.';
}