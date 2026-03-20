/**
 * Project Service - Serviço para operações com projetos
 * 
 * Centraliza todas as chamadas relacionadas a projetos
 * Usa apiClient como cliente HTTP
 * 
 * Padrão:
 * - Métodos retornam Promise<{ data, error }>
 * - Não faz try/catch (deixa bubbling para o componente)
 * - Formata dados para o formato esperado pelo frontend
 */

import { apiClient } from './apiClient';

export const projectService = {
  /**
   * Listar todos os projetos
   */
  list: (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const path = `/projects${query ? `?${query}` : ''}`;
    return apiClient.get(path);
  },

  /**
   * Obter projeto por ID
   */
  getById: (id) => {
    if (!id) throw new Error('Project ID is required');
    return apiClient.get(`/projects/${id}`);
  },

  /**
   * Criar novo projeto
   */
  create: (data) => {
    if (!data.nome) throw new Error('Project name is required');
    if (!data.cliente_id) throw new Error('Client ID is required');
    return apiClient.post('/projects', data);
  },

  /**
   * Atualizar projeto
   */
  update: (id, data) => {
    if (!id) throw new Error('Project ID is required');
    return apiClient.patch(`/projects/${id}`, data);
  },

  /**
   * Deletar projeto
   */
  delete: (id) => {
    if (!id) throw new Error('Project ID is required');
    return apiClient.delete(`/projects/${id}`);
  },

  /**
   * Atualizar status do projeto
   */
  updateStatus: (id, status) => {
    if (!id) throw new Error('Project ID is required');
    if (!status) throw new Error('Status is required');
    return apiClient.patch(`/projects/${id}`, { status });
  },

  /**
   * Obter riscos do projeto
   */
  getRisks: (projectId) => {
    if (!projectId) throw new Error('Project ID is required');
    return apiClient.get(`/projects/${projectId}/risks`);
  },

  /**
   * Obter documentos do projeto
   */
  getDocuments: (projectId) => {
    if (!projectId) throw new Error('Project ID is required');
    return apiClient.get(`/projects/${projectId}/documents`);
  },

  /**
   * Obter parcelas/installments do projeto
   */
  getInstallments: (projectId) => {
    if (!projectId) throw new Error('Project ID is required');
    return apiClient.get(`/projects/${projectId}/installments`);
  },

  /**
   * Obter horas trabalhadas no projeto
   */
  getTimeEntries: (projectId) => {
    if (!projectId) throw new Error('Project ID is required');
    return apiClient.get(`/projects/${projectId}/time-entries`);
  },

  /**
   * Exportar projeto para PDF
   */
  exportToPdf: (projectId) => {
    if (!projectId) throw new Error('Project ID is required');
    return apiClient.get(`/projects/${projectId}/export/pdf`);
  }
};