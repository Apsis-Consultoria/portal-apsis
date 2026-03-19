import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Edit2, Eye, AlertCircle } from 'lucide-react';

export default function UsuariosAcessoTab() {
  const [usuarios, setUsuarios] = useState([]);
  const [perfis, setPerfis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedPerfil, setSelectedPerfil] = useState('');
  const [showPermissoes, setShowPermissoes] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usuariosRes, perfisRes] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Perfil.list()
      ]);
      setUsuarios(usuariosRes);
      setPerfis(perfisRes);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePerfil = async (usuarioId) => {
    if (!selectedPerfil) return;

    try {
      const usuario = usuarios.find(u => u.id === usuarioId);
      await base44.auth.updateMe({
        perfil_id: selectedPerfil,
        ...usuario
      });

      // Registrar auditoria
      await base44.entities.AuditoriaAcesso.create({
        usuario_email: usuario.email,
        acao: 'atribuicao_perfil',
        recurso_tipo: 'usuario',
        recurso_id: usuarioId,
        recurso_nome: usuario.full_name,
        detalhes: { novo_perfil_id: selectedPerfil }
      });

      setEditingUserId(null);
      loadData();
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
    }
  };

  const getPerfilUsuario = (usuario) => {
    return perfis.find(p => p.id === usuario.perfil_id);
  };

  const getPermissoesDoUsuario = (usuario) => {
    const perfil = getPerfilUsuario(usuario);
    if (!perfil) return [];
    return perfil.permissoes || [];
  };

  if (isLoading) {
    return <div className="text-center py-8 text-[var(--text-secondary)]">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">Controle de Acesso por Usuário</h2>
        <p className="text-sm text-[var(--text-secondary)]">Atribua perfis aos usuários para definir suas permissões</p>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-primary)]">Usuário</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-primary)]">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-primary)]">Perfil Atual</th>
                <th className="px-4 py-3 text-left font-semibold text-[var(--text-primary)]">Status</th>
                <th className="px-4 py-3 text-center font-semibold text-[var(--text-primary)]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(usuario => {
                const perfil = getPerfilUsuario(usuario);
                const isEditing = editingUserId === usuario.id;

                return (
                  <tr key={usuario.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--text-primary)]">{usuario.full_name}</p>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{usuario.email}</td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          value={selectedPerfil}
                          onChange={(e) => setSelectedPerfil(e.target.value)}
                          className="px-2 py-1 border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[var(--apsis-orange)]"
                        >
                          <option value="">Selecionar perfil...</option>
                          {perfis.filter(p => p.status === 'ativo').map(p => (
                            <option key={p.id} value={p.id}>{p.nome}</option>
                          ))}
                        </select>
                      ) : (
                        <div>
                          {perfil ? (
                            <>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${perfil.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {perfil.nome}
                              </span>
                              {!perfil.status || perfil.status === 'inativo' && (
                                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                  <AlertCircle size={12} />
                                  Perfil inativo
                                </p>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle size={12} />
                              Sem perfil
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${usuario.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {usuario.role || 'Usuário'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSavePerfil(usuario.id)}
                              className="text-xs h-7"
                            >
                              Salvar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingUserId(null)}
                              className="text-xs h-7"
                            >
                              Cancelar
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingUserId(usuario.id);
                                setSelectedPerfil(perfil?.id || '');
                              }}
                              className="gap-1 text-xs h-7"
                            >
                              <Edit2 size={12} />
                              Alterar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowPermissoes(showPermissoes === usuario.id ? null : usuario.id)}
                              className="gap-1 text-xs h-7"
                            >
                              <Eye size={12} />
                              Ver
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expandable: Ver Permissões */}
      {showPermissoes && (
        <div className="border border-[var(--border)] rounded-lg p-4 bg-[var(--surface-2)]">
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            Permissões de {usuarios.find(u => u.id === showPermissoes)?.full_name}
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {getPermissoesDoUsuario(usuarios.find(u => u.id === showPermissoes) || {}).map(permId => {
              const perfil = getPerfilUsuario(usuarios.find(u => u.id === showPermissoes));
              const perm = perfil?.permissoes?.find(p => p === permId);
              return (
                <div key={permId} className="text-xs text-[var(--text-primary)] px-2 py-1 bg-white rounded border border-[var(--border)]">
                  ✓ {permId}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}