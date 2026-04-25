import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL');
    const supabaseKey = Deno.env.get('VITE_SUPABASE_SERVICE_KEY') || Deno.env.get('SUPABASE_ANON_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { id, colaborador } = await req.json();
    const { data, error } = await supabase
      .from('ch_colaboradores')
      .update(colaborador)
      .eq('id', id)
      .select();

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ colaborador: data?.[0] });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});