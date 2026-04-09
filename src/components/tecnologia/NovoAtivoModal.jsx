import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { X } from "lucide-react";

export default function NovoAtivoModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    tipo: "notebook",
    marca: "",
    modelo: "",
    numero_serie: "",
    numero_patrimonio: "",
    processador: "",
    ram_gb: 0,
    armazenamento_gb: 0,
    sistema_operacional: "windows",
    data_aquisicao: "",
    valor: 0,
    fornecedor: "",
  });

  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const { error } = await supabase.from("estoque_ativos").insert({
        ...form,
        status: "em_estoque",
        ram_gb: parseFloat(form.ram_gb) || 0,
        armazenamento_gb: parseFloat(form.armazenamento_gb) || 0,
        valor_aquisicao: parseFloat(form.valor_aquisicao) || 0,
      });
      if (error) throw error;
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao criar ativo:", error);
      alert("Erro ao criar ativo");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#DDE3DE] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1A2B1F]">Novo Ativo</h2>
          <button onClick={onClose} className="text-[#5C7060] hover:text-[#1A2B1F]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#1A2B1F]">Tipo*</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
                required
              >
                <option value="notebook">Notebook</option>
                <option value="desktop">Desktop</option>
                <option value="monitor">Monitor</option>
                <option value="teclado">Teclado</option>
                <option value="mouse">Mouse</option>
                <option value="headset">Headset</option>
                <option value="webcam">Webcam</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#1A2B1F]">Marca*</label>
              <input
                type="text"
                value={form.marca}
                onChange={(e) => setForm({ ...form, marca: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#1A2B1F]">Modelo*</label>
              <input
                type="text"
                value={form.modelo}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#1A2B1F]">Nº Série*</label>
              <input
                type="text"
                value={form.numero_serie}
                onChange={(e) => setForm({ ...form, numero_serie: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#1A2B1F]">Patrimônio</label>
              <input
                type="text"
                value={form.numero_patrimonio}
                onChange={(e) => setForm({ ...form, numero_patrimonio: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#1A2B1F]">Processador</label>
              <input
                type="text"
                value={form.processador}
                onChange={(e) => setForm({ ...form, processador: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#1A2B1F]">RAM (GB)</label>
              <input
                type="number"
                value={form.ram_gb}
                onChange={(e) => setForm({ ...form, ram_gb: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#1A2B1F]">Armazenamento (GB)</label>
              <input
                type="number"
                value={form.armazenamento_gb}
                onChange={(e) => setForm({ ...form, armazenamento_gb: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#1A2B1F]">SO</label>
              <select
                value={form.sistema_operacional}
                onChange={(e) => setForm({ ...form, sistema_operacional: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
              >
                <option value="windows">Windows</option>
                <option value="macos">macOS</option>
                <option value="linux">Linux</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#1A2B1F]">Data Aquisição</label>
              <input
                type="date"
                value={form.data_aquisicao}
                onChange={(e) => setForm({ ...form, data_aquisicao: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#1A2B1F]">Valor</label>
              <input
                type="number"
                step="0.01"
                value={form.valor_aquisicao}
                onChange={(e) => setForm({ ...form, valor_aquisicao: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#1A2B1F]">Fornecedor</label>
              <input
                type="text"
                value={form.fornecedor}
                onChange={(e) => setForm({ ...form, fornecedor: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-[#DDE3DE]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#DDE3DE] text-[#1A2B1F] rounded-lg hover:bg-[#F4F6F4] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 px-4 py-2 bg-[#1A4731] text-white rounded-lg hover:bg-[#245E40] transition-colors disabled:opacity-50"
            >
              {salvando ? "Salvando..." : "Criar Ativo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}