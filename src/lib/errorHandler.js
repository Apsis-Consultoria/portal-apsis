/**
 * Error Handler - Tratamento Centralizado de Erros
 * 
 * Responsável por:
 * - Padronizar erros de API
 * - Mapear erros para ações do usuário
 * - Diferenciar entre erros técnicos e validações
 * - Logar erros de forma segura
 */

/**
 * Processar erro de API e retornar informações úteis
 * @param {ApiClientError|Error} error
 * @param {object} context - Contexto adicional (página, ação, etc)
 * @returns {object}
 */
export function handleApiError(error, context = {}) {
  const errorInfo = {
    code: error.code || 'UNKNOWN_ERROR',
    message: error.message || 'Erro desconhecido',
    statusCode: error.statusCode || 500,
    fields: error.fields || null,
    context,
    timestamp: new Date().toISOString()
  };

  // Log técnico (nunca dados sensíveis)
  logError(errorInfo);

  // Retornar informações processadas
  return {
    ...errorInfo,
    userMessage: getUserMessage(errorInfo.code),
    isValidationError: errorInfo.code === 'VALIDATION_ERROR',
    isAuthError: errorInfo.code === 'UNAUTHORIZED',
    isForbiddenError: errorInfo.code === 'FORBIDDEN',
    shouldRetry: isRetryable(errorInfo.code),
    action: getErrorAction(errorInfo.code)
  };
}

/**
 * Obter mensagem amigável para exibir ao usuário
 * @private
 */
function getUserMessage(code) {
  const messages = {
    'VALIDATION_ERROR': 'Por favor, corrija os campos destacados.',
    'UNAUTHORIZED': 'Sua sessão expirou. Por favor, faça login novamente.',
    'FORBIDDEN': 'Você não tem permissão para acessar este recurso.',
    'NOT_FOUND': 'O recurso solicitado não foi encontrado.',
    'CONFLICT': 'Conflito de dados. Este item pode estar duplicado.',
    'RATE_LIMITED': 'Muitas requisições. Por favor, aguarde alguns segundos antes de tentar novamente.',
    'INTERNAL_SERVER_ERROR': 'Erro ao processar solicitação. Por favor, tente novamente.',
    'TIMEOUT': 'A requisição demorou muito. Verifique sua conexão e tente novamente.',
    'NETWORK_ERROR': 'Erro de conexão. Verifique sua internet.',
    'UNKNOWN_ERROR': 'Erro desconhecido. Por favor, tente novamente.'
  };

  return messages[code] || messages['UNKNOWN_ERROR'];
}

/**
 * Determinar se um erro pode ser retentado automaticamente
 * @private
 */
function isRetryable(code) {
  // Não fazer retry em erros de autenticação, validação ou autorização
  const nonRetryable = ['VALIDATION_ERROR', 'UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND'];
  return !nonRetryable.includes(code);
}

/**
 * Obter ação recomendada para o erro
 * @private
 */
function getErrorAction(code) {
  const actions = {
    'VALIDATION_ERROR': { type: 'show_fields', message: 'Corrija os campos com erro.' },
    'UNAUTHORIZED': { type: 'redirect_login', message: 'Faça login novamente.' },
    'FORBIDDEN': { type: 'show_error', message: 'Acesso negado.' },
    'NOT_FOUND': { type: 'redirect_back', message: 'Item não encontrado.' },
    'RATE_LIMITED': { type: 'wait_retry', retryAfter: 5000 },
    'INTERNAL_SERVER_ERROR': { type: 'show_error', message: 'Erro no servidor.' },
    'TIMEOUT': { type: 'retry', message: 'Requisição expirou.' },
    'NETWORK_ERROR': { type: 'show_error', message: 'Erro de conexão.' }
  };

  return actions[code] || { type: 'show_error', message: 'Erro desconhecido.' };
}

/**
 * Logar erro de forma segura (sem dados sensíveis)
 * @private
 */
function logError(errorInfo) {
  // Log em console (desenvolvimento)
  if (import.meta.env.DEV) {
    console.error('[API Error]', {
      code: errorInfo.code,
      message: errorInfo.message,
      statusCode: errorInfo.statusCode,
      context: errorInfo.context,
      timestamp: errorInfo.timestamp
    });
  }

  // Enviar para sistema de logging (production)
  // Por enquanto, apenas registrar no console
  // TODO: Integrar com Sentry, LogRocket, etc.
}

/**
 * Validar resposta de erro e garantir que está no formato esperado
 * @private
 */
export function isValidErrorResponse(data) {
  return (
    data &&
    typeof data === 'object' &&
    data.success === false &&
    data.error &&
    typeof data.error === 'object'
  );
}

/**
 * Validar resposta de sucesso
 * @private
 */
export function isValidSuccessResponse(data) {
  return (
    data &&
    typeof data === 'object' &&
    data.success === true &&
    'data' in data
  );
}

/**
 * Extrair mensagem de erro de resposta em qualquer formato
 */
export function extractErrorMessage(error) {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error?.message) return error.error.message;
  return 'Erro desconhecido';
}

/**
 * Hook para usar em componentes
 * Exemplo: const { showError } = useErrorHandler()
 */
export function useErrorHandler() {
  const showError = (error, context = {}) => {
    const processed = handleApiError(error, context);
    
    // Aqui você pode usar um toast, modal, ou outro componente
    // Por enquanto, apenas retornar as informações
    return processed;
  };

  const showValidationErrors = (fields) => {
    // Exibir erros de validação em campos específicos
    return {
      isValidationError: true,
      fields,
      userMessage: 'Por favor, corrija os campos destacados.'
    };
  };

  return { showError, showValidationErrors };
}