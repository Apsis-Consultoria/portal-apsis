/**
 * Financial Service - Serviço para operações financeiras
 * 
 * Centraliza todas as chamadas relacionadas a contas a pagar/receber, fluxo de caixa
 */

import { apiClient } from './apiClient';

export const financialService = {
  // Contas a Receber
  receivables: {
    list: (filters = {}) => {
      const query = new URLSearchParams(filters).toString();
      return apiClient.get(`/receivables${query ? `?${query}` : ''}`);
    },
    getById: (id) => apiClient.get(`/receivables/${id}`),
    markAsPaid: (id) => apiClient.patch(`/receivables/${id}`, { status: 'pago' }),
    markAsOverdue: (id) => apiClient.patch(`/receivables/${id}`, { status: 'vencido' }),
    getDashboard: () => apiClient.get('/receivables/dashboard')
  },

  // Contas a Pagar
  payables: {
    list: (filters = {}) => {
      const query = new URLSearchParams(filters).toString();
      return apiClient.get(`/payables${query ? `?${query}` : ''}`);
    },
    getById: (id) => apiClient.get(`/payables/${id}`),
    create: (data) => apiClient.post('/payables', data),
    markAsPaid: (id) => apiClient.patch(`/payables/${id}`, { status: 'pago' }),
    getDashboard: () => apiClient.get('/payables/dashboard')
  },

  // Fluxo de Caixa
  cashFlow: {
    getDashboard: () => apiClient.get('/cash-flow/dashboard'),
    getProjection: (months = 12) => apiClient.get(`/cash-flow/projection?months=${months}`),
    getHistory: (filters = {}) => {
      const query = new URLSearchParams(filters).toString();
      return apiClient.get(`/cash-flow/history${query ? `?${query}` : ''}`);
    }
  },

  // Transações
  transactions: {
    list: (filters = {}) => {
      const query = new URLSearchParams(filters).toString();
      return apiClient.get(`/transactions${query ? `?${query}` : ''}`);
    },
    getById: (id) => apiClient.get(`/transactions/${id}`)
  }
};