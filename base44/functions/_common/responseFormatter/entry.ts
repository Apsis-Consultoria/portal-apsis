/**
 * Response Formatter - Padrão Unificado de Respostas
 * 
 * Todos os endpoints devem usar este formatter para garantir consistência.
 * 
 * Uso:
 * return responseFormatter.success(data, 200)
 * return responseFormatter.error('VALIDATION_ERROR', 'Campo inválido', 400, { fields: {...} })
 */

export const responseFormatter = {
  /**
   * Resposta de sucesso
   * @param {any} data - Dados a retornar
   * @param {number} statusCode - HTTP status (default: 200)
   * @param {object} meta - Metadados adicionais
   */
  success: (data, statusCode = 200, meta = {}) => {
    return Response.json(
      {
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          ...meta
        }
      },
      { status: statusCode }
    );
  },

  /**
   * Resposta de erro
   * @param {string} code - Código de erro (VALIDATION_ERROR, UNAUTHORIZED, etc)
   * @param {string} message - Mensagem de erro
   * @param {number} statusCode - HTTP status (default: 500)
   * @param {object} details - Detalhes adicionais (fields, etc)
   */
  error: (code, message, statusCode = 500, details = null) => {
    return Response.json(
      {
        success: false,
        error: {
          code,
          message,
          ...(details && { details })
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1'
        }
      },
      { status: statusCode }
    );
  },

  /**
   * Erro de validação (400)
   */
  validationError: (fields, message = 'Dados inválidos') => {
    return responseFormatter.error(
      'VALIDATION_ERROR',
      message,
      400,
      { fields }
    );
  },

  /**
   * Erro de autenticação (401)
   */
  unauthorized: (message = 'Token inválido ou expirado', action = null) => {
    return responseFormatter.error(
      'UNAUTHORIZED',
      message,
      401,
      action ? { action } : null
    );
  },

  /**
   * Erro de autorização (403)
   */
  forbidden: (message = 'Sem permissão para acessar este recurso') => {
    return responseFormatter.error(
      'FORBIDDEN',
      message,
      403
    );
  },

  /**
   * Recurso não encontrado (404)
   */
  notFound: (resource = 'Recurso') => {
    return responseFormatter.error(
      'NOT_FOUND',
      `${resource} não encontrado`,
      404
    );
  },

  /**
   * Conflito (409)
   */
  conflict: (message = 'Conflito de dados') => {
    return responseFormatter.error(
      'CONFLICT',
      message,
      409
    );
  },

  /**
   * Rate limit (429)
   */
  rateLimited: (retryAfter = 60) => {
    return responseFormatter.error(
      'RATE_LIMITED',
      'Muitas requisições. Aguarde antes de tentar novamente.',
      429,
      { retryAfter }
    );
  },

  /**
   * Erro interno (500)
   */
  internalError: (message = 'Erro ao processar solicitação', error = null) => {
    // Logar erro técnico (nunca expor detalhes ao cliente)
    if (error) {
      console.error('[Internal Error]', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }

    return responseFormatter.error(
      'INTERNAL_SERVER_ERROR',
      message,
      500
    );
  }
};

/**
 * Middleware para validação de request
 * 
 * Uso:
 * const body = await validateRequest(req, { nome: 'string|required', email: 'email' })
 */
export async function validateRequest(req, schema) {
  try {
    const body = await req.json();
    const errors = {};

    for (const [field, rule] of Object.entries(schema)) {
      const value = body[field];
      const rules = rule.split('|');

      for (const r of rules) {
        if (r === 'required' && !value) {
          errors[field] = `${field} é obrigatório`;
          break;
        }
        if (r === 'email' && value && !isValidEmail(value)) {
          errors[field] = 'Email inválido';
          break;
        }
        if (r === 'string' && value && typeof value !== 'string') {
          errors[field] = `${field} deve ser texto`;
          break;
        }
        if (r === 'number' && value && typeof value !== 'number') {
          errors[field] = `${field} deve ser número`;
          break;
        }
        if (r === 'array' && value && !Array.isArray(value)) {
          errors[field] = `${field} deve ser array`;
          break;
        }
        if (r === 'date' && value && isNaN(Date.parse(value))) {
          errors[field] = `${field} deve ser data válida`;
          break;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      throw { code: 'VALIDATION_ERROR', fields: errors };
    }

    return { body, errors: null };
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      throw error;
    }
    throw { code: 'INVALID_JSON', message: 'JSON inválido' };
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}