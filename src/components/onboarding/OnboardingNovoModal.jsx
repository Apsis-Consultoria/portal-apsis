import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { X, Loader2, Copy, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function OnboardingNovoModal({ onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [linkGerado, setLinkGerado] = useState(null);
  const [form, setForm] = useState({
    nome_completo: "", email: "", cpf: "", cargo: "", area: "",
    unidade: "", gestor_nome: "", gestor_email: "",
    tipo_contratacao: "CLT", data_admissao_prev: "", obs_admissao: "",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.nome_completo || !form.email) { toast.error("Nome e e-mail são obrigatórios"); return; }
    setSaving(true);
    try {
      const token = `onb-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const { data, error } = await supabase.from("employees_onboarding").insert({
        ...form,
        status_formulario: "link_nao_enviado",
        documento_status: "pendente",
        integracao_status: "nao_enviado",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).select().single();
      if (error) throw error;

      // Cria o link
      await supabase.from("onboarding_links").insert({
        onboarding_id: data.id,
        token,
        status: "ativo",
        created_at: new Date().toISOString(),
      });
      await supabase.from("employees_onboarding").update({ status_formulario: "link_nao_enviado" }).eq("id", data.id);
      await supabase.from("onboarding_status_history").insert({
        onboarding_id: data.id, status: "criado",
        descricao: "Onboarding criado pelo RH", created_at: new Date().toISOString(),
      });

      const link = `${window.location.origin}/capital-humano/onboarding/public/${token}`;
      setLinkGerado(link);
      toast.success("Onboarding criado com sucesso!");
      onSaved();
    } catch (err) {
      toast.error("Erro ao criar: " + err.message);
    }
    setSaving(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(linkGerado);
    toast.success("Link copiado!");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#1A4731] to-[#245E40] px-6 py-5 flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">Novo Onboarding</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {linkGerado ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-green-700 font-semibold mb-1">Onboarding criado!</p>
                <p className="text-green-600 text-sm">Compartilhe o link abaixo com o novo colaborador.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">Link público de acesso</p>
                <div className="flex gap-2">
                  <Input value={linkGerado} readOnly className="text-xs" />
                  <Button variant="outline" onClick={copyLink} className="gap-2 flex-shrink-0">
                    <Copy className="w-4 h-4" /> Copiar
                  </Button>
                </div>
              </div>
              <Button onClick={onClose} className="w-full bg-[#1A4731] hover:bg-[#245E40] text-white">Concluir</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nome completo *" value={form.nome_completo} onChange={v => set("nome_completo", v)} />
                <Field label="E-mail corporativo *" value={form.email} onChange={v => set("email", v)} type="email" />
                <Field label="CPF" value={form.cpf} onChange={v => set("cpf", v)} />
                <Field label="Cargo" value={form.cargo} onChange={v => set("cargo", v)} />
                <Field label="Área / Setor" value={form.area} onChange={v => set("area", v)} />
                <Field label="Unidade" value={form.unidade} onChange={v => set("unidade", v)} />
                <Field label="Gestor responsável" value={form.gestor_nome} onChange={v => set("gestor_nome", v)} />
                <Field label="E-mail do gestor" value={form.gestor_email} onChange={v => set("gestor_email", v)} type="email" />
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">Tipo de contratação</Label>
                  <Select value={form.tipo_contratacao} onValueChange={v => set("tipo_contratacao", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["CLT","PJ","Estágio","Temporário"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Field label="Data prevista de admissão" value={form.data_admissao_prev} onChange={v => set("data_admissao_prev", v)} type="date" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Observações</Label>
                <textarea value={form.obs_admissao} onChange={e => set("obs_admissao", e.target.value)} rows={2}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} disabled={saving} className="bg-[#F47920] hover:bg-[#d96b1a] text-white gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                  {saving ? "Criando..." : "Criar e Gerar Link"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      <Input type={type} value={value || ""} onChange={e => onChange(e.target.value)} />
    </div>
  );
}