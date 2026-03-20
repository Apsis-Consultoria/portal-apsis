/**
 * API Response Formatter Utility
 * Import and use in all backend functions
 * 
 * Exemplo:
 * import { formatSuccess, formatError } from './apiResponseFormatter.js';
 * return formatSuccess({ id: '123', name: 'test' })
 */

export const formatSuccess = (data, statusCode = 200) => {
  return Response.json({
    success: true,
    data,
    meta: { timestamp: new Date().toISOString(), version: 'v1' }
  }, { status: statusCode });
};

export const formatError = (code, message, statusCode = 500, details = null) => {
  return Response.json({
    success: false,
    error: { code, message, ...(details && { details }) },
    meta: { timestamp: new Date().toISOString() }
  }, { status: statusCode });
};

export const formatValidationError = (fields, message = 'Dados inválidos') => {
  return formatError('VALIDATION_ERROR', message, 400, { fields });
};

export const formatUnauthorized = (message = 'Token inválido') => {
  return formatError('UNAUTHORIZED', message, 401);
};

export const formatForbidden = (message = 'Sem permissão') => {
  return formatError('FORBIDDEN', message, 403);
};

export const formatNotFound = (resource = 'Recurso') => {
  return formatError('NOT_FOUND', `${resource} não encontrado`, 404);
};

export const formatInternalError = (message = 'Erro ao processar') => {
  return formatError('INTERNAL_SERVER_ERROR', message, 500);
};