import { createClient } from 'npm:@supabase/supabase-js@2.103.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('VITE_SUPABASE_SERVICE_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  try {
    const { colaboradores } = await req.json();

    if (!colaboradores || !Array.isArray(colaboradores)) {
      return Response.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Mapear colunas do Excel para o formato esperado
    const dadosFormatados = colaboradores.map(row => ({
      nome: row['Nome'] || row.nome || '',
      email: row['Email Corporativo'] || row.email || '',
      unidade: row['Unidade'] || row.unidade || '',
      departamento: row['Departamento'] || row.departamento || '',
      cargo: row['Cargo'] || row.cargo || '',
      area: row['Área'] || row.area || '',
      capacidade_horas_mensais: 160,
      ativo: true,
    })).filter(c => c.nome && c.nome.trim()); // Filtrar linhas vazias

    if (dadosFormatados.length === 0) {
      return Response.json({ error: 'Nenhum dado válido encontrado' }, { status: 400 });
    }

    // Inserir no Supabase
    const { data, error } = await supabase
      .from('colaboradores')
      .insert(dadosFormatados)
      .select();

    if (error) {
      throw error;
    }

    return Response.json({
      success: true,
      mensagem: `${data.length} colaboradores importados com sucesso`,
      count: data.length
    });
  } catch (error) {
    console.error('Erro ao importar:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});