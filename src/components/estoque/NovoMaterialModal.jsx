import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";

export default function NovoMaterialModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    categoria: "componentes",
    codigo: "",
    quantidade_atual: 0,
    quantidade_minima: 0,
    unidade_medida: "unidade",
    valor_unitario: 0,
    fornecedor: "",
    localizacao: "",
    marca: "",
    modelo: "",
    processador: "",
    ram_gb: "",
    armazenamento_gb: "",
    sistema_operacional: "windows",
    tempo_uso_meses: "",
    numero_serie: "",
  });

  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const valor_unitario = parseFloat(form.valor_unitario) || 0;
      const quantidade_atual = parseFloat(form.quantidade_atual) || 0;
      
      await base44.entities.Material.create({
        ...form,
        quantidade_atual,
        quantidade_minima: parseFloat(form.quantidade_minima) || 0,
        valor_unitario,
        valor_total: valor_unitario * quantidade_atual,
        ativo: true,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao criar material:", error);
      alert("Erro ao criar material");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#DDE3DE] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1A2B1F]">Novo Material</h2>
          <button onClick={onClose} className="text-[#5C7060] hover:text-[#1A2B1F]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-[#1A2B1F]">Nome do Material*</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#1A2B1F]">Código</label>
              <input
                type="text"
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#1A2B1F]">Categoria*</label>
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
              >
                <option value="componentes">Componentes</option>
                <option value="consumiveis">Consumíveis</option>
                <option value="ferramentas">Ferramentas</option>
                <option value="equipamentos">Equipamentos</option>
                <option value="notebooks">Notebooks</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#1A2B1F]">Quantidade Atual*</label>
              <input
                type="number"
                value={form.quantidade_atual}
                onChange={(e) => setForm({ ...form, quantidade_atual: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#1A2B1F]">Quantidade Mínima</label>
              <input
                type="number"
                value={form.quantidade_minima}
                onChange={(e) => setForm({ ...form, quantidade_minima: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#1A2B1F]">Unidade de Medida</label>
              <select
                value={form.unidade_medida}
                onChange={(e) => setForm({ ...form, unidade_medida: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
              >
                <option value="unidade">Unidade</option>
                <option value="metro">Metro</option>
                <option value="kg">Kg</option>
                <option value="litro">Litro</option>
                <option value="caixa">Caixa</option>
                <option value="rolo">Rolo</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-[#1A2B1F]">Valor Unitário</label>
              <input
                type="number"
                step="0.01"
                value={form.valor_unitario}
                onChange={(e) => setForm({ ...form, valor_unitario: e.target.value })}
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

            <div>
              <label className="text-sm font-medium text-[#1A2B1F]">Local de Armazenamento</label>
              <input
                type="text"
                value={form.localizacao}
                onChange={(e) => setForm({ ...form, localizacao: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
              />
            </div>

            {/* Campos específicos para Notebooks */}
            {form.categoria === 'notebooks' && (
              <>
                <div className="sm:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-[#1A2B1F] mb-4">Especificações do Notebook</h3>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1A2B1F]">Marca</label>
                  <input
                    type="text"
                    value={form.marca}
                    onChange={(e) => setForm({ ...form, marca: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
                    placeholder="Ex: Dell, HP, Lenovo"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1A2B1F]">Modelo</label>
                  <input
                    type="text"
                    value={form.modelo}
                    onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
                    placeholder="Ex: Inspiron 15"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1A2B1F]">Processador</label>
                  <input
                    type="text"
                    value={form.processador}
                    onChange={(e) => setForm({ ...form, processador: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
                    placeholder="Ex: Intel i5 11ª gen"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1A2B1F]">RAM (GB)</label>
                  <input
                    type="number"
                    value={form.ram_gb}
                    onChange={(e) => setForm({ ...form, ram_gb: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
                    placeholder="8"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1A2B1F]">Armazenamento (GB)</label>
                  <input
                    type="number"
                    value={form.armazenamento_gb}
                    onChange={(e) => setForm({ ...form, armazenamento_gb: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
                    placeholder="256"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1A2B1F]">Sistema Operacional</label>
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
                  <label className="text-sm font-medium text-[#1A2B1F]">Tempo de Uso (meses)</label>
                  <input
                    type="number"
                    value={form.tempo_uso_meses}
                    onChange={(e) => setForm({ ...form, tempo_uso_meses: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1A2B1F]">Número de Série</label>
                  <input
                    type="text"
                    value={form.numero_serie}
                    onChange={(e) => setForm({ ...form, numero_serie: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
                    placeholder="ABC123XYZ"
                  />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-[#1A2B1F]">Descrição</label>
              <textarea
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                rows="2"
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
              {salvando ? "Salvando..." : "Criar Material"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}