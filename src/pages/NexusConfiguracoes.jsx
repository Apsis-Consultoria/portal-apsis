import { useState } from 'react';
import { Save, Settings, Globe, MessageSquare, Mail, Share2, Lock, Check, AlertCircle, Upload } from 'lucide-react';
import SharePointConfigPanel from '@/components/SharePointConfigPanel';

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

const TextInput = ({ placeholder, defaultValue, type = 'text' }) => (
  <input
    type={type}
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

const SuccessMessage = ({ message = 'Configurações salvas com sucesso' }) => (
  <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
    <Check size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-sm font-medium text-green-900">{message}</p>
      <p className="text-xs text-green-700 mt-0.5">Suas alterações foram aplicadas ao sistema</p>
    </div>
  </div>
);

const ErrorMessage = ({ message = 'Ocorreu um erro' }) => (
  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
    <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-sm font-medium text-red-900">{message}</p>
      <p className="text-xs text-red-700 mt-0.5">Verifique os dados e tente novamente</p>
    </div>
  </div>
);

const StatusCard = ({ status, lastTest }) => {
  const statusConfig = {
    configured: { color: 'bg-green-50 border-green-200', text: 'text-green-700', label: '✓ Configurado', icon: '✓' },
    partial: { color: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: '⚠ Parcialmente configurado', icon: '⚠' },
    unconfigured: { color: 'bg-gray-50 border-gray-200', text: 'text-gray-700', label: '○ Não configurado', icon: '○' },
    error: { color: 'bg-red-50 border-red-200', text: 'text-red-700', label: '✕ Erro na última tentativa', icon: '✕' }
  }[status] || { color: 'bg-gray-50 border-gray-200', text: 'text-gray-700', label: 'Desconhecido', icon: '?' };

  return (
    <div className={`p-4 rounded-lg border ${statusConfig.color}`}>
      <div className="flex items-start justify-between mb-2">
        <p className={`text-sm font-medium ${statusConfig.text}`}>{statusConfig.label}</p>
      </div>
      {lastTest && (
        <p className={`text-xs ${statusConfig.text.replace('700', '600')}`}>
          Último teste: {new Date(lastTest).toLocaleDateString('pt-BR')} às {new Date(lastTest).toLocaleTimeString('pt-BR')}
        </p>
      )}
    </div>
  );
};

const tabs = [
  { id: 'gerais', label: 'Gerais', icon: Settings },
  { id: 'portal', label: 'Portal do Cliente', icon: Globe },
  { id: 'comunicacao', label: 'Comunicação', icon: MessageSquare },
  { id: 'email', label: 'E-mail e Notificações', icon: Mail },
  { id: 'sharepoint', label: 'SharePoint', icon: Share2 },
  { id: 'seguranca', label: 'Segurança', icon: Lock },
];

export default function NexusConfiguracoes() {
  const [activeTab, setActiveTab] = useState('gerais');
  const [showSuccess, setShowSuccess] = useState(false);
  const [emailStatus, setEmailStatus] = useState('partial');

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

        {/* ABA 4: E-mail e Notificações */}
        {activeTab === 'email' && (
          <>
            <StatusCard status={emailStatus} lastTest="2026-03-19T14:30:00" />

            <ConfigSection title="Ativação" description="Controle central de notificações por e-mail">
              <ToggleSwitch defaultChecked={true} label="Habilitar envio de e-mails automáticos" />
            </ConfigSection>

            <ConfigSection title="Provedor de E-mail" description="Escolha o provedor para envio de e-mails">
              <FormField label="Provedor" required>
                <SelectInput 
                  options={['microsoft_365', 'smtp', 'aws_ses']} 
                  defaultValue="microsoft_365" 
                />
              </FormField>
              <p className="text-xs text-[var(--text-secondary)] mt-2 p-2 bg-blue-50 rounded border border-blue-100">
                <strong>Microsoft 365:</strong> Usa SSO Microsoft automaticamente (recomendado).<br/>
                <strong>SMTP:</strong> Configuração manual (Outlook, Gmail, etc).<br/>
                <strong>AWS SES:</strong> Para produção em larga escala.
              </p>
            </ConfigSection>

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

            <ConfigSection title="Cópias" description="Envie cópias para membros da equipe">
              <ToggleSwitch defaultChecked={true} label="Enviar cópia para Consultor Responsável" />
              <ToggleSwitch defaultChecked={false} label="Enviar cópia para Gestor" />
            </ConfigSection>

            <ConfigSection title="Notificações do Cliente" description="Escolha quais eventos geram e-mails para cliente">
              <ToggleSwitch defaultChecked={true} label="Notificar cliente em novas mensagens" />
              <ToggleSwitch defaultChecked={true} label="Notificar cliente quando documento é compartilhado" />
              <ToggleSwitch defaultChecked={true} label="Notificar cliente em novas solicitações" />
            </ConfigSection>

            <ConfigSection title="Templates Padrão" description="Personalize o conteúdo dos e-mails">
              <FormField label="Assunto Padrão" required description="Use variáveis: {tipo}, {cliente_nome}, {projeto_nome}">
                <TextInput placeholder="[APSIS Nexus] {projeto_nome} - {tipo}" defaultValue="[APSIS Nexus] {projeto_nome} - Nova notificação" />
              </FormField>

              <FormField label="Corpo Padrão" required description="Variáveis: {cliente_nome}, {projeto_nome}, {link}, {data}">
                <textarea
                  placeholder="Digite o corpo do e-mail..."
                  defaultValue="Olá {cliente_nome},\n\nVocê recebeu uma nova notificação no Portal APSIS.\n\nAcesse: {link}\n\nData: {data}"
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--apsis-orange)]/50"
                  rows="5"
                />
              </FormField>

              <FormField label="Assinatura Padrão" description="Aparecerá ao final de todos os e-mails">
                <textarea
                  placeholder="Digite a assinatura padrão..."
                  defaultValue="---\nAPSIS Consultoria\nwww.apsis.com.br\nTel: (11) 3000-0000"
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--apsis-orange)]/50"
                  rows="3"
                />
              </FormField>
            </ConfigSection>

            <ConfigSection title="Configuração SMTP" description="Preencha apenas se escolher SMTP como provedor">
              <FormField label="Host SMTP" description="Ex: smtp.gmail.com, smtp.outlook.com">
                <TextInput placeholder="smtp.outlook.com" defaultValue="" />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Porta SMTP">
                  <TextInput placeholder="587" defaultValue="587" />
                </FormField>
                <FormField label="Usuário SMTP">
                  <TextInput placeholder="seu-email@empresa.com" defaultValue="" />
                </FormField>
              </div>

              <FormField label="Senha SMTP" description="Será armazenada de forma segura">
                <TextInput placeholder="••••••••" defaultValue="" type="password" />
              </FormField>

              <ToggleSwitch defaultChecked={true} label="Usar TLS/STARTTLS" />
            </ConfigSection>

            <ConfigSection title="Configuração AWS SES" description="Preencha apenas se escolher AWS SES como provedor">
              <FormField label="Região AWS" description="Ex: us-east-1, sa-east-1">
                <TextInput placeholder="sa-east-1" defaultValue="" />
              </FormField>

              <FormField label="AWS Access Key" description="Será armazenada de forma segura">
                <TextInput placeholder="AKIA..." defaultValue="" />
              </FormField>

              <FormField label="AWS Secret Key" description="Será armazenada de forma segura">
                <TextInput placeholder="••••••••" defaultValue="" type="password" />
              </FormField>
            </ConfigSection>

            <ConfigSection title="Ações" description="Teste e salve sua configuração">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[var(--apsis-orange)] text-[var(--apsis-orange)] rounded-lg text-sm font-medium hover:bg-[var(--apsis-orange)]/5 transition-colors">
                  🔗 Testar Conexão
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-green-500 text-green-600 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors">
                  📧 E-mail de Teste
                </button>
                <button onClick={handleSave} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--apsis-orange)] text-white rounded-lg text-sm font-medium hover:bg-[var(--apsis-orange)]/90 transition-colors">
                  <Save size={14} />
                  Salvar
                </button>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-3 p-2 bg-blue-50 rounded border border-blue-100">
                💡 Teste a conexão antes de salvar para garantir que tudo está funcionando corretamente.
              </p>
            </ConfigSection>
          </>
        )}

        {/* ABA 5: SharePoint */}
        {activeTab === 'sharepoint' && (
          <SharePointConfigPanel />
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