/**
 * ProjectListExample - Exemplo de Componente Refatorado
 * 
 * Demonstra como consumir APIs com os novos padrões:
 * - useApi hook
 * - projectService
 * - Tratamento de loading/error
 * - Display amigável de erros
 * 
 * Este é um exemplo. Use como template para refatorar componentes existentes.
 */

import { useState } from 'react';
import { useApi, useAsyncOperation } from '@/hooks/useApi';
import { projectService } from '@/services/projectService';
import { handleApiError } from '@/lib/errorHandler';
import { AlertCircle, Loader2, Trash2, Edit2 } from 'lucide-react';

export default function ProjectListExample() {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  // Buscar lista de projetos
  const { 
    data: projects, 
    loading: loadingProjects, 
    error: projectsError, 
    refetch 
  } = useApi(
    () => projectService.list(),
    { autoFetch: true }
  );

  // Deletar projeto
  const { 
    execute: deleteProject, 
    loading: deletingId 
  } = useAsyncOperation(
    (id) => projectService.delete(id),
    {
      onSuccess: () => {
        refetch(); // Recarregar lista
      },
      onError: (error) => {
        const processed = handleApiError(error, { action: 'delete_project' });
        showErrorNotification(processed.userMessage);
      }
    }
  );

  // Atualizar projeto
  const { 
    execute: updateProject, 
    loading: updating 
  } = useAsyncOperation(
    (id, data) => projectService.update(id, data),
    {
      onSuccess: () => {
        setEditingId(null);
        refetch();
      },
      onError: (error) => {
        const processed = handleApiError(error, { action: 'update_project' });
        showErrorNotification(processed.userMessage);
      }
    }
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Confirma exclusão?')) return;
    try {
      await deleteProject(id);
    } catch (error) {
      // Erro já tratado no onError acima
    }
  };

  const handleUpdate = async (id) => {
    try {
      await updateProject(id, formData);
    } catch (error) {
      // Erro já tratado no onError acima
    }
  };

  // Loading state
  if (loadingProjects) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin mr-2" size={20} />
        <span>Carregando projetos...</span>
      </div>
    );
  }

  // Error state
  if (projectsError) {
    const processed = handleApiError(projectsError, { component: 'ProjectList' });
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
        <div>
          <h3 className="font-semibold text-red-900">Erro ao carregar projetos</h3>
          <p className="text-sm text-red-700">{processed.userMessage}</p>
          <button 
            onClick={() => refetch()}
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Nenhum projeto encontrado</p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
          Criar primeiro projeto
        </button>
      </div>
    );
  }

  // Success state
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projetos ({projects.length})</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          Novo Projeto
        </button>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-4">
            {editingId === project.id ? (
              // Modo edição
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.nome || project.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(project.id)}
                    disabled={updating}
                    className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                  >
                    {updating ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 border border-gray-300 rounded"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              // Modo visualização
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{project.nome}</h3>
                  <p className="text-sm text-gray-600">{project.status}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Valor: R$ {project.valor_total?.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(project.id);
                      setFormData({ nome: project.nome });
                    }}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    disabled={deletingId === project.id}
                    className="p-2 hover:bg-red-100 rounded disabled:opacity-50"
                  >
                    {deletingId === project.id ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Mostrar notificação de erro
 * @todo Integrar com sistema de toast/notification
 */
function showErrorNotification(message) {
  console.error('[Notification]', message);
  // alert(message); // Implementar com toast library
}