import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { X, Loader2, Link2, Copy } from "lucide-react";
import { toast } from "sonner";

export default function NovoOnboardingModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    nome_completo: "", email_pessoal: "", cargo: "", area: "",
    unidade: "", gestor_nome: "", gestor_email: "", data_admissao_prevista: "",
    tipo_contratacao: "CLT",
  });
  const [salvando, setSalvando] = useState(false);
  const [linkGerado, setLinkGerado] = useState(null);
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const { data: ob, error: obError } = await supabase
        .from("employees_onboarding")
        .insert({
          ...form,
          overall_status: "link_nao_enviado",
          public_form_status: "pendente",
          document_status: "nao_enviado",
          integration_status: "nao_enviado",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (obError) throw obError;

      const token = crypto.randomUUID();
      const { error: linkError } = await supabase.from("onboarding_links").insert({
        onboarding_id: ob.id,
        token,
        status: "ativo",
        criado_em: new Date().toISOString(),
      });
      if (linkError) throw linkError;

      await supabase.from("employees_onboarding").update({
        overall_status: "link_nao_enviado", updated_at: new Date().toISOString()
      }).eq("id", ob.id);

      await supabase.from("onboarding_status_history").insert({
        onboarding_id: ob.id, status: "link_gerado",
        observacao: "Onboarding criado e link gerado", criado_em: new Date().toISOString()
      });

      const link = `${window.location.origin}/OnboardingPublico?token=${token}`;
      setLinkGerado(link);
      onSuccess();
    } catch (e) {
      toast.error("Erro ao criar onboarding: " + e.message);
    }
    setSalvando(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(linkGerado);
    toast.success("Link copiado!");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Novo Onboarding</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {linkGerado ? (
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <Link2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Link de onboarding gerado!</h3>
              <p className="text-sm text-slate-500">Copie e envie o link abaixo para o novo colaborador</p>
            </div>
            <div className="flex gap-2">
              <input
                readOnly
                value={linkGerado}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600"
              />
              <button
                onClick={copyLink}
                className="p-2 bg-[#1A4731] text-white rounded-xl hover:bg-[#245E40] transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-[#F47920] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#d96b1a] transition-colors"
            >
              Concluir
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Nome completo *", field: "nome_completo", type: "text", required: true, full: true },
                { label: "E-mail pessoal *", field: "email_pessoal", type: "email", required: true },
                { label: "Cargo *", field: "cargo", type: "text", required: true },
                { label: "Área / Setor", field: "area", type: "text" },
                { label: "Unidade", field: "unidade", type: "text" },
                { label: "Gestor responsável", field: "gestor_nome", type: "text" },
                { label: "E-mail do gestor", field: "gestor_email", type: "email" },
                { label: "Data prevista admissão", field: "data_admissao_prevista", type: "date" },
              ].map(({ label, field, type, required, full }) => (
                <div key={field} className={full ? "sm:col-span-2" : ""}>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">{label}</label>
                  <input
                    type={type}
                    value={form[field]}
                    onChange={e => set(field, e.target.value)}
                    required={required}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4731]/20 focus:border-[#1A4731]"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Tipo de contratação</label>
                <select
                  value={form.tipo_contratacao}
                  onChange={e => set("tipo_contratacao", e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4731]/20 bg-white"
                >
                  {["CLT", "PJ", "Estágio", "Temporário"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="flex-1 px-4 py-2.5 bg-[#1A4731] text-white rounded-xl hover:bg-[#245E40] text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {salvando ? <><Loader2 className="w-4 h-4 animate-spin" /> Criando...</> : "Criar & Gerar Link"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}