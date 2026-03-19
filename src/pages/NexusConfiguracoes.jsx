import { useState } from 'react';
import { Save, Settings, Globe, MessageSquare, Mail, Share2, Lock, Check, AlertCircle, ChevronDown, Upload } from 'lucide-react';

const ConfigSection = ({ title, description, children }) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wide">{title}</h3>
      {description && <p className="text-xs text-[var(--text-secondary)] mt-1">{description}</p>}
    </div>
    <div className="bg-[var(--surface-2)] rounded-lg p-4 space-y-4">
      {children}
    </div>
  </div>
);

const FormField = ({ label, description, children, required }) => (
  <div>
    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {description && <p className="text-xs text-[var(--text-secondary)] mb-2">{description}</p>}
    {children}
  </div>
);

const TextInput = ({ placeholder, defaultValue }) => (
  <input
    type="text"
    placeholder={placeholder}
    defaultValue={defaultValue}
    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--apsis-orange)]/50"
  />
);

const SelectInput = ({ options, defaultValue }) => (
  <select
    defaultValue={defaultValue}
    className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--apsis-orange)]/50"
  >
    {options.map(opt => (
      <option key={opt} value={opt}>{opt}</option>
    ))}
  </select>
);

const ToggleSwitch = ({ defaultChecked, label }) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <input
      type="checkbox"
      defaultChecked={defaultChecked}
      className="w-5 h-5 rounded border-[var(--border)] text-[var(--apsis-orange)] focus:ring-[var(--apsis-orange)]/50"
    />
    <span className="text-sm text-[var(--text-primary)]">{label}</span>
  </label>
);

const SaveButton = () => (
  <button className="flex items-center gap-2 px-6 py-2.5 bg-[var(--apsis-orange)] text-white rounded-lg text-sm font-medium hover:bg-[var(--apsis-orange)]/90 transition-colors">
    <Save size={16} />
    Salvar Configurações
  </button>
);

const SuccessMessage = () => (
  <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
    <Check size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-sm font-medium text-green-900">Configurações salvas com sucesso</p>
      <p className="text-xs text-green-700 mt-0.5">Suas alterações foram aplicadas ao sistema</p>
    </div>
  </div>
);

const tabs = [
  { id: 'gerais', label: 'Gerais', icon: Settings },
  { id: 'portal', label: 'Portal do Cliente', icon: Globe },
  { id: 'comunicacao', label: 'Comunicação', icon: MessageSquare },
  { id: 'email', label: 'E-mail', icon: Mail },
  { id: 'sharepoint', label: 'SharePoint', icon: Share2 },
  { id: 'seguranca', label: 'Segurança', icon: Lock },
];

