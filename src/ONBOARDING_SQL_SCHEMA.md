# Onboarding Module — Supabase SQL Schema

Run the following SQL in your Supabase SQL Editor to create all required tables.

```sql
-- 1. employees_onboarding
CREATE TABLE IF NOT EXISTS employees_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo TEXT,
  nome_social TEXT,
  cpf TEXT,
  rg TEXT,
  orgao_emissor TEXT,
  data_nascimento DATE,
  estado_civil TEXT,
  nacionalidade TEXT,
  naturalidade TEXT,
  sexo TEXT,
  email_pessoal TEXT,
  email TEXT,
  telefone TEXT,
  telefone_sec TEXT,
  nome_mae TEXT,
  nome_pai TEXT,
  pis_nis TEXT,
  ctps TEXT,
  titulo_eleitor TEXT,
  reservista TEXT,
  cep TEXT,
  logradouro TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  pais TEXT DEFAULT 'Brasil',
  tipo_residencia TEXT,
  tempo_residencia TEXT,
  cargo TEXT,
  area TEXT,
  unidade TEXT,
  gestor_nome TEXT,
  gestor_email TEXT,
  tipo_contratacao TEXT,
  jornada TEXT,
  data_admissao_prev DATE,
  outro_vinculo BOOLEAN DEFAULT false,
  precisa_equipamento BOOLEAN DEFAULT false,
  obs_admissao TEXT,
  dependentes JSONB DEFAULT '[]',
  precisa_vt BOOLEAN DEFAULT false,
  endereco_origem_vt TEXT,
  modal_transporte TEXT,
  qtd_conducoes TEXT,
  linhas_trajeto TEXT,
  custo_diario_vt TEXT,
  custo_mensal_vt TEXT,
  dias_presenciais TEXT,
  obs_transporte TEXT,
  beneficio_alimentacao BOOLEAN DEFAULT false,
  beneficio_refeicao BOOLEAN DEFAULT false,
  modelo_trabalho TEXT,
  restricao_alimentar BOOLEAN DEFAULT false,
  desc_restricao TEXT,
  cidade_atuacao TEXT,
  obs_beneficios TEXT,
  banco TEXT,
  agencia TEXT,
  conta TEXT,
  tipo_conta TEXT,
  chave_pix TEXT,
  titular_conta TEXT,
  cpf_titular TEXT,
  obs_bancario TEXT,
  emergencia_nome TEXT,
  emergencia_parentesco TEXT,
  emergencia_telefone TEXT,
  emergencia_email TEXT,
  emergencia_obs TEXT,
  documentos JSONB DEFAULT '{}',
  decl_veracidade BOOLEAN DEFAULT false,
  decl_autorizacao BOOLEAN DEFAULT false,
  decl_lgpd BOOLEAN DEFAULT false,
  assinatura_nome TEXT,
  status_formulario TEXT DEFAULT 'link_nao_enviado',
  documento_status TEXT DEFAULT 'pendente',
  integracao_status TEXT DEFAULT 'nao_enviado',
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. onboarding_links
CREATE TABLE IF NOT EXISTS onboarding_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID REFERENCES employees_onboarding(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'ativo',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. onboarding_status_history
CREATE TABLE IF NOT EXISTS onboarding_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_id UUID REFERENCES employees_onboarding(id) ON DELETE CASCADE,
  status TEXT,
  descricao TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Storage bucket for onboarding docs
INSERT INTO storage.buckets (id, name, public)
VALUES ('onboarding-docs', 'onboarding-docs', true)
ON CONFLICT DO NOTHING;

-- 5. Storage policies (allow public read, authenticated write)
CREATE POLICY "Allow public read onboarding-docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'onboarding-docs');

CREATE POLICY "Allow insert onboarding-docs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'onboarding-docs');
``