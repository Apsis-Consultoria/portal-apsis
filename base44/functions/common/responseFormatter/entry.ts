/**
 * Response Formatter - Padrão Unificado de Respostas
 * 
 * Todos os endpoints devem usar este formatter para garantir consistência.
 * 
 * Uso:
 * import { responseFormatter } from '../common/responseFormatter.js';
 * return responseFormatter.success(data, 200)
 */

export const responseFormatter = {
  /**
   * Resposta de sucesso
   */
  success: (data, statusCode = 200, meta = {}) => {
    return Response.json({
      success: true,
      data,
      meta: { timestamp: new Date().toISOString(), version: 'v1', ...meta }
    }, { status: statusCode });
  },

  /**
   * Resposta de erro
   */
  error: (code, message, statusCode = 500, details = null) => {
    return Response.json({
      success: false,
      error: { code, message, ...(details && { details }) },
      meta: { timestamp: new Date().toISOString(), version: 'v1' }
    }, { status: statusCode });
  },

  validationError: (fields, message = 'Dados inválidos') => {
    return responseFormatter.error('VALIDATION_ERROR', message, 400, { fields });
  },

  unauthorized: (message = 'Token inválido ou expirado') => {
    return responseFormatter.error('UNAUTHORIZED', message, 401);
  },

  forbidden: (message = 'Sem permissão') => {
    return responseFormatter.error('FORBIDDEN', message, 403);
  },

  notFound: (resource = 'Recurso') => {
    return responseFormatter.error('NOT_FOUND', `${resource} não encontrado`, 404);
  },

  conflict: (message = 'Conflito de dados') => {
    return responseFormatter.error('CONFLICT', message, 409);
  },

  internalError: (message = 'Erro ao processar solicitação') => {
    return responseFormatter.error('INTERNAL_SERVER_ERROR', message, 500);
  }
};