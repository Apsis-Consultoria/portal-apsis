-- =============================================
-- APSIS Onboarding — Schema Supabase
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- 1. Tabela principal de onboarding
CREATE TABLE IF NOT EXISTS employees_onboarding (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Dados pessoais
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
  telefone TEXT,
  telefone_secundario TEXT,
  nome_mae TEXT,
  nome_pai TEXT,
  pis_nis TEXT,
  ctps TEXT,
  titulo_eleitor TEXT,
  reservista TEXT,
  -- Endereço
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
  -- Profissional
  cargo TEXT,
  area TEXT,
  unidade TEXT,
  gestor_nome TEXT,
  gestor_email TEXT,
  tipo_contratacao TEXT DEFAULT 'CLT',
  jornada TEXT,
  data_admissao_prevista DATE,
  -- Status
  overall_status TEXT DEFAULT 'link_nao_enviado',
  public_form_status TEXT DEFAULT 'pendente',
  document_status TEXT DEFAULT 'nao_enviado',
  integration_status TEXT DEFAULT 'nao_enviado',
  -- Form data (JSON completo do formulário)
  form_data JSONB DEFAULT '{}',
  -- Audit
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Links de onboarding
CREATE TABLE IF NOT EXISTS onboarding_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_id UUID REFERENCES employees_onboarding(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'ativo',
  data_expiracao TIMESTAMPTZ,
  expirado BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Histórico de status
CREATE TABLE IF NOT EXISTS onboarding_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_id UUID REFERENCES employees_onboarding(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  observacao TEXT,
  criado_por TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Documentos
CREATE TABLE IF NOT EXISTS onboarding_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_id UUID REFERENCES employees_onboarding(id) ON DELETE CASCADE,
  tipo_documento TEXT NOT NULL,
  nome_arquivo TEXT,
  url TEXT,
  status TEXT DEFAULT 'enviado',
  observacao_rh TEXT,
  revisado_por TEXT,
  revisado_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Logs de integração Caju
CREATE TABLE IF NOT EXISTS onboarding_integration_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_id UUID REFERENCES employees_onboarding(id) ON DELETE CASCADE,
  integration_type TEXT DEFAULT 'caju',
  status TEXT DEFAULT 'em_fila',
  request_payload JSONB,
  response_payload JSONB,
  status_code INT,
  error_message TEXT,
  tentativas INT DEFAULT 0,
  processado_por TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  processado_em TIMESTAMPTZ
);

-- 6. Configurações de onboarding
CREATE TABLE IF NOT EXISTS onboarding_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT UNIQUE NOT NULL,
  valor TEXT,
  descricao TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_onboarding_links_token ON onboarding_links(token);
CREATE INDEX IF NOT EXISTS idx_onboarding_history_id ON onboarding_status_history(onboarding_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_docs_id ON onboarding_documents(onboarding_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_integration_id ON onboarding_integration_logs(onboarding_id);

-- RLS (Row Level Security) — desabilitar para uso interno ou configurar policy
ALTER TABLE employees_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_integration_logs ENABLE ROW LEVEL SECURITY;

-- Policy pública para leitura de links (acesso via token)
CREATE POLICY "Public read onboarding_links by token"
  ON onboarding_links FOR SELECT
  USING (true);

CREATE POLICY "Public read employees_onboarding"
  ON employees_onboarding FOR SELECT
  USING (true);

CREATE POLICY "Public insert employees_onboarding"
  ON employees_onboarding FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update employees_onboarding"
  ON employees_onboarding FOR UPDATE
  USING (true);

CREATE POLICY "Public insert onboarding_links"
  ON onboarding_links FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update onboarding_links"
  ON onboarding_links FOR UPDATE
  USING (true);

CREATE POLICY "Public insert status_history"
  ON onboarding_status_history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public select status_history"
  ON onboarding_status_history FOR SELECT
  USING (true);

-- Storage bucket para documentos de onboarding
-- Execute no dashboard Supabase > Storage > New Bucket
-- Nome: onboarding-docs
-- Public: true (ou private + signed URLs)

-- Configurações padrão
INSERT INTO onboarding_settings (chave, valor, descricao) VALUES
  ('expiracao_link_dias', '30', 'Dias para expiração do link de onboarding'),
  ('tamanho_max_arquivo_mb', '10', 'Tamanho máximo de arquivo em MB'),
  ('email_notificacao_rh', 'rh@apsis.com.br', 'E-mail para notificações de RH'),
  ('secao_transporte_ativa', 'true', 'Habilita seção de transporte no formulário'),
  ('secao_beneficios_ativa', 'true', 'Habilita seção de benefícios no formulário'),
  ('secao_dependentes_ativa', 'true', 'Habilita seção de dependentes no formulário'),
  ('secao_bancaria_ativa', 'true', 'Habilita seção de dados bancários'),
  ('assinatura_digital_obrigatoria', 'true', 'Exige assinatura digital ao finalizar')
ON CONFLICT (chave) DO NOTHING;