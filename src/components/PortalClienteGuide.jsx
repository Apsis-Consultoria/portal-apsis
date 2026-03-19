import { useState } from 'react';
import { ChevronDown, Eye, Lock, MessageSquare, FileText, CheckCircle, Shield, Info } from 'lucide-react';

export default function PortalClienteGuide() {
  const [expandedSection, setExpandedSection] = useState(0);
  const [showFullGuide, setShowFullGuide] = useState(false);

  const sections = [
    {
      title: 'Visão Geral',
      icon: Info,
      color: 'bg-blue-100 text-blue-700',
      content: (
        <div className="space-y-3 text-sm text-[var(--text-secondary)]">
          <p>
            O Portal do Cliente é um ambiente seguro e controlado para interação entre a APSIS e seus clientes. 
            Oferece acesso centralizado a documentos, mensagens e projetos com total segregação de dados.
          </p>
          <ul className="space-y-2 ml-4">
            <li>✓ Cada cliente acessa apenas seu próprio workspace</li>
            <li>✓ Dados são isolados por empresa</li>
            <li>✓ Comunicação e documentação centralizadas</li>
            <li>✓ Rastreabilidade completa de acessos</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Acesso Seguro',
      icon: Lock,
      color: 'bg-green-100 text-green-700',
      content: (
        <div className="space-y-3 text-sm text-[var(--text-secondary)]">
          <p className="font-medium text-[var(--text-primary)]">O portal utiliza segurança em múltiplas camadas:</p>
          <ul className="space-y-2 ml-4">
            <li><strong>Login e Senha:</strong> Autenticação obrigatória e protegida</li>
            <li><strong>Sessão Protegida:</strong> Acesso controlado com timeout automático</li>
            <li><strong>Isolamento por Cliente:</strong> Cada usuário vê apenas seu workspace</li>
            <li><strong>Bloqueio de Tentativas:</strong> Múltiplas falhas resultam em bloqueio temporário</li>
            <li><strong>HTTPS:</strong> Criptografia de dados em trânsito</li>
          </ul>
          <p className="text-xs bg-green-50 border border-green-200 rounded p-2 mt-3">
            💡 <strong>Dica:</strong> Sempre compartilhe o link do portal com o cliente e instrua-o a guardar suas credenciais.
          </p>
        </div>
      ),
    },
    {
      title: 'Controle de Visibilidade',
      icon: Eye,
      color: 'bg-amber-100 text-amber-700',
      content: (
        <div className="space-y-3 text-sm text-[var(--text-secondary)]">
          <p className="font-medium text-[var(--text-primary)]">Documentos e mensagens possuem controle granular:</p>
          <div className="space-y-3 mt-3">
            <div className="bg-[var(--surface-2)] rounded p-3 border border-[var(--border)]">
              <p className="font-medium text-[var(--text-primary)] text-xs mb-1">🔒 Interno</p>
              <p className="text-xs">Visível apenas para a equipe APSIS. Não aparece para o cliente.</p>
            </div>
            <div className="bg-[var(--surface-2)] rounded p-3 border border-[var(--border)]">
              <p className="font-medium text-[var(--text-primary)] text-xs mb-1">🔓 Compartilhado</p>
              <p className="text-xs">Visível para o cliente. Deve ser revisado antes de compartilhar.</p>
            </div>
          </div>
          <p className="text-xs mt-3 bg-amber-50 border border-amber-200 rounded p-2">
            ⚠️ <strong>Importante:</strong> Revise sempre a visibilidade antes de salvar documentos ou mensagens.
          </p>
        </div>
      ),
    },
    {
      title: 'Comunicação com o Cliente',
      icon: MessageSquare,
      color: 'bg-purple-100 text-purple-700',
      content: (
        <div className="space-y-3 text-sm text-[var(--text-secondary)]">
          <p>
            O chat é o centro de comunicação entre APSIS e cliente. Todas as mensagens são rastreadas e organizadas por conversa.
          </p>
          <ul className="space-y-2 ml-4">
            <li><strong>Mensagens Internas:</strong> Discussões da equipe APSIS que o cliente não verá</li>
            <li><strong>Mensagens Compartilhadas:</strong> Comunicação direta com o cliente</li>
            <li><strong>Histórico Completo:</strong> Mantém registro de toda interação</li>
            <li><strong>Anexos:</strong> Documentos podem ser enviados junto com mensagens</li>
          </ul>
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3 text-xs">
            <strong>Dica de Ouro:</strong> Use mensagens internas para discussões sensíveis e compartilhe apenas o resumo ou conclusão com o cliente.
          </div>
        </div>
      ),
    },
    {
      title: 'Documentos e Anexos',
      icon: FileText,
      color: 'bg-orange-100 text-orange-700',
      content: (
        <div className="space-y-3 text-sm text-[var(--text-secondary)]">
          <p className="font-medium text-[var(--text-primary)]">Gerenciamento seguro de arquivos:</p>
          <ul className="space-y-2 ml-4">
            <li><strong>Armazenamento Seguro:</strong> Arquivos armazenados com backup e redundância</li>
            <li><strong>Integração SharePoint:</strong> Quando habilitado, oferece versionamento automático</li>
            <li><strong>Permissões por Documento:</strong> Cada arquivo tem controle de visibilidade próprio</li>
            <li><strong>Sem Exposição de Estrutura:</strong> Cliente não vê pastas/estrutura interna</li>
            <li><strong>Download Rastreado:</strong> Todo download é registrado em log</li>
          </ul>
          <div className="bg-orange-50 border border-orange-200 rounded p-3 mt-3 text-xs">
            <strong>Segurança:</strong> Classifique corretamente documentos sensíveis (financeiros, jurídicos) como internos antes de salvar.
          </div>
        </div>
      ),
    },
    {
      title: 'Boas Práticas',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-700',
      content: (
        <div className="space-y-3 text-sm text-[var(--text-secondary)]">
          <p className="font-medium text-[var(--text-primary)]">Recomendações operacionais:</p>
          <ul className="space-y-2 ml-4">
            <li>✓ <strong>Revise antes de compartilhar:</strong> Sempre verifique visibilidade de documentos</li>
            <li>✓ <strong>Classifique corretamente:</strong> Use tags e status para organizar conteúdo</li>
            <li>✓ <strong>Evite informações sensíveis sem validação:</strong> Dados financeiros ou jurídicos devem ser revisados</li>
            <li>✓ <strong>Comunique claramente:</strong> Registre todas as decisões e acordos no chat</li>
            <li>✓ <strong>Use mensagens internas:</strong> Para discussões da equipe que não afetam o cliente</li>
            <li>✓ <strong>Mantenha organização:</strong> Nomeie documentos de forma clara e consistente</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Segurança e Governança',
      icon: Shield,
      color: 'bg-red-100 text-red-700',
      content: (
        <div className="space-y-3 text-sm text-[var(--text-secondary)]">
          <p className="font-medium text-[var(--text-primary)]">Padrões corporativos de segurança:</p>
          <ul className="space-y-2 ml-4">
            <li><strong>Auditoria Completa:</strong> Todas as ações são registradas (acesso, download, modificação)</li>
            <li><strong>Controle por Perfil:</strong> Permissões baseadas em role de usuário</li>
            <li><strong>Segregação de Dados:</strong> Dados de um cliente nunca são acessíveis a outro</li>
            <li><strong>Conformidade:</strong> Sistema segue padrões LGPD e ISO 27001</li>
            <li><strong>Backup Automático:</strong> Dados são replicados para recuperação</li>
            <li><strong>Monitoramento:</strong> Atividades suspeitas geram alertas automáticos</li>
          </ul>
          <div className="bg-red-50 border border-red-200 rounded p-3 mt-3 text-xs">
            <strong>Protocolo:</strong> Reportar qualquer atividade suspeita ao time de segurança imediatamente.
          </div>
        </div>
      ),
    },
  ];

  const SectionItem = ({ section, index, isExpanded }) => {
    const Icon = section.icon;
    return (
      <div className="border border-[var(--border)] rounded-lg overflow-hidden transition-all hover:border-[var(--apsis-orange)]/50">
        <button
          onClick={() => setExpandedSection(isExpanded ? -1 : index)}
          className="w-full px-4 py-4 flex items-center gap-3 hover:bg-[var(--surface-2)] transition-colors text-left"
        >
          <div className={`w-8 h-8 rounded-lg ${section.color} flex items-center justify-center flex-shrink-0`}>
            <Icon size={16} />
          </div>
          <span className="flex-1 font-semibold text-[var(--text-primary)]">{section.title}</span>
          <ChevronDown
            size={18}
            className={`text-[var(--text-secondary)] transition-transform flex-shrink-0 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
        {isExpanded && (
          <div className="border-t border-[var(--border)] bg-white px-4 py-4">
            {section.content}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Guia do Portal do Cliente</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Manual operacional e de segurança</p>
        </div>
        {!showFullGuide && (
          <button
            onClick={() => setShowFullGuide(true)}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
          >
            Expandir Tudo
          </button>
        )}
        {showFullGuide && (
          <button
            onClick={() => {
              setShowFullGuide(false);
              setExpandedSection(-1);
            }}
            className="px-4 py-2 bg-gray-100 text-[var(--text-secondary)] rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Recolher Tudo
          </button>
        )}
      </div>

      <div className="space-y-3">
        {sections.map((section, index) => (
          <SectionItem
            key={index}
            section={section}
            index={index}
            isExpanded={showFullGuide || expandedSection === index}
          />
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <p className="text-xs text-blue-900">
          <strong>📚 Consulte este guia regularmente</strong> para manter boas práticas ao operar o Portal do Cliente. 
          Em caso de dúvidas, consulte o time de suporte ou compliance.
        </p>
      </div>
    </div>
  );
}