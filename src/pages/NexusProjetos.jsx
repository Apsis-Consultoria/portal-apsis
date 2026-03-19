import { useState } from 'react';
import { Search, Filter, LayoutGrid, BarChart3, ChevronRight, Lock, Eye, Clock, User, CheckCircle, AlertCircle, TrendingUp, Share2, FileText, MessageSquare } from 'lucide-react';

const ProjectsHeader = () => (
  <div className="bg-gradient-to-r from-[var(--apsis-green)] to-[var(--apsis-green-light)] text-white rounded-lg p-6 mb-6">
    <h1 className="text-2xl font-bold mb-2">Gerenciamento de Projetos</h1>
    <p className="text-white/80 text-sm">Acompanhamento centralizado com visibilidade controlada por cliente, documentos auditáveis e comunicação integrada.</p>
  </div>
);

const ProgressBar = ({ value }) => (
  <div className="w-full bg-[var(--border)] rounded-full h-1.5 overflow-hidden">
    <div
      style={{ width: `${value}%` }}
      className="h-full bg-gradient-to-r from-[var(--apsis-orange)] to-[var(--apsis-orange-light)]"
    />
  </div>
);

const ProjectCard = ({ project, onClick }) => {
  const statusIcons = {
    'Não iniciado': '⏳',
    'Ativo': '▶️',
    'Pausado': '⏸️',
    'Cancelado': '❌'
  };

  const statusColors = {
    'Não iniciado': 'bg-gray-100 text-gray-700',
    'Ativo': 'bg-green-100 text-green-700',
    'Pausado': 'bg-amber-100 text-amber-700',
    'Cancelado': 'bg-red-100 text-red-700'
  };

  const priorityIcons = {
    'Baixa': '🟢',
    'Média': '🟡',
    'Alta': '🔴',
    'Crítica': '🔴🔴'
  };

  return (
    <button
      onClick={onClick}
      className="bg-white border border-[var(--border)] rounded-lg p-5 hover:shadow-md transition-all text-left hover:border-[var(--apsis-orange)]/50"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-[var(--text-primary)] line-clamp-2">{project.name}</h3>
            {project.visibleToClient && <Eye size={14} className="text-green-600 flex-shrink-0" />}
          </div>
          <p className="text-xs text-[var(--text-secondary)]">{project.client}</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ml-2 ${statusColors[project.status]}`}>
          {statusIcons[project.status]} {project.status}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wide">Progresso</span>
          <span className="text-xs font-bold text-[var(--apsis-orange)]">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} />
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-2 mb-4 pb-4 border-b border-[var(--border)]">
        <div>
          <p className="text-xs text-[var(--text-secondary)]">Responsável</p>
          <p className="text-sm font-medium text-[var(--text-primary)]">{project.responsible}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)]">Prioridade</p>
          <p className="text-sm font-medium">{priorityIcons[project.priority]} {project.priority}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)]">Início</p>
          <p className="text-sm font-medium text-[var(--text-primary)]">{project.startDate}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)]">Prazo</p>
          <p className="text-sm font-medium text-[var(--text-primary)]">{project.dueDate}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-4">
        <p className="text-xs text-[var(--text-secondary)] mb-2">Última atualização</p>
        <p className="text-xs text-[var(--text-primary)]">{project.lastUpdate}</p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)]">
          <FileText size={13} /> Docs
        </button>
        <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)]">
          <MessageSquare size={13} /> Chat
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            alert('Projeto selecionado');
          }}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded bg-[var(--apsis-orange)]/10 text-[var(--apsis-orange)] hover:bg-[var(--apsis-orange)]/20"
        >
          <ChevronRight size={13} /> Detalhes
        </button>
      </div>
    </button>
  );
};

const ProjectModal = ({ project, onClose }) => {
  const tabs = ['Visão Geral', 'Comunicação', 'Documentos', 'Status'];
  const [activeTab, setActiveTab] = useState('Visão Geral');

  if (!project) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--apsis-green)] to-[var(--apsis-green-light)] text-white p-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">{project.name}</h2>
            <p className="text-white/80 text-sm">{project.client}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl">×</button>
        </div>

        {/* Tabs */}
        <div className="border-b border-[var(--border)] flex gap-1 px-6 bg-white">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-[var(--apsis-orange)] text-[var(--apsis-orange)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'Visão Geral' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-1">STATUS</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">{project.status}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-1">PROGRESSO</p>
                  <p className="text-lg font-bold text-[var(--apsis-orange)]">{project.progress}%</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-1">RESPONSÁVEL</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{project.responsible}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-1">PRIORIDADE</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{project.priority}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-1">DATA INÍCIO</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{project.startDate}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-1">PRAZO</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{project.dueDate}</p>
                </div>
              </div>

              <div className="bg-[var(--surface-2)] rounded-lg p-4">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Descrição do Projeto</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{project.description}</p>
              </div>

              {project.visibleToClient && (
                <div className="border border-green-200 bg-green-50 rounded-lg p-4 flex gap-3">
                  <Eye size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-900">Compartilhado com cliente</p>
                    <p className="text-xs text-green-700 mt-1">Cliente pode visualizar documentos e receber atualizações</p>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'Comunicação' && (
            <div className="space-y-3">
              <p className="text-sm text-[var(--text-secondary)]">📋 Últimas mensagens do projeto</p>
              <div className="bg-[var(--surface-2)] rounded-lg p-4 text-xs text-[var(--text-secondary)]">
                Comunicação integrada com o Communication Center. Clique em "Chat" na página anterior para acessar.
              </div>
            </div>
          )}

          {activeTab === 'Documentos' && (
            <div className="space-y-3">
              <p className="text-sm text-[var(--text-secondary)]">📄 Documentos do projeto</p>
              <div className="bg-[var(--surface-2)] rounded-lg p-4 text-xs text-[var(--text-secondary)]">
                Documentos gerenciados na Data Room. Clique em "Docs" na página anterior para acessar.
              </div>
            </div>
          )}

          {activeTab === 'Status' && (
            <div className="space-y-4">
              <div className="bg-[var(--surface-2)] rounded-lg p-4">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3 text-sm">Histórico de Atualizações</h3>
                <div className="space-y-3 text-xs">
                  <div className="pb-3 border-b border-[var(--border)]">
                    <p className="font-medium text-[var(--text-primary)]">Fase 2 iniciada</p>
                    <p className="text-[var(--text-secondary)] mt-1">há 3 dias</p>
                  </div>
                  <div className="pb-3 border-b border-[var(--border)]">
                    <p className="font-medium text-[var(--text-primary)]">Prototipo aprovado</p>
                    <p className="text-[var(--text-secondary)] mt-1">há 5 dias</p>
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">Projeto iniciado</p>
                    <p className="text-[var(--text-secondary)] mt-1">2 semanas atrás</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[var(--surface-2)] border-t border-[var(--border)] px-6 py-3 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-white"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default function NexusProjetos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProject, setSelectedProject] = useState(null);

  const projects = [
    { id: 1, name: 'Auditoria Contábil 2025', client: 'TechCorp Brasil', status: 'Ativo', progress: 65, responsible: 'João Silva', priority: 'Alta', startDate: '01/02/2026', dueDate: '30/04/2026', lastUpdate: 'há 2 horas', visibleToClient: true, description: 'Auditoria completa das demonstrações contábeis do exercício 2025 com foco em conformidade regulatória.' },
    { id: 2, name: 'Consultoria Tributária', client: 'Global Solutions', status: 'Ativo', progress: 40, responsible: 'Marina Silva', priority: 'Média', startDate: '15/02/2026', dueDate: '15/05/2026', lastUpdate: 'ontem', visibleToClient: true, description: 'Planejamento tributário e otimização fiscal para o próximo exercício.' },
    { id: 3, name: 'Análise de Valuation', client: 'Logística Global Inc', status: 'Pausado', progress: 30, responsible: 'Carlos Santos', priority: 'Alta', startDate: '01/03/2026', dueDate: '30/06/2026', lastUpdate: 'há 3 dias', visibleToClient: false, description: 'Avaliação patrimonial para fins de aquisição.' },
    { id: 4, name: 'M&A Due Diligence', client: 'Tech Innovations Ltd', status: 'Não iniciado', progress: 0, responsible: 'Ana Costa', priority: 'Crítica', startDate: '10/04/2026', dueDate: '30/05/2026', lastUpdate: 'Não iniciado', visibleToClient: true, description: 'Due diligence financeiro, legal e tributário para operação de M&A.' },
  ];

  const filteredProjects = projects.filter(proj => {
    const matchesSearch = proj.name.toLowerCase().includes(searchTerm.toLowerCase()) || proj.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || proj.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <ProjectsHeader />

      {/* Filters */}
      <div className="bg-white border border-[var(--border)] rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-2 uppercase tracking-wide">Buscar Projeto</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Nome ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--apsis-orange)]/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-2 uppercase tracking-wide">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--apsis-orange)]/50"
            >
              <option>Todos</option>
              <option>Ativo</option>
              <option>Pausado</option>
              <option>Não iniciado</option>
              <option>Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-2 uppercase tracking-wide">Visualização</label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                  viewMode === 'grid'
                    ? 'bg-[var(--apsis-orange)] text-white'
                    : 'bg-[var(--surface-2)] text-[var(--text-secondary)]'
                }`}
              >
                <LayoutGrid size={14} /> Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                  viewMode === 'list'
                    ? 'bg-[var(--apsis-orange)] text-white'
                    : 'bg-[var(--surface-2)] text-[var(--text-secondary)]'
                }`}
              >
                <BarChart3 size={14} /> Lista
              </button>
            </div>
          </div>
        </div>

        <div className="text-xs text-[var(--text-secondary)]">
          {filteredProjects.length} projeto(s) encontrado(s)
        </div>
      </div>

      {/* Projects Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(proj => (
            <ProjectCard key={proj.id} project={proj} onClick={() => setSelectedProject(proj)} />
          ))}
        </div>
      )}

      {/* Projects List */}
      {viewMode === 'list' && (
        <div className="bg-white border border-[var(--border)] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface-2)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--text-primary)]">Projeto</th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--text-primary)]">Cliente</th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--text-primary)]">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--text-primary)]">Progresso</th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--text-primary)]">Responsável</th>
                  <th className="px-4 py-3 text-center font-semibold text-[var(--text-primary)]">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map(proj => (
                  <tr key={proj.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-2)]">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">{proj.name}</p>
                        {proj.visibleToClient && <span className="text-xs text-green-600 flex items-center gap-1 mt-1"><Eye size={12} /> Compartilhado</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{proj.client}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        proj.status === 'Ativo' ? 'bg-green-100 text-green-700' :
                        proj.status === 'Pausado' ? 'bg-amber-100 text-amber-700' :
                        proj.status === 'Não iniciado' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {proj.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-[var(--border)] rounded-full h-1.5 w-20">
                          <div
                            style={{ width: `${proj.progress}%` }}
                            className="h-full bg-[var(--apsis-orange)] rounded-full"
                          />
                        </div>
                        <span className="text-xs font-bold text-[var(--apsis-orange)]">{proj.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{proj.responsible}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedProject(proj)}
                        className="text-[var(--apsis-orange)] hover:underline text-xs font-medium"
                      >
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
}