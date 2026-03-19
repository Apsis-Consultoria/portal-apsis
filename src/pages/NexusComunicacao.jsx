import { useState, useRef, useEffect } from 'react';
import { Search, Send, Paperclip, CheckCheck, Check } from 'lucide-react';

const conversations = [
  {
    id: 1,
    participant: 'TechCorp Brasil',
    contextType: 'Cliente',
    contextLabel: 'Cliente',
    lastMessage: 'Podemos agendar uma reunião para discutir o próximo trimestre?',
    timestamp: '10:30',
    unread: 2,
    avatar: '🏢'
  },
  {
    id: 2,
    participant: 'Auditoria Contábil 2025',
    contextType: 'Projeto',
    contextLabel: 'Projeto',
    lastMessage: 'Documentação foi enviada com sucesso',
    timestamp: '09:15',
    unread: 0,
    avatar: '📋'
  },
  {
    id: 3,
    participant: 'Solicitar parecer tributário',
    contextType: 'Solicitação',
    contextLabel: 'Solicitação',
    lastMessage: 'Você respondeu: Em análise, prazo de 48h',
    timestamp: 'Ontem',
    unread: 0,
    avatar: '📝'
  },
  {
    id: 4,
    participant: 'Global Solutions',
    contextType: 'Cliente',
    contextLabel: 'Cliente',
    lastMessage: 'Obrigado pelas informações!',
    timestamp: '3d',
    unread: 0,
    avatar: '🌐'
  },
  {
    id: 5,
    participant: 'Consultoria M&A',
    contextType: 'Projeto',
    contextLabel: 'Projeto',
    lastMessage: 'Relatório preliminar enviado',
    timestamp: '5d',
    unread: 0,
    avatar: '📊'
  },
];

const messagesMock = {
  1: [
    { id: 1, sender: 'cliente', name: 'João Silva', text: 'Olá! Como estamos com a análise?', time: '09:30', read: true },
    { id: 2, sender: 'apsis', name: 'Marina APSIS', text: 'Oi João! Tudo bem. Estamos na fase final. Esperamos completar até amanhã.', time: '09:45', read: true },
    { id: 3, sender: 'apsis', name: 'Marina APSIS', text: 'Podemos compartilhar um relatório preliminar se desejar?', time: '09:46', read: true },
    { id: 4, sender: 'cliente', name: 'João Silva', text: 'Sim, por favor! Isso seria ótimo.', time: '10:10', read: true },
    { id: 5, sender: 'apsis', name: 'Marina APSIS', text: '✓ Arquivo enviado: Análise_Preliminar_Q1.pdf', time: '10:20', read: false, attachment: true },
    { id: 6, sender: 'cliente', name: 'João Silva', text: 'Podemos agendar uma reunião para discutir o próximo trimestre?', time: '10:30', read: false },
  ],
  2: [
    { id: 1, sender: 'apsis', name: 'Você', text: 'Documentação atualizada no sistema', time: '08:00', read: true },
    { id: 2, sender: 'apsis', name: 'Você', text: '✓ Arquivo enviado: Cronograma_Auditoria.xlsx', time: '08:15', read: true, attachment: true },
    { id: 3, sender: 'apsis', name: 'Você', text: 'Documentação foi enviada com sucesso', time: '09:15', read: true },
  ],
};

const MessageBubble = ({ message }) => {
  const isApsis = message.sender === 'apsis';
  const bgColor = isApsis ? 'bg-[var(--apsis-orange)]/10 border-[var(--apsis-orange)]/20' : 'bg-blue-50 border-blue-100';
  const textColor = isApsis ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]';
  const nameColor = isApsis ? 'text-[var(--apsis-orange)] font-semibold' : 'text-blue-600 font-medium';

  return (
    <div className={`flex ${isApsis ? 'justify-start' : 'justify-end'} mb-3 group`}>
      <div className={`max-w-xs lg:max-w-md`}>
        {message.name && <p className={`text-xs ${nameColor} mb-1 px-3`}>{message.name}</p>}
        <div className={`px-4 py-3 rounded-2xl border ${bgColor} ${textColor} text-sm leading-relaxed`}>
          {message.text}
        </div>
        <div className={`flex items-center gap-1.5 mt-1 px-3 text-xs text-[var(--text-secondary)]`}>
          <span>{message.time}</span>
          {message.read && <CheckCheck size={13} className="text-[var(--apsis-orange)]" />}
          {!message.read && isApsis && <Check size={13} />}
        </div>
      </div>
    </div>
  );
};

