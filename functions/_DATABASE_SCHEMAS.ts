/**
 * =====================================================
 * DATABASE SCHEMAS - Export Completo para Migração
 * =====================================================
 * 
 * Este arquivo contém os schemas completos de todas as entidades
 * do Portal APSIS em formato Prisma, pronto para migração.
 * 
 * =====================================================
 */

/*

## 📦 SCHEMA PRISMA COMPLETO

Copie este schema para `prisma/schema.prisma` no projeto Next.js:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// AUTENTICAÇÃO E USUÁRIOS
// ============================================

model User {
  id         String   @id @default(cuid())
  email      String   @unique
  full_name  String?
  role       String   @default("user") // admin, diretor, gerente, analista
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  
  colaborador       Colaborador?
  integration_logs  IntegrationLog[]
  assistant_logs    AssistantLog[]
  
  @@map("users")
}

model Colaborador {
  id                       String   @id @default(cuid())
  nome                     String
  cargo                    String?
  area                     String?
  departamento             String?
  departamentos            String?  // JSON array
  capacidade_horas_mensais Float    @default(160)
  email                    String?  @unique
  ativo                    Boolean  @default(true)
  paginas_permissoes       String?  // JSON object
  allow_print              Boolean  @default(false)
  allow_excel              Boolean  @default(false)
  created_at               DateTime @default(now())
  updated_at               DateTime @updatedAt
  created_by               String?
  
  user      User?            @relation(fields: [email], references: [email])
  alocacoes AlocacaoHoras[]
  
  @@map("colaboradores")
}

// ============================================
// INTEGRAÇÃO ERP
// ============================================

model IntegrationConfig {
  id                        String   @id @default(cuid())
  integration_name          String
  integration_type          String
  is_active                 Boolean  @default(true)
  endpoint_url              String?
  sync_frequency            String   @default("manual")
  last_sync_date            DateTime?
  entity_mapping            String?
  field_mapping             String?
  sync_direction            String   @default("import")
  filter_rules              String?
  error_notification_email  String?
  created_at                DateTime @default(now())
  updated_at                DateTime @updatedAt
  created_by                String?
  
  data_mappings  DataMapping[]
  sync_queue     SyncQueue[]
  
  @@map("integration_configs")
}

model DataMapping {
  id                    String   @id @default(cuid())
  integration_config_id String
  source_entity         String
  target_entity         String
  source_field          String
  target_field          String
  transformation_rule   String?
  is_required           Boolean  @default(false)
  default_value         String?
  validation_rule       String?
  created_at            DateTime @default(now())
  updated_at            DateTime @updatedAt
  
  integration_config IntegrationConfig @relation(fields: [integration_config_id], references: [id], onDelete: Cascade)
  
  @@map("data_mappings")
}

model SyncQueue {
  id                    String    @id @default(cuid())
  integration_config_id String
  entity_name           String
  operation             String
  source_record_id      String?
  target_record_id      String?
  record_data           String?
  status                String    @default("pending")
  priority              Int       @default(5)
  retry_count           Int       @default(0)
  max_retries           Int       @default(3)
  scheduled_date        DateTime?
  processed_date        DateTime?
  error_message         String?
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt
  
  integration_config IntegrationConfig @relation(fields: [integration_config_id], references: [id], onDelete: Cascade)
  
  @@index([status, priority])
  @@map("sync_queue")
}

model IntegrationLog {
  id                  String   @id @default(cuid())
  integration_name    String
  operation_type      String
  entity_name         String?
  status              String   @default("pending")
  records_processed   Int      @default(0)
  records_success     Int      @default(0)
  records_error       Int      @default(0)
  error_message       String?
  execution_time_ms   Int?
  metadata            String?
  created_at          DateTime @default(now())
  created_by          String?
  
  user User? @relation(fields: [created_by], references: [id])
  
  @@index([integration_name, created_at])
  @@map("integration_logs")
}

// ============================================
// CLIENTES E PIPELINE
// ============================================

model Cliente {
  id             String   @id @default(cuid())
  nome           String
  cnpj           String?
  segmento       String?
  contato_nome   String?
  contato_email  String?
  ativo          Boolean  @default(true)
  created_at     DateTime @default(now())
  updated_at     DateTime @updatedAt
  created_by     String?
  
  @@map("clientes")
}

model OAP {
  id             String   @id @default(cuid())
  cliente_nome   String
  natureza       String   @default("Contábil")
  responsavel    String
  status         String   @default("Aberta")
  observacoes    String?
  convertida_ap  Boolean  @default(false)
  created_at     DateTime @default(now())
  updated_at     DateTime @updatedAt
  created_by     String?
  
  @@map("oaps")
}

model Proposta {
  id                   String    @id @default(cuid())
  numero_ap            String?
  cliente_nome         String
  departamento         String?
  natureza             String
  quantidade_laudos    Float     @default(0)
  quantidade_horas     Float     @default(0)
  taxa_media           Float     @default(0)
  desconto_percentual  Float     @default(0)
  valor_total          Float     @default(0)
  chance_conversao     Float     @default(50)
  temperatura          String    @default("Morna")
  status               String    @default("Em elaboração")
  data_envio           DateTime?
  ultimo_followup      DateTime?
  nivel_followup       String?
  observacoes          String?
  responsavel          String
  oap_origem           String?
  created_at           DateTime  @default(now())
  updated_at           DateTime  @updatedAt
  created_by           String?
  
  ordens_servico OrdemServico[]
  parcelas       Parcela[]
  
  @@map("propostas")
}

// ============================================
// PROJETOS
// ============================================

model OrdemServico {
  id                   String    @id @default(cuid())
  proposta_id          String
  proposta_numero      String?
  cliente_nome         String?
  responsavel_tecnico  String
  status               String    @default("Não iniciado")
  percentual_conclusao Float     @default(0)
  prazo_previsto       DateTime?
  valor_proporcional   Float     @default(0)
  descricao            String?
  natureza             String?
  observacoes          String?
  created_at           DateTime  @default(now())
  updated_at           DateTime  @updatedAt
  created_by           String?
  
  proposta  Proposta       @relation(fields: [proposta_id], references: [id], onDelete: Cascade)
  parcelas  Parcela[]
  alocacoes AlocacaoHoras[]
  
  @@map("ordens_servico")
}

model AlocacaoHoras {
  id               String    @id @default(cuid())
  colaborador      String
  projeto_id       String
  setor            String?
  horas_previstas  Float     @default(0)
  horas_executadas Float     @default(0)
  data_inicio      DateTime?
  data_fim         DateTime?
  status           String    @default("Planejada")
  observacoes      String?
  created_at       DateTime  @default(now())
  updated_at       DateTime  @updatedAt
  created_by       String?
  
  colaborador_rel Colaborador?  @relation(fields: [colaborador], references: [nome])
  ordem_servico   OrdemServico? @relation(fields: [projeto_id], references: [id])
  
  @@map("alocacoes_horas")
}

// ============================================
// FINANCEIRO
// ============================================

model Parcela {
  id               String    @id @default(cuid())
  os_id            String?
  proposta_id      String
  cliente_nome     String?
  valor            Float     @default(0)
  data_vencimento  DateTime
  data_recebimento DateTime?
  status           String    @default("Lançada")
  mes_referencia   String?
  ano_referencia   Int?
  nota_fiscal      String?
  observacoes      String?
  created_at       DateTime  @default(now())
  updated_at       DateTime  @updatedAt
  created_by       String?
  
  proposta      Proposta      @relation(fields: [proposta_id], references: [id], onDelete: Cascade)
  ordem_servico OrdemServico? @relation(fields: [os_id], references: [id])
  
  @@map("parcelas")
}

// ============================================
// BUDGET
// ============================================

model BusinessUnit {
  id                 String   @id @default(cuid())
  business_unit_name String
  business_unit_code String   @unique
  is_active          Boolean  @default(true)
  created_at         DateTime @default(now())
  updated_at         DateTime @updatedAt
  created_by         String?
  
  service_groups ServiceGroup[]
  budgets        Budget[]
  
  @@map("business_units")
}

model ServiceGroup {
  id                 String   @id @default(cuid())
  business_unit_id   String
  service_group_name String
  service_group_code String   @unique
  is_active          Boolean  @default(true)
  created_at         DateTime @default(now())
  updated_at         DateTime @updatedAt
  created_by         String?
  
  business_unit BusinessUnit @relation(fields: [business_unit_id], references: [id], onDelete: Cascade)
  budgets       Budget[]
  
  @@map("service_groups")
}

model Budget {
  id                    String   @id @default(cuid())
  business_unit_id      String
  service_group_id      String?
  period_id             String?
  year                  Int
  quarter               String
  budget_revenue        Float    @default(0)
  budget_clients        Int      @default(0)
  budget_ticket_average Float    @default(0)
  created_at            DateTime @default(now())
  updated_at            DateTime @updatedAt
  created_by            String?
  
  business_unit BusinessUnit  @relation(fields: [business_unit_id], references: [id], onDelete: Cascade)
  service_group ServiceGroup? @relation(fields: [service_group_id], references: [id])
  
  @@map("budgets")
}

// ============================================
// MARKETING
// ============================================

model VendaMarketing {
  id                    String    @id @default(cuid())
  proposta_numero       String?
  cliente_nome          String
  area                  String
  grupo_servico         String?
  tipo_venda            String
  perfil_cliente        String
  status                String
  valor                 Float     @default(0)
  data_criacao_proposta DateTime
  data_aceite_ou_perda  DateTime?
  trimestre             Int?
  ano                   Int?
  responsavel           String?
  observacoes           String?
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt
  created_by            String?
  
  @@map("vendas_marketing")
}

model OrcamentoMarketing {
  id               String   @id @default(cuid())
  ano              Int
  mes              Int?
  area             String
  grupo_servico    String?
  valor_orcado     Float    @default(0)
  valor_realizado  Float    @default(0)
  observacoes      String?
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt
  created_by       String?
  
  @@map("orcamentos_marketing")
}

// ============================================
// ORGANIZAÇÃO
// ============================================

model Departamento {
  id          String   @id @default(cuid())
  nome        String
  descricao   String?
  ativo       Boolean  @default(true)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  created_by  String?
  
  @@map("departamentos")
}

// ============================================
// ASSISTENTE IA
// ============================================

model KnowledgeBase {
  id             String   @id @default(cuid())
  title          String
  content        String
  category       String   @default("FAQ")
  module         String   @default("Geral")
  sensitivity    String   @default("INTERNO")
  allowed_roles  String[]
  ativo          Boolean  @default(true)
  tags           String?
  created_at     DateTime @default(now())
  updated_at     DateTime @updatedAt
  created_by     String?
  
  @@map("knowledge_base")
}

model AssistantLog {
  id            String   @id @default(cuid())
  user_email    String
  user_role     String?
  modulo        String?
  status        String   @default("success")
  sources_count Int      @default(0)
  latency_ms    Int?
  created_at    DateTime @default(now())
  
  user User? @relation(fields: [user_email], references: [email])
  
  @@map("assistant_logs")
}

model AssistantConfig {
  id         String   @id @default(cuid())
  key        String   @unique
  value      String
  descricao  String?
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  
  @@map("assistant_configs")
}

// ============================================
// ENTIDADES ADICIONAIS
// ============================================

model CalendarPeriod {
  id          String   @id @default(cuid())
  period_name String
  start_date  DateTime
  end_date    DateTime
  is_active   Boolean  @default(true)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  
  @@map("calendar_periods")
}

model ClientMaster {
  id          String   @id @default(cuid())
  client_code String   @unique
  client_name String
  segment     String?
  is_active   Boolean  @default(true)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  
  @@map("client_master")
}

model CommercialTeam {
  id          String   @id @default(cuid())
  member_name String
  role        String?
  department  String?
  is_active   Boolean  @default(true)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  
  @@map("commercial_teams")
}

model Proposal {
  id                String   @id @default(cuid())
  proposal_number   String   @unique
  client_name       String
  business_unit     String
  service_group     String?
  proposal_value    Float    @default(0)
  proposal_date     DateTime
  status            String   @default("Em elaboração")
  conversion_chance Float    @default(50)
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  
  @@map("proposals")
}

model SalesTransaction {
  id                String   @id @default(cuid())
  transaction_date  DateTime
  client_name       String
  business_unit     String
  service_group     String?
  transaction_value Float    @default(0)
  transaction_type  String
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  
  @@map("sales_transactions")
}

model PipelineSnapshot {
  id              String   @id @default(cuid())
  snapshot_date   DateTime
  business_unit   String
  pipeline_value  Float    @default(0)
  proposals_count Int      @default(0)
  created_at      DateTime @default(now())
  
  @@map("pipeline_snapshots")
}

model KPISummary {
  id            String   @id @default(cuid())
  period        String
  business_unit String?
  kpi_name      String
  kpi_value     Float    @default(0)
  target_value  Float?
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
  
  @@map("kpi_summaries")
}
```

---

## 📊 SCRIPT DE EXPORTAÇÃO DE DADOS

Salvar como `export-base44-data.js`:

```javascript
const fs = require('fs');
const path = require('path');

// Importar SDK Base44
const { base44 } = require('./src/api/base44Client');

const ENTITIES = [
  'Cliente',
  'OAP',
  'Proposta',
  'OrdemServico',
  'Parcela',
  'Colaborador',
  'Departamento',
  'Budget',
  'BusinessUnit',
  'ServiceGroup',
  'VendaMarketing',
  'OrcamentoMarketing',
  'AlocacaoHoras',
  'KnowledgeBase',
  'AssistantLog',
  'AssistantConfig',
  'IntegrationConfig',
  'DataMapping',
  'SyncQueue',
  'IntegrationLog',
  'CalendarPeriod',
  'ClientMaster',
  'CommercialTeam',
  'Proposal',
  'SalesTransaction',
  'PipelineSnapshot',
  'KPISummary',
];

async function exportEntity(entityName) {
  try {
    console.log(`📦 Exportando ${entityName}...`);
    
    const data = await base44.entities[entityName].list();
    
    const outputDir = path.join(__dirname, 'exports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filename = path.join(outputDir, `${entityName.toLowerCase()}.json`);
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    
    console.log(`✅ ${entityName}: ${data.length} registros exportados`);
    return data.length;
  } catch (error) {
    console.error(`❌ Erro ao exportar ${entityName}:`, error.message);
    return 0;
  }
}

async function exportAll() {
  console.log('🚀 Iniciando exportação de dados Base44...\n');
  
  let totalRecords = 0;
  
  for (const entity of ENTITIES) {
    const count = await exportEntity(entity);
    totalRecords += count;
  }
  
  console.log(`\n✨ Exportação concluída!`);
  console.log(`📁 ${ENTITIES.length} entidades exportadas`);
  console.log(`📊 ${totalRecords} registros totais`);
  console.log(`💾 Arquivos salvos em: ./exports/`);
}

exportAll();
```

**Executar:**
```bash
node export-base44-data.js
```

---

Última atualização: 2026-03-12

*/

export default function() {
  throw new Error('Este arquivo é apenas documentação.');
}