import { useState } from "react";
import { FileText, Send, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Editoracao() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, type: "user" }]);
      setInput("");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Agente de Editoração */}
      <div className="w-56 bg-white border-r border-gray-200 flex flex-col p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Agente de Editoração</h3>
        <p className="text-xs text-gray-500 mb-6">Conheça o processo passo a passo</p>

        {/* Status da conexão */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 text-xs">
          <p className="font-semibold text-yellow-900">AGENTE</p>
          <p className="text-yellow-700 mt-1">Erro ao conecter com o agente. Verifique sua conexão.</p>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col gap-4 mb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`text-xs ${msg.type === "user" ? "text-right" : ""}`}>
              <p className="text-gray-700">{msg.text}</p>
            </div>
          ))}
          {messages.length === 0 && (
            <p className="text-xs text-gray-400 text-center">Nenhuma mensagem ainda</p>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Digite sua resposta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 text-xs border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-600"
          />
          <button
            onClick={handleSendMessage}
            className="bg-green-700 hover:bg-green-800 text-white rounded p-2 transition"
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      {/* Main Content - Preview */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="bg-green-700 text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">APSIS</span>
            <span className="text-orange-400 font-semibold text-sm">Consultoria</span>
            <span className="text-gray-300 text-sm ml-2">Editoração de Laudos</span>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 flex flex-col p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-gray-900">Preview do Laudo</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download size={14} />
                Reenviar
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600 gap-2">
                <Download size={14} />
                Exportar PDF
              </Button>
            </div>
          </div>

          {/* Empty State */}
          <div className="flex-1 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center mb-4 opacity-50">
              <FileText size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-2">Laudo não iniciado</p>
            <p className="text-xs text-gray-500 text-center max-w-xs">
              Use o chat ao lado para iniciar o processo de montagem do laudo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}