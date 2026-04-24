import { supabase } from '@/lib/supabaseClient';

export const colaboradoresService = {
  async list() {
    const { data, error } = await supabase
      .from('ch_colaboradores')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(colaborador) {
    const { data, error } = await supabase
      .from('ch_colaboradores')
      .insert([colaborador])
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  async update(id, colaborador) {
    const { data, error } = await supabase
      .from('ch_colaboradores')
      .update(colaborador)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  async delete(id) {
    const { error } = await supabase
      .from('ch_colaboradores')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};