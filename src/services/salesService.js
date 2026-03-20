/**
 * Sales Service - Serviço para operações com vendas
 * 
 * Centraliza todas as chamadas relacionadas a vendas, oportunidades e propostas
 */

import { apiClient } from './apiClient';

export const salesService = {
  // Oportunidades
  opportunities: {
    list: (filters = {}) => {
      const query = new URLSearchParams(filters).toString();
      return apiClient.get(`/opportunities${query ? `?${query}` : ''}`);
    },
    getById: (id) => apiClient.get(`/opportunities/${id}`),
    create: (data) => apiClient.post('/opportunities', data),
    update: (id, data) => apiClient.patch(`/opportunities/${id}`, data),
    delete: (id) => apiClient.delete(`/opportunities/${id}`),
    convertToProject: (id, projectData) => apiClient.post(`/opportunities/${id}/convert`, projectData)
  },

  // Propostas
  proposals: {
    list: (filters = {}) => {
      const query = new URLSearchParams(filters).toString();
      return apiClient.get(`/proposals${query ? `?${query}` : ''}`);
    },
    getById: (id) => apiClient.get(`/proposals/${id}`),
    create: (data) => apiClient.post('/proposals', data),
    update: (id, data) => apiClient.patch(`/proposals/${id}`, data),
    delete: (id) => apiClient.delete(`/proposals/${id}`),
    sendToClient: (id) => apiClient.post(`/proposals/${id}/send`, {}),
    approve: (id) => apiClient.patch(`/proposals/${id}`, { status: 'aprovado' })
  },

  // Clientes
  clients: {
    list: (filters = {}) => {
      const query = new URLSearchParams(filters).toString();
      return apiClient.get(`/clients${query ? `?${query}` : ''}`);
    },
    getById: (id) => apiClient.get(`/clients/${id}`),
    create: (data) => apiClient.post('/clients', data),
    update: (id, data) => apiClient.patch(`/clients/${id}`, data),
    delete: (id) => apiClient.delete(`/clients/${id}`)
  },

  // Pipeline
  pipeline: {
    list: () => apiClient.get('/pipeline'),
    getByStage: (stage) => apiClient.get(`/pipeline/stage/${stage}`),
    updateStage: (opportunityId, stage) => 
      apiClient.patch(`/opportunities/${opportunityId}`, { stage })
  }
};