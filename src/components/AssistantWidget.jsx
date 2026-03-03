import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageCircle, X, Minimize2, Send, RefreshCw, Bot, User, Loader2, BookOpen } from "lucide-react";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a1fc4b60b4c477ea324579/40af152e2_Design-sem-nome.png";

const WELCOME_MESSAGE = {
  role: "assistant",
  content: "Olá! Sou o **Assistente APSIS**. Posso ajudar com dúvidas sobre o portal e consultas na base de conhecimento corporativa.\n\nComo posso ajudar você hoje?"
};

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[#1A4731] flex items-center justify-center flex-shrink-0 mt-0.5">
          <img src={LOGO_URL} alt="APSIS" className="w-5 h-5 object-contain rounded-full" />
        </div>
      )}
      <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
        isUser
          ? "bg-[#1A4731] text-white rounded-tr-sm"
          : "bg-white border border-[#DDE3DE] text-[#1A2B1F] rounded-tl-sm"
      }`}>
        {msg.content.split('\n').map((line, i) => {
          // Markdown bold simples
          const parts = line.split(/\*\*(.*?)\*\*/g);
          return (
            <p key={i} className={i > 0 ? "mt-1" : ""}>
              {parts.map((part, j) =>
                j % 2 === 1 ? <strong key={j}>{part}</strong> : part
              )}
            </p>
          );
        })}
        {msg.sources && msg.sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-[#DDE3DE]">
            <p className="text-[10px] font-semibold text-[#5C7060] flex items-center gap-1 mb-1">
              <BookOpen size={10} /> Fontes consultadas:
            </p>
            {msg.sources.map((s, i) => (
              <p key={i} className="text-[10px] text-[#F47920]">• {s.title} ({s.module})</p>
            ))}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-[#F47920]/20 border border-[#F47920]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <User size={12} className="text-[#F47920]" />
        </div>
      )}
    </div>
  );
}

export default function AssistantWidget({ currentPageName }) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && !minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, minimized]);

  useEffect(() => {
    if (open && !minimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, minimized]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const history = newMessages.slice(1).map(m => ({ role: m.role, content: m.content }));
      const res = await base44.functions.invoke('assistantChat', {
        message: text,
        history: history.slice(0, -1), // histórico sem a mensagem atual
        currentPage: currentPageName || 'Geral'
      });

      const data = res.data;
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.response || "Desculpe, não consegui processar sua mensagem.",
        sources: data.sources || []
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "⚠️ Ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.",
        sources: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const newConversation = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput("");
  };

  return (
    <>
      {/* Botão flutuante */}
      {!open && (
        <div className="fixed bottom-6 right-6 z-50 group">
          <button
            onClick={() => { setOpen(true); setMinimized(false); }}
            className="w-14 h-14 bg-[#1A4731] hover:bg-[#245E40] rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          >
            <MessageCircle size={24} className="text-white" />
          </button>
          <div className="absolute bottom-16 right-0 bg-[#1A2B1F] text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Assistente APSIS
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F47920] rounded-full border-2 border-white" />
        </div>
      )}

      {/* Painel do chat */}
      {open && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col bg-[#F4F6F4] rounded-2xl shadow-2xl border border-[#DDE3DE] overflow-hidden transition-all duration-200 ${
            minimized
              ? "w-72 h-14"
              : "w-[360px] sm:w-[400px] h-[560px]"
          }`}
          style={{ maxHeight: "calc(100vh - 80px)", maxWidth: "calc(100vw - 24px)" }}
        >
          {/* Header */}
          <div className="bg-[#1A4731] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <img src={LOGO_URL} alt="APSIS" className="w-6 h-6 object-contain rounded" />
              <div>
                <p className="text-white text-sm font-semibold leading-tight">Assistente APSIS</p>
                {!minimized && <p className="text-white/40 text-[10px]">IA corporativa · {currentPageName || 'Portal'}</p>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!minimized && (
                <button onClick={newConversation} title="Nova conversa"
                  className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <RefreshCw size={13} />
                </button>
              )}
              <button onClick={() => setMinimized(!minimized)} title={minimized ? "Expandir" : "Minimizar"}
                className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <Minimize2 size={13} />
              </button>
              <button onClick={() => setOpen(false)} title="Fechar"
                className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <X size={13} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {messages.map((msg, i) => (
                  <MessageBubble key={i} msg={msg} />
                ))}
                {loading && (
                  <div className="flex gap-2 justify-start mb-3">
                    <div className="w-7 h-7 rounded-full bg-[#1A4731] flex items-center justify-center flex-shrink-0">
                      <img src={LOGO_URL} alt="APSIS" className="w-5 h-5 object-contain rounded-full" />
                    </div>
                    <div className="bg-white border border-[#DDE3DE] rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-[#F47920] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 bg-[#F47920] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 bg-[#F47920] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span className="text-xs text-[#5C7060]">Pensando...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-[#DDE3DE] bg-white flex-shrink-0">
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite sua mensagem..."
                    rows={1}
                    disabled={loading}
                    className="flex-1 resize-none border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F47920] transition-colors bg-[#F4F6F4] max-h-24 disabled:opacity-50"
                    style={{ minHeight: "38px" }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    className="w-9 h-9 bg-[#F47920] hover:bg-[#D4640D] disabled:opacity-40 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    {loading ? <Loader2 size={15} className="text-white animate-spin" /> : <Send size={15} className="text-white" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#5C7060] mt-1.5 text-center">
                  Assistente APSIS · Não compartilhe senhas ou dados sensíveis
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}