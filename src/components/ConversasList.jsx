import { Search, MessageSquare, Briefcase, FileText, AlertCircle } from 'lucide-react';

export default function ConversasList({
  conversas,
  selectedId,
  onSelectConversa,
  searchTerm,
  onSearchChange,
}) {
  const typeIcons = {
    projeto: Briefcase,
    solicitacao: FileText,
    geral: MessageSquare,
  };

  const typeLabels = {
    projeto: 'Projeto',
    solicitacao: 'Solicitação',
    geral: 'Geral',
  };

  const typeColors = {
    projeto: 'bg-purple-100 text-purple-700',
    solicitacao: 'bg-amber-100 text-amber-700',
    geral: 'bg-blue-100 text-blue-700',
  };

  const filteredConversas = conversas.filter((conv) =>
    conv.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full md:w-80 bg-white border-r-2 border-[var(--border)] flex flex-col h-full shadow-sm">
      {/* Search */}
      <div className="p-4 border-b-2 border-[var(--border)] bg-[var(--surface-2)]">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Buscar conversa..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--apsis-orange)]/50"
          />
        </div>
      </div>

      {/* Conversas List */}
      <div className="flex-1 overflow-y-auto space-y-1 p-3">
        {filteredConversas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Search size={32} className="text-[var(--text-secondary)] opacity-20 mb-2" />
            <p className="text-sm text-[var(--text-secondary)]">Nenhuma conversa encontrada</p>
          </div>
        ) : (
          filteredConversas.map((conversa) => {
            const Icon = typeIcons[conversa.tipo];
            const isSelected = selectedId === conversa.id;

            return (
              <button
                key={conversa.id}
                onClick={() => onSelectConversa(conversa)}
                className={`w-full text-left px-3 py-3 rounded-lg border transition-all hover:bg-[var(--surface-2)] ${
                  isSelected
                    ? 'bg-[var(--apsis-orange)]/10 border-[var(--apsis-orange)]/30'
                    : 'border-[var(--border)]'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex-1">
                    <h4 className={`text-sm font-semibold truncate ${isSelected ? 'text-[var(--apsis-orange)]' : 'text-[var(--text-primary)]'}`}>
                      {conversa.titulo}
                    </h4>
                    {conversa.cliente_nome && (
                      <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                        {conversa.cliente_nome}
                      </p>
                    )}
                  </div>
                  {conversa.nao_lidas > 0 && (
                    <span className="ml-2 flex-shrink-0 w-5 h-5 rounded-full bg-[var(--apsis-orange)] text-white text-xs flex items-center justify-center font-bold">
                      {conversa.nao_lidas}
                    </span>
                  )}
                </div>

                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-2 ${typeColors[conversa.tipo]}`}>
                  {typeLabels[conversa.tipo]}
                </span>

                <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mb-1">{conversa.ultima_mensagem}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {new Date(conversa.ultima_mensagem_em).toLocaleString('pt-BR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}