export default function NexusConfiguracoes() {
  const [activeTab, setActiveTab] = useState('gerais');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-b border-[var(--border)] px-6 py-4 -m-6 mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Configurações</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Centralize os parâmetros do APSIS Nexus e Portal do Cliente</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border)]">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-[var(--apsis-orange)] text-[var(--apsis-orange)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && <SuccessMessage />}

      {/* Content */}
      <div className="space-y-6 max-w-3xl">
        {/* ABA 1: Gerais */}
        {activeTab === 'gerais' && (
          <>
            <ConfigSection title="Identidade Visual" description="Configure a aparência do portal">
              <FormField label="Nome do Portal" required>
                <TextInput placeholder="APSIS Nexus" defaultValue="APSIS Nexus" />
              </FormField>

              <FormField label="Logo" description="Selecione uma imagem para o logo (máx. 2MB)">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-[var(--border)] rounded-lg flex items-center justify-center">
                    <Upload size={24} className="text-[var(--text-secondary)]" />
                  </div>
                  <button className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)]">
                    Escolher arquivo
                  </button>
                </div>
              </FormField>

              <FormField label="Cor Principal">
                <div className="flex items-center gap-3">
                  <input type="color" defaultValue="#F47920" className="w-12 h-10 rounded cursor-pointer" />
                  <TextInput placeholder="#F47920" defaultValue="#F47920" />
                </div>
              </FormField>
            </ConfigSection>

            <ConfigSection title="Localização" description="Configurações de idioma e fuso horário">
              <FormField label="Idioma">
                <SelectInput options={['Português (Brasil)', 'English', 'Español']} defaultValue="Português (Brasil)" />
              </FormField>

              <FormField label="Timezone">
                <SelectInput options={['America/Sao_Paulo', 'America/New_York', 'Europe/London']} defaultValue="America/Sao_Paulo" />
              </FormField>
            </ConfigSection>

            <SaveButton />
          </>
        )}

        {/* ABA 2: Portal do Cliente */}
        {activeTab === 'portal' && (
          <>
            <ConfigSection title="Ativação do Portal" description="Controle o acesso dos clientes">
              <ToggleSwitch defaultChecked={true} label="Habilitar Portal do Cliente" />
            </ConfigSection>

            <ConfigSection title="Aparência do Portal" description="Personalize a experiência do cliente">
              <FormField label="Link Customizado" description="Ex: cliente.apsis.com.br">
                <TextInput placeholder="portal.apsis.com.br" defaultValue="portal.apsis.com.br" />
              </FormField>

              <FormField label="Nome Exibido no Portal">
                <TextInput placeholder="Portal APSIS" defaultValue="Portal APSIS" />
              </FormField>

              <FormField label="Mensagem de Boas-vindas">
                <textarea
                  placeholder="Digite a mensagem de boas-vindas..."
                  defaultValue="Bem-vindo ao Portal APSIS. Acompanhe seus projetos e comunique-se com nossa equipe."
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--apsis-orange)]/50"
                  rows="3"
                />
              </FormField>
            </ConfigSection>

            <ConfigSection title="Módulos Visíveis" description="Escolha quais áreas aparecem para clientes">
              <ToggleSwitch defaultChecked={true} label="Projetos" />
              <ToggleSwitch defaultChecked={true} label="Comunicação" />
              <ToggleSwitch defaultChecked={true} label="Documentos" />
              <ToggleSwitch defaultChecked={false} label="Financeiro" />
            </ConfigSection>

            <ConfigSection title="Visibilidade por Cliente" description="Restrinja documentos por cliente">
              <ToggleSwitch defaultChecked={true} label="Mostrar apenas dados do cliente" />
            </ConfigSection>

            <SaveButton />
          </>
        )}

        {/* ABA 3: Comunicação */}
        {activeTab === 'comunicacao' && (
          <>
            <ConfigSection title="Chat e Mensagens" description="Configure a comunicação com clientes">
              <ToggleSwitch defaultChecked={true} label="Habilitar Chat com Cliente" />
              <ToggleSwitch defaultChecked={true} label="Habilitar Notas Internas" />
            </ConfigSection>

            <ConfigSection title="Arquivos" description="Limites e tipos de anexo permitidos">
              <FormField label="Anexos Permitidos" description="Extensões de arquivo separadas por vírgula">
                <TextInput placeholder="pdf, doc, docx, xlsx, zip" defaultValue="pdf, doc, docx, xlsx, zip, png, jpg" />
              </FormField>

              <FormField label="Tamanho Máximo de Arquivo (MB)">
                <TextInput placeholder="50" defaultValue="50" />
              </FormField>
            </ConfigSection>

            <ConfigSection title="Padrões de Serviço" description="Defina expectativas de resposta">
              <FormField label="SLA de Resposta (horas)">
                <SelectInput options={['1', '4', '8', '24', '48']} defaultValue="24" />
              </FormField>
            </ConfigSection>

            <SaveButton />
          </>
        )}

        {/* ABA 4: E-mail */}
        {activeTab === 'email' && (
          <>
            <ConfigSection title="Configuração de Remetente" description="Como os e-mails aparecerão para clientes">
              <FormField label="E-mail Remetente" required>
                <TextInput placeholder="contato@apsis.com.br" defaultValue="contato@apsis.com.br" />
              </FormField>

              <FormField label="Nome do Remetente" required>
                <TextInput placeholder="APSIS Consultoria" defaultValue="APSIS Consultoria" />
              </FormField>

              <FormField label="Reply-To (Responder para)">
                <TextInput placeholder="suporte@apsis.com.br" defaultValue="suporte@apsis.com.br" />
              </FormField>
            </ConfigSection>

            <ConfigSection title="Notificações" description="Configure cópias e notificações">
              <ToggleSwitch defaultChecked={true} label="Notificar por cada mensagem" />
              <ToggleSwitch defaultChecked={true} label="Cópia para Consultor Responsável" />
              <ToggleSwitch defaultChecked={false} label="Cópia para Gestor" />
            </ConfigSection>

            <ConfigSection title="Templates" description="Personalize e-mails enviados">
              <FormField label="Template de Assunto">
                <TextInput placeholder="[APSIS Nexus] {projeto} - {tipo}" defaultValue="[APSIS Nexus] {projeto} - Nova mensagem" />
              </FormField>

              <FormField label="Template de Corpo">
                <textarea
                  placeholder="Digite o corpo do e-mail..."
                  defaultValue="Olá {cliente},\n\nVocê recebeu uma nova mensagem no Portal APSIS.\n\nAcesse: {link}"
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--apsis-orange)]/50"
                  rows="4"
                />
              </FormField>
            </ConfigSection>

            <SaveButton />
          </>
        )}

        {/* ABA 5: SharePoint */}
        {activeTab === 'sharepoint' && (
          <>
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Integração com SharePoint</p>
                <p>Configure os dados de conexão para sincronizar documentos automaticamente com SharePoint.</p>
              </div>
            </div>

            <ConfigSection title="Credenciais de Conexão" description="Informações da conta SharePoint">
              <FormField label="Tenant URL" required description="Ex: https://seu-tenant.sharepoint.com">
                <TextInput placeholder="https://apsis.sharepoint.com" defaultValue="https://apsis.sharepoint.com" />
              </FormField>

              <FormField label="Site URL" required description="URL completa do site">
                <TextInput placeholder="https://apsis.sharepoint.com/sites/Nexus" defaultValue="https://apsis.sharepoint.com/sites/Nexus" />
              </FormField>

              <FormField label="Biblioteca Padrão" required description="Nome da biblioteca de documentos">
                <TextInput placeholder="Documentos" defaultValue="Documentos" />
              </FormField>

              <FormField label="Pasta Base">
                <TextInput placeholder="/Projetos" defaultValue="/Nexus/Projetos" />
              </FormField>

              <FormField label="Nome da Conexão">
                <TextInput placeholder="APSIS Nexus SharePoint" defaultValue="APSIS Nexus SharePoint" />
              </FormField>
            </ConfigSection>

            <ConfigSection title="Ações" description="Teste a conexão antes de salvar">
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)]">
                  🔗 Testar Conexão
                </button>
              </div>
            </ConfigSection>

            <SaveButton />
          </>
        )}

        {/* ABA 6: Segurança */}
        {activeTab === 'seguranca' && (
          <>
            <ConfigSection title="Política de Senha" description="Defina requisitos mínimos">
              <FormField label="Tamanho Mínimo">
                <SelectInput options={['8', '10', '12', '14', '16']} defaultValue="10" />
              </FormField>

              <ToggleSwitch defaultChecked={true} label="Exigir letras maiúsculas" />
              <ToggleSwitch defaultChecked={true} label="Exigir números" />
              <ToggleSwitch defaultChecked={true} label="Exigir caracteres especiais" />
            </ConfigSection>

            <ConfigSection title="Sessão" description="Controle de acesso e tempo de inatividade">
              <FormField label="Tempo de Sessão (minutos)">
                <SelectInput options={['30', '60', '120', '240']} defaultValue="120" />
              </FormField>

              <FormField label="Tentativas de Login Permitidas">
                <SelectInput options={['3', '5', '10']} defaultValue="5" />
              </FormField>
            </ConfigSection>

            <ConfigSection title="Recuperação de Acesso" description="Políticas de redefinição de senha">
              <ToggleSwitch defaultChecked={true} label="Permitir redefinição de senha por e-mail" />
              <ToggleSwitch defaultChecked={true} label="Exigir MFA (Autenticação de Dois Fatores)" />
            </ConfigSection>

            <ConfigSection title="Status de Usuários" description="Ative ou desative acesso de usuários">
              <ToggleSwitch defaultChecked={true} label="Permitir acesso ativo/inativo de usuários" />
            </ConfigSection>

            <SaveButton />
          </>
        )}
      </div>
    </div>
  );
}