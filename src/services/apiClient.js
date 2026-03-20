/**
 * API Client - Cliente HTTP Centralizado
 * 
 * Responsável por:
 * - Gerenciar requisições HTTP padronizadas
 * - Tratar autenticação (tokens, refresh)
 * - Interceptar requests/responses
 * - Formatar erros consistentemente
 * - Aplicar retry logic
 * 
 * Todos os serviços devem usar este client, nunca fazer fetch direto.
 */

const API_BASE = window.location.origin; // Mesmo domínio
const API_VERSION = 'v1';
const REQUEST_TIMEOUT = 30000; // 30 segundos

class ApiClientError extends Error {
  constructor(code, message, statusCode = 500, details = null) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

class ApiClient {
  constructor() {
    this.baseUrl = `${API_BASE}/api/${API_VERSION}`;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Obter token de autenticação
   * @returns {string|null}
   */
  getAuthToken() {
    // Para SSO Microsoft, usar token da MSAL
    // Para outras autenticações, usar sessionStorage
    return sessionStorage.getItem('auth_token') || null;
  }

  /**
   * Construir headers com autenticação
   * @returns {object}
   */
  getHeaders() {
    const headers = { ...this.defaultHeaders };
    const token = this.getAuthToken();
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Fazer requisição HTTP com tratamento de erro
   * @param {string} method - GET, POST, PATCH, DELETE
   * @param {string} path - Caminho relativo (/projects, /projects/123)
   * @param {object} body - Payload para POST/PATCH
   * @param {object} options - Opções adicionais (retry, timeout)
   * @returns {object} { success, data, error }
   */
  async request(method, path, body = null, options = {}) {
    const {
      retries = 3,
      timeout = REQUEST_TIMEOUT,
      skipAuth = false
    } = options;

    const url = `${this.baseUrl}${path}`;
    const headers = skipAuth ? this.defaultHeaders : this.getHeaders();
    
    const config = {
      method,
      headers,
      signal: AbortSignal.timeout(timeout)
    };

    if (body && ['POST', 'PATCH', 'PUT'].includes(method)) {
      config.body = JSON.stringify(body);
    }

    // Retry com backoff exponencial
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, config);
        return await this.handleResponse(response);
      } catch (error) {
        // Não fazer retry em erros de validação ou autenticação
        if (error.statusCode === 400 || error.statusCode === 401 || error.statusCode === 403) {
          throw error;
        }

        // Último retry falhou
        if (attempt === retries) {
          throw error;
        }

        // Backoff exponencial: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Processar resposta HTTP
   * @private
   */
  async handleResponse(response) {
    let data;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    // Sucesso (2xx)
    if (response.ok) {
      return {
        success: true,
        data: data?.data || data, // Compatível com padrão { success, data }
        status: response.status
      };
    }

    // Erros (4xx, 5xx)
    const errorCode = data?.error?.code || `HTTP_${response.status}`;
    const errorMessage = data?.error?.message || 'Erro desconhecido';
    const errorDetails = data?.error?.fields || data?.error;

    throw new ApiClientError(errorCode, errorMessage, response.status, errorDetails);
  }

  /**
   * GET - Buscar recurso
   */
  async get(path, options = {}) {
    return this.request('GET', path, null, options);
  }

  /**
   * POST - Criar recurso
   */
  async post(path, body, options = {}) {
    return this.request('POST', path, body, options);
  }

  /**
   * PATCH - Atualizar recurso
   */
  async patch(path, body, options = {}) {
    return this.request('PATCH', path, body, options);
  }

  /**
   * PUT - Substituir recurso
   */
  async put(path, body, options = {}) {
    return this.request('PUT', path, body, options);
  }

  /**
   * DELETE - Deletar recurso
   */
  async delete(path, options = {}) {
    return this.request('DELETE', path, null, options);
  }

  /**
   * Fazer upload de arquivo
   */
  async uploadFile(path, file, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const headers = this.getHeaders();
    
    // Remover Content-Type para FormData (browser define automaticamente)
    delete headers['Content-Type'];

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: AbortSignal.timeout(options.timeout || 60000)
      });

      return await this.handleResponse(response);
    } catch (error) {
      throw new ApiClientError(
        'UPLOAD_ERROR',
        'Erro ao fazer upload do arquivo',
        500,
        error
      );
    }
  }
}

// Exportar instância singleton
export const apiClient = new ApiClient();

// Exportar classe para testes
export { ApiClient, ApiClientError };