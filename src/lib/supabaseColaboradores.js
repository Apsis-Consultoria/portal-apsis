import { createClient } from '@supabase/supabase-js';

// Tenta carregar de forma fallback: primeiro VITE_, depois variáveis normais
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Se não tiver VITE_, tenta as variáveis normais
if (!supabaseUrl) {
  supabaseUrl = import.meta.env.SUPABASE_URL;
}
if (!supabaseAnonKey) {
  supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase config:', {
    url: supabaseUrl ? 'OK' : 'MISSING',
    key: supabaseAnonKey ? 'OK' : 'MISSING'
  });
  throw new Error('Supabase configuration missing. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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