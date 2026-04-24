import { useState, useEffect } from 'react';
import { colaboradoresService } from '@/lib/supabaseColaboradores';
import { X, Loader2 } from 'lucide-react';

export default function ColaboradorFormModal({ open, colaborador, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cargo: '',
    area: '',
    departamento: '',
    capacidade_horas_mensais: 160,
    ativo: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (colaborador) {
      setFormData(colaborador);
    } else {
      setFormData({
        nome: '',
        email: '',
        cargo: '',
        area: '',
        departamento: '',
        capacidade_horas_mensais: 160,
        ativo: true,
      });
    }
  }, [colaborador, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (colaborador?.id) {
        await colaboradoresService.update(colaborador.id, formData);
      } else {
        await colaboradoresService.create(formData);
      }
      onSaved();
      onClose();
    } catch (error) {
      alert('Erro ao salvar colaborador');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {colaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-[var(--surface-2)] rounded-lg transition-colors">
            <X size={18} className="text-[var(--text-secondary)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">Nome *</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[#F47920]"
              placeholder="Nome completo"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[#F47920]"
              placeholder="email@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">Cargo</label>
              <input
                type="text"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[#F47920]"
                placeholder="Cargo"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">Área</label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[#F47920]"
                placeholder="Área"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">Departamento</label>
            <input
              type="text"
              name="departamento"
              value={formData.departamento}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[#F47920]"
              placeholder="Departamento"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">Capacidade de Horas/Mês</label>
            <input
              type="number"
              name="capacidade_horas_mensais"
              value={formData.capacidade_horas_mensais}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:border-[#F47920]"
              min="0"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="ativo"
              name="ativo"
              checked={formData.ativo}
              onChange={handleChange}
              className="w-4 h-4 cursor-pointer"
            />
            <label htmlFor="ativo" className="text-sm text-[var(--text-secondary)] cursor-pointer">
              Colaborador ativo
            </label>
          </div>

          <div className="flex gap-2 pt-6 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-[#1A4731] text-white rounded-lg text-sm font-medium hover:bg-[#245E40] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}