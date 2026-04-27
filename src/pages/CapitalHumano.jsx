import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { colaboradoresService } from '@/lib/supabaseColaboradores';
import { LayoutDashboard, Users, Calendar, Settings, Briefcase, ExternalLink, Search, Loader2, User, Plus, Edit2, Trash2, Upload, ChevronUp, ChevronDown, ChevronsUpDown, Filter, X } from 'lucide-react';
import ColaboradorFormModal from '@/components/capitalhumano/ColaboradorFormModal';
import ImportarColaboradoresModal from '@/components/capitalhumano/ImportarColaboradoresModal';

export default function CapitalHumano() {
  const urlTab = new URLSearchParams(window.location.search).get('tab');
  const [activeTab, setActiveTab] = useState(urlTab || 'dashboard');
  const [colaboradores, setColaboradores] = useState([]);
  const [loadingColabs, setLoadingColabs] = useState(true);
  const [search, setSearch] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingColab, setEditingColab] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'nome', dir: 'asc' });
  const [filters, setFilters] = useState({ departamento: '', unidade: '', tipo_vinculo: '' });
  const [openFilter, setOpenFilter] = useState(null);

  useEffect(() => {
    const handleClick = () => setOpenFilter(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab) setActiveTab(tab);
  }, []);

  // Carrega colaboradores uma única vez ao montar a página
  useEffect(() => {
    carregarColaboradores();
  }, []);

  const [erroCarregamento, setErroCarregamento] = useState(null);

  const carregarColaboradores = async () => {
    setLoadingColabs(true);
    setErroCarregamento(null);
    try {
      const data = await colaboradoresService.list();
      setColaboradores(data || []);
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      setErroCarregamento(error?.message || 'Erro ao conectar com o Supabase');
    } finally {
      setLoadingColabs(false);
    }
  };

  const handleNovoColab = () => {
    setEditingColab(null);
    setShowFormModal(true);
  };

  const handleEditColab = (colab) => {
    setEditingColab(colab);
    setShowFormModal(true);
  };

  const handleDeleteColab = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este colaborador?')) {
      try {
        await colaboradoresService.delete(id);
        carregarColaboradores();
      } catch (error) {
        alert('Erro ao deletar colaborador');
      }
    }
  };

  const handleSaved = () => {
    carregarColaboradores();
  };

  const handleSort = (key) => {
    setSortConfig(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  };

  const uniqueValues = (field) => [...new Set(colaboradores.map(c => c[field]).filter(Boolean))].sort();

  const filteredAndSorted = colaboradores
    .filter(c => !search || c.nome?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()))
    .filter(c => !filters.departamento || c.departamento === filters.departamento)
    .filter(c => !filters.unidade || c.unidade === filters.unidade)
    .filter(c => !filters.tipo_vinculo || c.tipo_vinculo === filters.tipo_vinculo)
    .sort((a, b) => {
      const va = a[sortConfig.key] ?? '';
      const vb = b[sortConfig.key] ?? '';
      return sortConfig.dir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });

  const SortIcon = ({ field }) => {
    if (sortConfig.key !== field) return <ChevronsUpDown size={12} className="text-[var(--text-secondary)] opacity-40" />;
    return sortConfig.dir === 'asc' ? <ChevronUp size={12} className="text-[#F47920]" /> : <ChevronDown size={12} className="text-[#F47920]" />;
  };

  const FilterDropdown = ({ field, label }) => {
    const values = uniqueValues(field);
    const active = filters[field];
    const isOpen = openFilter === field;
    return (
      <div className="relative inline-block">
        <button
          onClick={(e) => { e.stopPropagation(); setOpenFilter(isOpen ? null : field); }}
          className={`ml-1 p-0.5 rounded transition-colors ${active ? 'text-[#F47920]' : 'text-[var(--text-secondary)] opacity-40 hover:opacity-80'}`}
          title={`Filtrar ${label}`}
        >
          <Filter size={11} />
        </button>
        {isOpen && (
          <div
            className="absolute left-0 top-6 z-50 bg-white border border-[var(--border)] rounded-xl shadow-lg py-1 min-w-[200px] max-h-64 overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setFilters(f => ({ ...f, [field]: '' })); setOpenFilter(null); }}
              className="w-full text-left px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-2)] flex items-center gap-2"
            >
              <X size={11} /> Limpar filtro
            </button>
            <div className="border-t border-[var(--border)] my-1" />
            {values.length === 0 ? (
              <p className="px-3 py-2 text-xs text-[var(--text-secondary)] italic">Sem opções</p>
            ) : values.map(v => (
              <button
                key={v}
                onClick={() => { setFilters(f => ({ ...f, [field]: v })); setOpenFilter(null); }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-[var(--surface-2)] ${active === v ? 'font-semibold text-[#F47920]' : 'text-[var(--text-primary)]'}`}
              >
                {v}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'colaboradores', label: 'Colaboradores', icon: Users },
    { id: 'alocacoes', label: 'Alocações', icon: Calendar },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="space-y-6 h-full">
      <div className="bg-gradient-to-r from-[var(--apsis-green)] to-[var(--apsis-green-light)] text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Capital Humano</h1>
        <p className="text-white/80 text-sm">Gerencie colaboradores, alocações e recursos de pessoal.</p>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="flex border-b border-[var(--border)]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                  isActive
                    ? 'text-[var(--apsis-orange)] border-[var(--apsis-orange)]'
                    : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'dashboard' && (() => {
            const ativos = colaboradores.filter(c => c.ativo !== false);
            const inativos = colaboradores.filter(c => c.ativo === false);
            const total = colaboradores.length;
            const totalAtivos = ativos.length;
            const capacidadeTotal = ativos.reduce((acc, c) => acc + (c.capacidade_horas_mensais ?? 160), 0);

            // Por unidade
            const porUnidade = ativos.reduce((acc, c) => {
              const u = c.unidade || 'N/A';
              acc[u] = (acc[u] || 0) + 1;
              return acc;
            }, {});

            // Por departamento (top 8)
            const porDept = ativos.reduce((acc, c) => {
              const d = c.departamento || 'N/A';
              acc[d] = (acc[d] || 0) + 1;
              return acc;
            }, {});
            const deptSorted = Object.entries(porDept).sort((a, b) => b[1] - a[1]).slice(0, 8);
            const maxDept = deptSorted[0]?.[1] || 1;

            const UNIT_COLORS = { RJ: '#1A4731', SP: '#F47920', Carbon: '#3B82F6', REDD: '#8B5CF6', 'N/A': '#94A3B8' };

            return (
              <div className="space-y-6">
                {loadingColabs ? (
                  <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[#F47920]" /></div>
                ) : (
                  <>
                    {/* KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Total de Colaboradores', value: total, color: 'text-[var(--apsis-green)]', bg: 'bg-[#1A4731]/5' },
                        { label: 'Ativos', value: totalAtivos, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Inativos', value: inativos.length, color: 'text-gray-500', bg: 'bg-gray-50' },
                        { label: 'Cap. Total (h/mês)', value: capacidadeTotal.toLocaleString('pt-BR') + 'h', color: 'text-blue-600', bg: 'bg-blue-50' },
                      ].map(kpi => (
                        <div key={kpi.label} className={`${kpi.bg} p-5 rounded-xl border border-[var(--border)]`}>
                          <p className="text-xs text-[var(--text-secondary)] mb-1">{kpi.label}</p>
                          <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Por Unidade */}
                      <div className="bg-white border border-[var(--border)] rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Colaboradores por Unidade</h3>
                        <div className="space-y-3">
                          {Object.entries(porUnidade).sort((a, b) => b[1] - a[1]).map(([unidade, count]) => (
                            <div key={unidade} className="flex items-center gap-3">
                              <span className="text-xs font-medium text-[var(--text-secondary)] w-16 shrink-0">{unidade}</span>
                              <div className="flex-1 bg-[var(--surface-2)] rounded-full h-5 overflow-hidden">
                                <div
                                  className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                                  style={{
                                    width: `${(count / totalAtivos) * 100}%`,
                                    backgroundColor: UNIT_COLORS[unidade] || '#94A3B8'
                                  }}
                                >
                                  <span className="text-white text-[10px] font-bold">{count}</span>
                                </div>
                              </div>
                              <span className="text-xs text-[var(--text-secondary)] w-10 text-right shrink-0">
                                {((count / totalAtivos) * 100).toFixed(0)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Por Departamento */}
                      <div className="bg-white border border-[var(--border)] rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Colaboradores por Departamento</h3>
                        <div className="space-y-2">
                          {deptSorted.map(([dept, count]) => (
                            <div key={dept} className="flex items-center gap-3">
                              <span className="text-xs text-[var(--text-secondary)] w-36 shrink-0 truncate" title={dept}>{dept}</span>
                              <div className="flex-1 bg-[var(--surface-2)] rounded-full h-4 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#F47920] flex items-center justify-end pr-2 transition-all"
                                  style={{ width: `${(count / maxDept) * 100}%` }}
                                >
                                  {count > 1 && <span className="text-white text-[10px] font-bold">{count}</span>}
                                </div>
                              </div>
                              <span className="text-xs font-semibold text-[var(--text-primary)] w-4 text-right shrink-0">{count}</span>
                            </div>
                          ))}
                          {Object.keys(porDept).length > 8 && (
                            <p className="text-xs text-[var(--text-secondary)] pt-1 italic">+ {Object.keys(porDept).length - 8} departamentos</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Capacidade por Unidade */}
                    <div className="bg-white border border-[var(--border)] rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Capacidade de Horas/mês por Unidade</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(
                          ativos.reduce((acc, c) => {
                            const u = c.unidade || 'N/A';
                            acc[u] = (acc[u] || 0) + (c.capacidade_horas_mensais ?? 160);
                            return acc;
                          }, {})
                        ).sort((a, b) => b[1] - a[1]).map(([unidade, horas]) => (
                          <div key={unidade} className="rounded-xl p-4 text-center" style={{ backgroundColor: (UNIT_COLORS[unidade] || '#94A3B8') + '15', border: `1px solid ${(UNIT_COLORS[unidade] || '#94A3B8')}30` }}>
                            <p className="text-xs text-[var(--text-secondary)] mb-1">{unidade}</p>
                            <p className="text-2xl font-bold" style={{ color: UNIT_COLORS[unidade] || '#94A3B8' }}>{horas.toLocaleString('pt-BR')}h</p>
                            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{porUnidade[unidade]} colaboradores</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          {activeTab === 'colaboradores' && (
           <div className="space-y-4">
             {/* Header com Busca e Botões */}
             <div className="flex items-center justify-between gap-4">
               <div className="relative max-w-sm">
                 <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                 <input
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                   placeholder="Buscar colaborador..."
                   className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--border)] rounded-xl focus:outline-none focus:border-[#F47920]"
                 />
               </div>
               <div className="flex gap-2">
                 <button
                   onClick={() => setShowImportModal(true)}
                   className="flex items-center gap-2 bg-white border border-[var(--border)] text-[var(--text-secondary)] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[var(--surface-2)] transition-colors"
                 >
                   <Upload size={16} />
                   Importar
                 </button>
                 <button
                   onClick={handleNovoColab}
                   className="flex items-center gap-2 bg-[#1A4731] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#245E40] transition-colors"
                 >
                   <Plus size={16} />
                   Novo Colaborador
                 </button>
               </div>
             </div>

              {loadingColabs ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-[#F47920]" />
                </div>
              ) : erroCarregamento ? (
                <div className="text-center py-12">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-lg mx-auto">
                    <p className="text-red-700 font-semibold text-sm mb-1">Erro ao carregar dados</p>
                    <p className="text-red-500 text-xs font-mono">{erroCarregamento}</p>
                    <p className="text-red-400 text-xs mt-2">Verifique se a tabela <code className="bg-red-100 px-1 rounded">ch_colaboradores</code> existe no Supabase.</p>
                    <button onClick={carregarColaboradores} className="mt-4 px-4 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700">Tentar novamente</button>
                  </div>
                </div>
              ) : colaboradores.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="text-[var(--text-secondary)] opacity-20 mx-auto mb-4" />
                  <p className="text-[var(--text-secondary)]">Nenhum colaborador cadastrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[var(--surface-2)] border-b border-[var(--border)]">
                        {[
                          { label: 'Nome', key: 'nome', sortable: true, filterable: false },
                          { label: 'Unidade', key: 'unidade', sortable: true, filterable: true },
                          { label: 'Tipo de Vínculo', key: 'tipo_vinculo', sortable: true, filterable: true },
                          { label: 'Departamento', key: 'departamento', sortable: true, filterable: true },
                          { label: 'E-mail', key: 'email', sortable: true, filterable: false },
                          { label: 'Status', key: 'ativo', sortable: false, filterable: false },
                          { label: 'Ações', key: null, sortable: false, filterable: false },
                        ].map(col => (
                          <th key={col.label} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              {col.sortable ? (
                                <button onClick={() => handleSort(col.key)} className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors">
                                  {col.label}
                                  <SortIcon field={col.key} />
                                </button>
                              ) : col.label}
                              {col.filterable && <FilterDropdown field={col.key} label={col.label} />}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--surface-2)]">
                      {filteredAndSorted.map(c => (
                          <tr key={c.id} className="hover:bg-[var(--surface-2)] transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-[#1A4731]/10 flex items-center justify-center flex-shrink-0">
                                  <User size={13} className="text-[#1A4731]" />
                                </div>
                                <span className="font-medium text-[var(--text-primary)]">{c.nome}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{c.unidade || '—'}</td>
                            <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{c.tipo_vinculo || '—'}</td>
                            <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{c.departamento || '—'}</td>
                            <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{c.email || '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${c.ativo !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                                {c.ativo !== false ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td className="px-4 py-3 flex gap-2">
                              <button
                                onClick={() => handleEditColab(c)}
                                className="p-1.5 hover:bg-[var(--surface-2)] rounded-lg transition-colors text-[#1A4731]"
                                title="Editar"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteColab(c.id)}
                                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                                title="Deletar"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                            </tr>
                            ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'alocacoes' && (
            <div className="text-center py-12">
              <Calendar size={48} className="text-[var(--text-secondary)] opacity-20 mx-auto mb-4" />
              <p className="text-[var(--text-secondary)]">Funcionalidade de Alocações em desenvolvimento</p>
            </div>
          )}

          {activeTab === 'configuracoes' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">Configurações de Capital Humano</h3>

              {/* Card Onboarding */}
              <div className="bg-white border border-[var(--border)] rounded-xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#F47920]/10 rounded-xl">
                    <Briefcase size={22} className="text-[#F47920]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--text-primary)]">Onboarding de Colaboradores</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">Visualize e gerencie o formulário de onboarding interno</p>
                  </div>
                </div>
                <Link
                  to="/OnboardingInterno"
                  className="flex items-center gap-2 bg-[#1A4731] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#245E40] transition-colors"
                >
                  <ExternalLink size={14} /> Abrir Onboarding
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <ColaboradorFormModal
        open={showFormModal}
        colaborador={editingColab}
        onClose={() => setShowFormModal(false)}
        onSaved={handleSaved}
      />

      <ImportarColaboradoresModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={handleSaved}
      />
    </div>
  );
}