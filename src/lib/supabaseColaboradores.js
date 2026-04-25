import { base44 } from '@/api/base44Client';

export const colaboradoresService = {
  async list() {
    const res = await base44.functions.invoke('getColaboradores', {});
    return res.data?.colaboradores || [];
  },

  async create(colaborador) {
    const res = await base44.functions.invoke('createColaborador', { colaborador });
    return res.data?.colaborador;
  },

  async update(id, colaborador) {
    const res = await base44.functions.invoke('updateColaborador', { id, colaborador });
    return res.data?.colaborador;
  },

  async delete(id) {
    await base44.functions.invoke('deleteColaborador', { id });
  }
};