const ConversationItem = ({ conv, active, onClick }) => {
  const contextColors = {
    'Cliente': 'bg-green-100 text-green-700',
    'Projeto': 'bg-purple-100 text-purple-700',
    'Solicitação': 'bg-amber-100 text-amber-700',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-lg border transition-all hover:bg-[var(--surface-2)] ${
        active
          ? 'bg-[var(--apsis-orange)]/10 border-[var(--apsis-orange)]/30'
          : 'border-[var(--border)]'
      }`}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">{conv.avatar}</span>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate">{conv.participant}</h4>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${contextColors[conv.contextLabel]}`}>
              {conv.contextLabel}
            </span>
          </div>
        </div>
        {conv.unread > 0 && (
          <span className="w-5 h-5 rounded-full bg-[var(--apsis-orange)] text-white text-xs flex items-center justify-center font-bold flex-shrink-0 ml-2">
            {conv.unread}
          </span>
        )}
      </div>
      <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mb-1">{conv.lastMessage}</p>
      <p className="text-xs text-[var(--text-secondary)]">{conv.timestamp}</p>
    </button>
  );
};

export default function NexusComunicacao() {
  const [selectedConv, setSelectedConv] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');
  const [filterType, setFilterType] = useState('Todos');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConv]);

  const selectedConversation = conversations.find(c => c.id === selectedConv);
  const messages = messagesMock[selectedConv] || [];

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'Todos' || conv.contextLabel === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log('Mensagem enviada:', messageText);
      setMessageText('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--surface-2)] rounded-xl overflow-hidden shadow-sm border border-[var(--border)]">
      {/* Header */}
      <div className="bg-white border-b border-[var(--border)] px-6 py-4">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Comunicação</h1>
        <p className="text-sm text-[var(--text-secondary)]">Centro de conversa corporativa com clientes e equipes</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Lista de Conversas */}
        <div className="w-full md:w-80 bg-white border-r border-[var(--border)] flex flex-col">
          {/* Search and Filters */}
          <div className="p-4 space-y-3 border-b border-[var(--border)]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Buscar conversa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--apsis-orange)]/50"
              />
            </div>
            <div className="flex gap-2">
              {['Todos', 'Cliente', 'Projeto', 'Solicitação'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setFilterType(filter)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    filterType === filter
                      ? 'bg-[var(--apsis-orange)] text-white'
                      : 'bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto space-y-1 p-3">
            {filteredConversations.length > 0 ? (
              filteredConversations.map(conv => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  active={selectedConv === conv.id}
                  onClick={() => setSelectedConv(conv.id)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Search size={32} className="text-[var(--text-secondary)] opacity-20 mb-2" />
                <p className="text-sm text-[var(--text-secondary)]">Nenhuma conversa encontrada</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="hidden md:flex flex-1 flex-col bg-white">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedConversation.avatar}</span>
                  <div>
                    <h2 className="font-semibold text-[var(--text-primary)]">{selectedConversation.participant}</h2>
                    <p className="text-xs text-[var(--text-secondary)]">Última mensagem {selectedConversation.timestamp}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  selectedConversation.contextType === 'Cliente'
                    ? 'bg-green-100 text-green-700'
                    : selectedConversation.contextType === 'Projeto'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {selectedConversation.contextLabel}
                </span>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-2">
                {messages.length > 0 ? (
                  messages.map(msg => <MessageBubble key={msg.id} message={msg} />)
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-5xl mb-4 opacity-20">💬</div>
                    <p className="text-[var(--text-secondary)]">Sem mensagens ainda</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Comece a conversa</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="bg-white border-t border-[var(--border)] p-4">
                <div className="flex gap-2">
                  <button className="p-2.5 hover:bg-[var(--surface-2)] rounded-lg transition-colors text-[var(--text-secondary)] hover:text-[var(--apsis-orange)]">
                    <Paperclip size={18} />
                  </button>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Digite sua mensagem (Shift+Enter para quebra de linha)..."
                    className="flex-1 px-4 py-3 border border-[var(--border)] rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-[var(--apsis-orange)]/50 text-sm placeholder:text-[var(--text-secondary)]"
                    rows="3"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="p-2.5 bg-[var(--apsis-orange)] text-white rounded-lg hover:bg-[var(--apsis-orange)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <div className="text-6xl mb-4 opacity-20">👋</div>
                <p className="text-lg font-semibold text-[var(--text-primary)]">Selecione uma conversa</p>
                <p className="text-[var(--text-secondary)] mt-1">Escolha na lista ao lado para começar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}