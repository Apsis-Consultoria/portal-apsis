import { useState, useRef, useEffect } from 'react';
import { Send, CheckCheck, Check, Eye, Lock } from 'lucide-react';
import AnexosList from './AnexosList';
import AnexoUpload from './AnexoUpload';

export default function ChatArea({
  selectedConversation,
  messages,
  currentUserEmail,
  currentUserType,
  onSendMessage,
  onToggleVisibility,
}) {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 opacity-20">💬</div>
          <p className="text-lg font-semibold text-[var(--text-primary)]">Selecione uma conversa</p>
          <p className="text-sm text-[var(--text-secondary)]">Escolha na lista para começar</p>
        </div>
      </div>
    );
  }

  // Filtrar mensagens: cliente não vê mensagens internas
  const visibleMessages = messages.filter(
    (msg) => !(msg.visibilidade === 'interno' && currentUserType === 'cliente')
  );

  // Agrupar mensagens por data
  const groupedMessages = visibleMessages.reduce((acc, msg) => {
    const date = new Date(msg.created_date).toLocaleDateString('pt-BR');
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b-2 border-[var(--border)] px-6 py-4 bg-gradient-to-r from-white to-[var(--surface-2)]">
         <div className="flex items-start justify-between">
           <div>
             <h2 className="text-lg font-semibold text-[var(--text-primary)]">{selectedConversation.titulo}</h2>
             <p className="text-xs text-[var(--text-secondary)] mt-1">{selectedConversation.descricao}</p>
           </div>
           {selectedConversation.cliente_nome && (
             <div className="text-right">
               <p className="text-xs font-medium text-[var(--apsis-orange)] bg-[var(--apsis-orange)]/10 px-3 py-1 rounded-full">
                 {selectedConversation.cliente_nome}
               </p>
             </div>
           )}
         </div>
       </div>

      {/* Messages */}
       <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-[var(--surface-2)]">
         {visibleMessages.length === 0 ? (
           <div className="flex items-center justify-center h-full text-center">
             <div>
               <div className="text-4xl mb-3 opacity-30">📭</div>
               <p className="text-sm text-[var(--text-secondary)]">Nenhuma mensagem ainda</p>
             </div>
           </div>
         ) : (
           Object.entries(groupedMessages).map(([date, dateMessages]) => (
             <div key={date}>
               {/* Separador de data */}
               <div className="flex items-center gap-3 mb-4">
                 <div className="h-px flex-1 bg-gradient-to-r from-[var(--border)] to-transparent" />
                 <span className="text-xs font-semibold text-[var(--text-secondary)] bg-[var(--surface-2)] px-3 py-1 rounded-full border border-[var(--border)]">
                   {new Date(date).toLocaleDateString('pt-BR', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
                 </span>
                 <div className="h-px flex-1 bg-gradient-to-l from-[var(--border)] to-transparent" />
               </div>

               {/* Mensagens do dia */}
               <div className="space-y-3">
                 {dateMessages.map((msg) => {
            const isOwn = msg.remetente_email === currentUserEmail;
            const isShared = msg.visibilidade === 'compartilhado';
            const isInternal = msg.visibilidade === 'interno';

            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                <div className={`max-w-xs lg:max-w-md`}>
                  {/* Nome do remetente + empresa */}
                  {!isOwn && (
                    <div className="mb-1 px-3">
                      <p className="text-xs font-semibold text-[var(--apsis-orange)]">
                        {msg.remetente_nome}
                      </p>
                      {msg.cliente_nome && (
                        <p className="text-xs text-[var(--text-secondary)]">
                          {msg.cliente_nome}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Bolha de mensagem */}
                  <div
                    className={`px-4 py-3 rounded-2xl relative ${
                      isOwn
                        ? 'bg-[var(--apsis-orange)] text-white'
                        : isInternal
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-[var(--surface-2)] text-[var(--text-primary)]'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.conteudo}</p>

                    {/* Botão de visibilidade (apenas para APSIS) */}
                    {!isOwn && currentUserType === 'apsis' && (
                      <button
                        onClick={() => onToggleVisibility(msg.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/10 rounded text-xs"
                        title={isShared ? 'Ocultar do cliente' : 'Compartilhar com cliente'}
                      >
                        {isShared ? '🔓' : '🔒'}
                      </button>
                    )}
                    </div>

                    {/* Metadados */}
                    <div className="flex items-center gap-1.5 mt-2 px-3 text-xs text-[var(--text-secondary)]">
                    <span>{new Date(msg.created_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    {isOwn && msg.lida_por?.length > 0 && (
                      <CheckCheck size={13} className="text-[var(--apsis-orange)]" />
                    )}
                    {isOwn && !msg.lida_por?.length && <Check size={13} />}
                  </div>

                  {/* Indicador de visibilidade */}
                  {currentUserType === 'apsis' && isInternal && (
                    <div className="flex items-center gap-1 mt-2 px-3 text-xs text-amber-700 bg-amber-50 rounded py-1">
                      <Lock size={12} />
                      Apenas equipe interna
                    </div>
                  )}

                  {currentUserType === 'apsis' && isShared && (
                    <div className="flex items-center gap-1 mt-2 px-3 text-xs text-green-700 bg-green-50 rounded py-1">
                      <Eye size={12} />
                      Visível ao cliente
                    </div>
                  )}

                  {/* Anexos */}
                  {msg.anexos?.length > 0 && (
                    <div className="mt-3">
                      <AnexosList
                        anexos={msg.anexos}
                        currentUserType={currentUserType}
                        onDownload={(anexo) => {
                          const link = document.createElement('a');
                          link.href = anexo.url;
                          link.download = anexo.nome;
                          link.click();
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
       <div className="border-t-2 border-[var(--border)] bg-white p-4 space-y-3 shadow-sm">
        <div className="flex gap-2">
          <AnexoUpload
            onAnexoAdicionado={(anexo) => {
              console.log('Anexo adicionado:', anexo);
              // Em produção, chamar API para fazer upload
            }}
            currentUserType={currentUserType}
          />
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-2.5 border border-[var(--border)] rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-[var(--apsis-orange)]/50 text-sm placeholder:text-[var(--text-secondary)]"
            rows="3"
          />
          <button
            onClick={handleSend}
            disabled={!messageText.trim()}
            className="p-2.5 bg-[var(--apsis-orange)] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>

        {currentUserType === 'apsis' && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] bg-[var(--surface-2)] rounded px-3 py-2">
            <Lock size={13} />
            <span>Mensagens internas (🔒) não são visíveis ao cliente. Use 🔓 para compartilhar.</span>
          </div>
        )}

        {currentUserType === 'cliente' && (
          <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded px-3 py-2">
            <Eye size={13} />
            <span>Sua equipe APSIS receberá sua mensagem.</span>
          </div>
        )}
      </div>
    </div>
  );
}