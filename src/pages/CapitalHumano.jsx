import { useState } from 'react';
import { LayoutDashboard, Users, Calendar, Settings } from 'lucide-react';

export default function CapitalHumano() {
  const [activeTab, setActiveTab] = useState('dashboard');

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
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[var(--surface-2)] p-6 rounded-lg border border-[var(--border)]">
                  <p className="text-sm text-[var(--text-secondary)] mb-2">Total de Colaboradores</p>
                  <p className="text-3xl font-bold text-[var(--apsis-green)]">48</p>
                </div>
                <div className="bg-[var(--surface-2)] p-6 rounded-lg border border-[var(--border)]">
                  <p className="text-sm text-[var(--text-secondary)] mb-2">Alocados</p>
                  <p className="text-3xl font-bold text-[var(--apsis-orange)]">35</p>
                </div>
                <div className="bg-[var(--surface-2)] p-6 rounded-lg border border-[var(--border)]">
                  <p className="text-sm text-[var(--text-secondary)] mb-2">Disponíveis</p>
                  <p className="text-3xl font-bold text-green-600">13</p>
                </div>
                <div className="bg-[var(--surface-2)] p-6 rounded-lg border border-[var(--border)]">
                  <p className="text-sm text-[var(--text-secondary)] mb-2">Taxa de Ocupação</p>
                  <p className="text-3xl font-bold text-blue-600">72.9%</p>
                </div>
              </div>
              <div className="bg-[var(--surface-2)] p-6 rounded-lg border border-[var(--border)]">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Próximas Ações</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-3 text-[var(--text-secondary)]">
                    <div className="w-2 h-2 rounded-full bg-[var(--apsis-orange)]" />
                    Revisar alocações vencidas
                  </li>
                  <li className="flex items-center gap-3 text-[var(--text-secondary)]">
                    <div className="w-2 h-2 rounded-full bg-[var(--apsis-orange)]" />
                    Atualizar disponibilidade de 5 colaboradores
                  </li>
                  <li className="flex items-center gap-3 text-[var(--text-secondary)]">
                    <div className="w-2 h-2 rounded-full bg-[var(--apsis-orange)]" />
                    Planejar recrutamento para Q2
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'colaboradores' && (
            <div className="text-center py-12">
              <Users size={48} className="text-[var(--text-secondary)] opacity-20 mx-auto mb-4" />
              <p className="text-[var(--text-secondary)]">Funcionalidade de Colaboradores em desenvolvimento</p>
            </div>
          )}

          {activeTab === 'alocacoes' && (
            <div className="text-center py-12">
              <Calendar size={48} className="text-[var(--text-secondary)] opacity-20 mx-auto mb-4" />
              <p className="text-[var(--text-secondary)]">Funcionalidade de Alocações em desenvolvimento</p>
            </div>
          )}

          {activeTab === 'configuracoes' && (
            <div className="text-center py-12">
              <Settings size={48} className="text-[var(--text-secondary)] opacity-20 mx-auto mb-4" />
              <p className="text-[var(--text-secondary)]">Funcionalidade de Configurações em desenvolvimento</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}