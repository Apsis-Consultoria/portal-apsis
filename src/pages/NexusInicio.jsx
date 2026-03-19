import { MessageSquare, FileText, LayoutDashboard, Globe, Bell, Clock, CheckCircle2, AlertCircle, ArrowRight, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const StatCard = ({ icon: Icon, label, value, color, trend }) => (
  <div className={`bg-white rounded-xl p-5 shadow-sm border border-[var(--border)] hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-1">{label}</p>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
        {trend && <p className="text-xs text-[var(--text-secondary)] mt-2">{trend}</p>}
      </div>
      <div className={`w-12 h-12 rounded-lg ${color.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
        <Icon size={22} className={color} />
      </div>
    </div>
  </div>
);

const QuickAction = ({ icon: Icon, label, to, color }) => (
  <Link to={to} className={`group flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-[var(--border)] hover:border-[var(--apsis-orange)]/30 hover:bg-[var(--apsis-orange)]/5 transition-all duration-200`}>
    <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
      <Icon size={16} className="text-white" />
    </div>
    <span className="text-sm font-medium text-[var(--text-primary)] flex-1">{label}</span>
    <ArrowRight size={16} className="text-[var(--text-secondary)] group-hover:text-[var(--apsis-orange)] transition-colors" />
  </Link>
);

const MessageItem = ({ title, preview, time, unread }) => (
  <div className={`p-3 border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)] transition-colors cursor-pointer`}>
    <div className="flex items-start justify-between mb-1">
      <h4 className={`text-sm font-medium ${unread ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)]'}`}>{title}</h4>
      {unread && <span className="w-2 h-2 rounded-full bg-[var(--apsis-orange)]" />}
    </div>
    <p className="text-xs text-[var(--text-secondary)] line-clamp-1">{preview}</p>
    <p className="text-xs text-[var(--text-secondary)] mt-1.5">{time}</p>
  </div>
);

const ProjectItem = ({ name, client, progress, status }) => {
  const statusColors = {
    ativo: 'bg-green-100 text-green-700',
    parado: 'bg-yellow-100 text-yellow-700',
    concluido: 'bg-blue-100 text-blue-700'
  };
  return (
    <div className="p-3 border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)] transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="text-sm font-medium text-[var(--text-primary)]">{name}</h4>
          <p className="text-xs text-[var(--text-secondary)]">{client}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[status] || statusColors.ativo}`}>
          {status === 'ativo' ? 'Ativo' : status === 'parado' ? 'Pausado' : 'Concluído'}
        </span>
      </div>
      <div className="w-full bg-[var(--surface-2)] rounded-full h-1.5 overflow-hidden">
        <div className="bg-[var(--apsis-orange)] h-full transition-all" style={{width: `${progress}%`}} />
      </div>
      <p className="text-xs text-[var(--text-secondary)] mt-1.5">{progress}% concluído</p>
    </div>
  );
};

export default function NexusInicio() {
  const [messages] = useState([
    { title: 'Novo relatório disponível', preview: 'Seu relatório Q1 2026 foi finalizado...', time: '2h atrás', unread: true },
    { title: 'Avaliação de bem imóvel', preview: 'Solicitamos informações adicionais sobre...', time: '5h atrás', unread: true },
    { title: 'Reunião confirmada', preview: 'Sua reunião está agendada para 22 de março...', time: '1d atrás', unread: false },
  ]);

  const [requests] = useState([
    { title: 'Solicitação #2341', status: 'Em revisão', days: '2 dias' },
    { title: 'Parecer contábil', status: 'Aguardando', days: '5 dias' },
    { title: 'Análise tributária', status: 'Em revisão', days: '1 dia' },
  ]);

  const [projects] = useState([
    { name: 'Auditoria Contábil 2025', client: 'TechCorp Brasil', progress: 78, status: 'ativo' },
    { name: 'Consultoria M&A', client: 'Global Solutions', progress: 45, status: 'ativo' },
    { name: 'Avaliação de Bens', client: 'Imóvel Premium', progress: 100, status: 'concluido' },
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">APSIS Nexus</h1>
        <p className="text-[var(--text-secondary)] text-lg">Bem-vindo ao seu workspace premium. Acompanhe projetos, mensagens e solicitações em um só lugar.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={MessageSquare} label="Mensagens não lidas" value="3" color="text-blue-600" trend="+1 hoje" />
        <StatCard icon={AlertCircle} label="Solicitações abertas" value="4" color="text-amber-600" trend="2 urgentes" />
        <StatCard icon={FileText} label="Documentos" value="12" color="text-green-600" trend="5 novos" />
        <StatCard icon={LayoutDashboard} label="Projetos ativos" value="2" color="text-purple-600" trend="78% concluído" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">Atalhos Rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <QuickAction icon={MessageSquare} label="Enviar mensagem" to="/NexusComunicacao" color="bg-blue-600" />
          <QuickAction icon={FileText} label="Visualizar documentos" to="/NexusDocumentos" color="bg-green-600" />
          <QuickAction icon={LayoutDashboard} label="Ver projetos" to="/NexusProjetos" color="bg-purple-600" />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-[var(--border)] overflow-hidden hover:shadow-md transition-shadow">
          <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-gradient-to-r from-blue-50 to-transparent">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-blue-600" />
              <h3 className="font-semibold text-[var(--text-primary)]">Mensagens Recentes</h3>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">3</span>
          </div>
          <div>
            {messages.map((msg, i) => (
              <MessageItem key={i} {...msg} />
            ))}
          </div>
          <div className="p-3 border-t border-[var(--border)] text-center">
            <Link to="/NexusComunicacao" className="text-xs font-medium text-[var(--apsis-orange)] hover:underline">Ver todas as mensagens →</Link>
          </div>
        </div>

        {/* Requests */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-[var(--border)] overflow-hidden hover:shadow-md transition-shadow">
          <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-gradient-to-r from-amber-50 to-transparent">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-amber-600" />
              <h3 className="font-semibold text-[var(--text-primary)]">Solicitações Abertas</h3>
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">4</span>
          </div>
          <div>
            {requests.map((req, i) => (
              <div key={i} className="p-3 border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)] transition-colors">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-sm font-medium text-[var(--text-primary)]">{req.title}</h4>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">{req.status}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1.5">{req.days} em aberto</p>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-[var(--border)] text-center">
            <Link to="/NexusSolicitacoes" className="text-xs font-medium text-[var(--apsis-orange)] hover:underline">Ver todas as solicitações →</Link>
          </div>
        </div>

        {/* Projects */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-[var(--border)] overflow-hidden hover:shadow-md transition-shadow">
          <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-gradient-to-r from-purple-50 to-transparent">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-purple-600" />
              <h3 className="font-semibold text-[var(--text-primary)]">Projetos em Andamento</h3>
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">3</span>
          </div>
          <div>
            {projects.map((proj, i) => (
              <ProjectItem key={i} {...proj} />
            ))}
          </div>
          <div className="p-3 border-t border-[var(--border)] text-center">
            <Link to="/NexusProjetos" className="text-xs font-medium text-[var(--apsis-orange)] hover:underline">Ver todos os projetos →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}