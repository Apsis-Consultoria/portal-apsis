import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase configuration missing. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const colaboradoresService = {
  async list() {
    const { data, error } = await supabase
      .from('colaboradores')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(colaborador) {
    const { data, error } = await supabase
      .from('colaboradores')
      .insert([colaborador])
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  async update(id, colaborador) {
    const { data, error } = await supabase
      .from('colaboradores')
      .update(colaborador)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data?.[0];
  },

  async delete(id) {
    const { error } = await supabase
      .from('colaboradores')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};