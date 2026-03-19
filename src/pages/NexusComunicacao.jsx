import { useState, useRef, useEffect } from 'react';
import { Search, Send, Paperclip, CheckCheck, Check, Shield, Lock, Eye, AlertCircle, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const conversations = [
  {
    id: 1,
    participant: 'TechCorp Brasil',
    contextType: 'Cliente',
    contextLabel: 'Cliente',
    lastMessage: 'Podemos agendar uma reunião para discutir o próximo trimestre?',
    timestamp: '10:30',
    unread: 2,
    avatar: '🏢',
    visibleToClient: true
  },
  {
    id: 2,
    participant: 'Auditoria Contábil 2025',
    contextType: 'Projeto',
    contextLabel: 'Projeto',
    lastMessage: 'Documentação foi enviada com sucesso',
    timestamp: '09:15',
    unread: 0,
    avatar: '📋',
    visibleToClient: false
  },
  {
    id: 3,
    participant: 'Solicitar parecer tributário',
    contextType: 'Solicitação',
    contextLabel: 'Solicitação',
    lastMessage: 'Você respondeu: Em análise, prazo de 48h',
    timestamp: 'Ontem',
    unread: 0,
    avatar: '📝',
    visibleToClient: true
  },
  {
    id: 4,
    participant: 'Global Solutions',
    contextType: 'Cliente',
    contextLabel: 'Cliente',
    lastMessage: 'Obrigado pelas informações!',
    timestamp: '3d',
    unread: 0,
    avatar: '🌐',
    visibleToClient: true
  },
  {
    id: 5,
    participant: 'Consultoria M&A',
    contextType: 'Projeto',
    contextLabel: 'Projeto',
    lastMessage: 'Relatório preliminar enviado',
    timestamp: '5d',
    unread: 0,
    avatar: '📊',
    visibleToClient: false
  },
];

const initialMessages = {
  1: [
    { id: 1, sender: 'cliente', name: 'João Silva', text: 'Olá! Como estamos com a análise?', time: '09:30', read: true, visibility: 'compartilhado', clientRead: true, emailStatus: 'enviada' },
    { id: 2, sender: 'apsis', name: 'Marina APSIS', text: 'Oi João! Tudo bem. Estamos na fase final. Esperamos completar até amanhã.', time: '09:45', read: true, visibility: 'compartilhado', clientRead: true, emailStatus: 'enviada' },
    { id: 3, sender: 'apsis', name: 'Marina APSIS', text: 'Podemos compartilhar um relatório preliminar se desejar?', time: '09:46', read: true, visibility: 'interno', clientRead: false, emailStatus: 'desabilitada' },
    { id: 4, sender: 'cliente', name: 'João Silva', text: 'Sim, por favor! Isso seria ótimo.', time: '10:10', read: true, visibility: 'compartilhado', clientRead: true, emailStatus: 'enviada' },
    { id: 5, sender: 'apsis', name: 'Marina APSIS', text: '✓ Arquivo enviado: Análise_Preliminar_Q1.pdf', time: '10:20', read: false, visibility: 'compartilhado', clientRead: false, attachment: true, attachmentVisibility: 'compartilhado', emailStatus: 'enviada' },
    { id: 6, sender: 'cliente', name: 'João Silva', text: 'Podemos agendar uma reunião para discutir o próximo trimestre?', time: '10:30', read: false, visibility: 'compartilhado', clientRead: false, emailStatus: 'enviada' },
  ],
  2: [
    { id: 1, sender: 'apsis', name: 'Você', text: 'Documentação atualizada no sistema', time: '08:00', read: true, visibility: 'interno', clientRead: false, emailStatus: 'desabilitada' },
    { id: 2, sender: 'apsis', name: 'Você', text: '✓ Arquivo enviado: Cronograma_Auditoria.xlsx', time: '08:15', read: true, visibility: 'interno', clientRead: false, attachment: true, attachmentVisibility: 'interno', emailStatus: 'desabilitada' },
    { id: 3, sender: 'apsis', name: 'Você', text: 'Documentação foi enviada com sucesso', time: '09:15', read: true, visibility: 'interno', clientRead: false, emailStatus: 'desabilitada' },
  ],
};

const eventLog = {
  1: [
    { id: 'evt-1', type: 'enviado_cliente', message: 'João Silva recebeu a mensagem', time: '09:30' },
    { id: 'evt-2', type: 'lido_cliente', message: 'João Silva leu a mensagem', time: '09:32' },
    { id: 'evt-3', type: 'compartilhado', message: 'Documento compartilhado com o cliente', time: '10:20' },
    { id: 'evt-4', type: 'lido_cliente', message: 'João Silva leu o documento', time: '10:35' },
  ],
};

const MessageNotificationStatus = ({ emailStatus }) => {
  if (emailStatus === 'enviada') {
    return <span className="text-xs text-green-600 flex items-center gap-1 mt-1"><Mail size={12} /> ✓ Notificação enviada</span>;
  }
  if (emailStatus === 'desabilitada') {
    return <span className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Mail size={12} /> Notificação desabilitada</span>;
  }
  if (emailStatus === 'pendente') {
    return <span className="text-xs text-amber-600 flex items-center gap-1 mt-1"><Mail size={12} /> ⏳ Notificação pendente</span>;
  }
  return null;
};

const MessageBubble = ({ message, onToggleVisibility }) => {
  const isApsis = message.sender === 'apsis';
  const isShared = message.visibility === 'compartilhado';
  const bgColor = isApsis ? 'bg-[var(--apsis-orange)]/10 border-[var(--apsis-orange)]/20' : 'bg-blue-50 border-blue-100';
  const textColor = isApsis ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]';
  const nameColor = isApsis ? 'text-[var(--apsis-orange)] font-semibold' : 'text-blue-600 font-medium';

  return (
    <div className={`flex ${isApsis ? 'justify-start' : 'justify-end'} mb-4 group`}>
      <div className={`max-w-xs lg:max-w-md`}>
        {message.name && <p className={`text-xs ${nameColor} mb-1 px-3`}>{message.name}</p>}
        <div className={`px-4 py-3 rounded-2xl border ${bgColor} ${textColor} text-sm leading-relaxed relative`}>
          {message.text}
          {isApsis && (
            <button
              onClick={() => onToggleVisibility(message.id)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/5 rounded text-xs"
              title={isShared ? 'Ocultar do cliente' : 'Compartilhar com cliente'}
            >
              {isShared ? '🔓' : '🔒'}
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1.5 mt-2 px-3">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <span>{message.time}</span>
            {message.read && <CheckCheck size={13} className="text-[var(--apsis-orange)]" />}
            {!message.read && isApsis && <Check size={13} />}
            {message.clientRead && isShared && <span className="text-green-600 font-medium">✓ Lido</span>}
          </div>
          {message.visibility && (
            <div className="text-xs font-medium">
              {isShared ? (
                <span className="text-green-600 flex items-center gap-1">
                  🌐 Visível ao cliente
                </span>
              ) : (
                <span className="text-amber-600 flex items-center gap-1">
                  🔒 Interno APSIS
                </span>
              )}
            </div>
          )}
          <MessageNotificationStatus emailStatus={message.emailStatus} />
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
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate">{conv.participant}</h4>
              {conv.visibleToClient && <Eye size={12} className="text-green-600 flex-shrink-0" />}
            </div>
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

const EventLogPanel = ({ convId }) => {
  const events = eventLog[convId] || [];
  const eventIcons = {
    enviado_cliente: '📤',
    lido_cliente: '👁️',
    compartilhado: '🌐',
    documento: '📎',
  };

  return (
    <div className="space-y-2 h-full">
      {events.map(evt => (
        <div key={evt.id} className="flex gap-2 text-xs pb-2 border-b border-[var(--border)] last:border-0">
          <span className="text-base flex-shrink-0">{eventIcons[evt.type] || '•'}</span>
          <div>
            <p className="text-[var(--text-secondary)]">{evt.message}</p>
            <p className="text-[var(--text-secondary)]/60">{evt.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const CommunicationHeader = () => (
  <div className="bg-gradient-to-r from-[var(--apsis-green)] to-[var(--apsis-green-light)] text-white rounded-lg p-6 mb-6">
    <h1 className="text-2xl font-bold mb-2">Communication Center</h1>
    <p className="text-white/80 text-sm">Gerencie comunicações com total visibilidade, auditoria e conformidade corporativa.</p>
  </div>
);

export default function NexusComunicacao() {
  const [selectedConv, setSelectedConv] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');
  const [filterType, setFilterType] = useState('Todos');
  const [messages, setMessages] = useState(initialMessages);
  const [showEventLog, setShowEventLog] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConv]);

  const selectedConversation = conversations.find(c => c.id === selectedConv);
  const currentMessages = messages[selectedConv] || [];

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'Todos' || conv.contextLabel === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleToggleVisibility = (messageId) => {
    setMessages(prev => ({
      ...prev,
      [selectedConv]: prev[selectedConv].map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            visibility: msg.visibility === 'compartilhado' ? 'interno' : 'compartilhado',
            clientRead: msg.visibility === 'compartilhado' ? false : msg.clientRead,
          };
        }
        return msg;
      }),
    }));
  };

  const handleSendMessage = async () => {
    if (messageText.trim()) {
      const newMessage = {
        id: Date.now(),
        sender: 'apsis',
        name: 'Você',
        text: messageText,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        visibility: selectedConversation.visibleToClient ? 'compartilhado' : 'interno',
        read: true,
        emailStatus: 'pendente'
      };

      setMessages(prev => ({
        ...prev,
        [selectedConv]: [...(prev[selectedConv] || []), newMessage]
      }));

      if (newMessage.visibility === 'compartilhado') {
        try {
          await base44.functions.invoke('emailNotificationHandler', {
            tipo_evento: 'mensagem',
            contexto_id: selectedConv,
            contexto_tipo: 'comunicacao',
            cliente_email: selectedConversation.participant + '@client.com',
            cliente_nome: selectedConversation.participant,
            projeto_nome: selectedConversation.participant
          });

          setMessages(prev => ({
            ...prev,
            [selectedConv]: prev[selectedConv].map(msg => 
              msg.id === newMessage.id ? { ...msg, emailStatus: 'enviada' } : msg
            )
          }));
        } catch (error) {
          console.error('Erro ao enviar notificação:', error);
        }
      } else {
        setMessages(prev => ({
          ...prev,
          [selectedConv]: prev[selectedConv].map(msg => 
            msg.id === newMessage.id ? { ...msg, emailStatus: 'desabilitada' } : msg
          )
        }));
      }

      setMessageText('');
    }
  };

  return (
    <div className="space-y-6">
      <CommunicationHeader />

      <div className="h-full flex flex-col bg-[var(--surface-2)] rounded-xl overflow-hidden shadow-sm border border-[var(--border)]">
        {/* Visibility Control Banner with Email Status */}
        {selectedConversation && (
          <div className="bg-white border-b border-[var(--border)] px-6 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedConversation.visibleToClient ? (
                  <>
                    <Eye size={16} className="text-green-600" />
                    <div className="text-sm">
                      <p className="font-medium text-[var(--text-primary)]">Conversa compartilhada com cliente</p>
                      <p className="text-xs text-[var(--text-secondary)]">Cliente pode visualizar e responder</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Lock size={16} className="text-amber-600" />
                    <div className="text-sm">
                      <p className="font-medium text-[var(--text-primary)]">Apenas equipe interna</p>
                      <p className="text-xs text-[var(--text-secondary)]">Notas e discussões privadas</p>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setShowEventLog(!showEventLog)}
                className="text-xs font-medium text-[var(--apsis-orange)] hover:underline flex items-center gap-1"
              >
                📋 {showEventLog ? 'Ocultar' : 'Ver'} histórico
              </button>
            </div>
            {selectedConversation.visibleToClient && (
              <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded border border-green-100">
                <Mail size={14} className="text-green-600" />
                <span><strong>✓ Notificações por e-mail ativas</strong> — Cliente receberá notificações sobre interações nesta conversa</span>
              </div>
            )}
          </div>
        )}

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

                {/* Messages Area with Event Log */}
                <div className="flex flex-1 overflow-hidden gap-0">
                  {/* Messages */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-2">
                      {currentMessages.length > 0 ? (
                        currentMessages.map(msg => <MessageBubble key={msg.id} message={msg} onToggleVisibility={handleToggleVisibility} />)
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <div className="text-5xl mb-4 opacity-20">💬</div>
                          <p className="text-[var(--text-secondary)]">Sem mensagens ainda</p>
                          <p className="text-sm text-[var(--text-secondary)] mt-1">Comece a conversa</p>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Event Log Sidebar */}
                  {showEventLog && (
                    <div className="w-72 border-l border-[var(--border)] bg-[var(--surface-2)] overflow-y-auto p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">Histórico de Auditoria</h3>
                      </div>
                      <EventLogPanel convId={selectedConv} />
                    </div>
                  )}
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
                  <p className="text-xs text-[var(--text-secondary)] mt-2">{selectedConversation.visibleToClient ? '✓ Será compartilhado com cliente' : '🔒 Apenas para equipe interna'}</p>
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
    </div>
  );
}