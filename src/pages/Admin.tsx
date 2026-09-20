import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Home, Save, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const [prizes, setPrizes] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'prizes' | 'packages' | 'settings' | 'integrations' | 'users'>('prizes');
  const [newPassword, setNewPassword] = useState('');
  const [mpToken, setMpToken] = useState('');
  const [mpPublicKey, setMpPublicKey] = useState('');
  const [houseReserve, setHouseReserve] = useState(50000); // 500 reais default
  const [houseRtp, setHouseRtp] = useState(4); // 4% default
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [prizesRes, packagesRes, mpRes, rtpRes, usersRes] = await Promise.all([
      supabase.from('roulette_prizes').select('*').order('display_order', { ascending: true }),
      supabase.from('coin_packages').select('*').order('price_cents', { ascending: true }),
      supabase.from('game_settings').select('value').eq('id', 'MP_ACCESS_TOKEN').single(),
      supabase.from('game_settings').select('value').eq('id', 'HOUSE_EDGE_CONFIG').single(),
      supabase.from('profiles').select('*, wallets(balance_cents)').order('created_at', { ascending: false })
    ]);
      
    if (prizesRes.error) toast.error('Erro ao carregar prêmios');
    else setPrizes(prizesRes.data || []);

    if (packagesRes.error) toast.error('Erro ao carregar pacotes');
    else setPackages(packagesRes.data || []);

    if (mpRes.data && mpRes.data.value) {
      setMpToken(mpRes.data.value.token || '');
      setMpPublicKey(mpRes.data.value.publicKey || '');
    }

    if (rtpRes.data && rtpRes.data.value) {
      setHouseReserve(rtpRes.data.value.targetReserveCents || 50000);
      setHouseRtp(rtpRes.data.value.rtpPercent || 4);
    }

    if (usersRes.data) {
      setUsers(usersRes.data);
    }
    
    setIsLoading(false);
  };

  const handleUpdatePrize = async (index: number, field: string, value: any) => {
    const updatedPrizes = [...prizes];
    updatedPrizes[index][field] = value;
    setPrizes(updatedPrizes);
  };

  const handleUpdatePackage = async (index: number, field: string, value: any) => {
    const updatedPackages = [...packages];
    updatedPackages[index][field] = value;
    setPackages(updatedPackages);
  };

  const handleUpdateUser = (index: number, field: string, value: any) => {
    const updated = [...users];
    updated[index][field] = value;
    setUsers(updated);
  };

  const handleUpdateUserWallet = (index: number, balance_cents: number) => {
    const updated = [...users];
    if (updated[index].wallets && updated[index].wallets[0]) {
      updated[index].wallets[0].balance_cents = balance_cents;
    }
    setUsers(updated);
  };

  const saveUser = async (user: any) => {
    setIsLoading(true);
    // Tenta usar a nova função que inclui manipulação
    const { error } = await supabase.rpc('admin_update_user_full', {
      target_user_id: user.id,
      new_name: user.name,
      new_email: user.email,
      new_free_spins: user.free_spins,
      new_balance_cents: user.wallets[0]?.balance_cents || 0,
      new_forced_prize_id: user.forced_prize_id || null
    });
    
    if (error) {
      // Fallback para a função antiga se o usuário não rodou o script ainda
      const { error: oldError } = await supabase.rpc('admin_update_user', {
        target_user_id: user.id,
        new_free_spins: user.free_spins,
        new_balance_cents: user.wallets[0]?.balance_cents || 0
      });
      if (oldError) {
        toast.error('Erro ao salvar usuário. Execute o script admin_features.sql no Supabase.');
      } else {
        toast.success('Usuário salvo parcialmente (execute o script SQL para os novos campos).');
      }
    } else {
      toast.success('Usuário salvo com sucesso!');
    }
    setIsLoading(false);
  };

  const deleteUser = async (user: any) => {
    if (!window.confirm(`Tem certeza que deseja EXCLUIR o usuário ${user.name}? Isso não pode ser desfeito.`)) return;
    setIsLoading(true);
    const { error } = await supabase.rpc('admin_delete_user', {
      target_user_id: user.id
    });
    setIsLoading(false);
    
    if (error) {
      toast.error('Erro ao excluir. Verifique se executou o script admin_features.sql no Supabase.');
    } else {
      toast.success('Usuário excluído com sucesso!');
      setUsers(users.filter(u => u.id !== user.id));
    }
  };

  const saveChanges = async () => {
    setIsLoading(true);
    // Save Prizes
    for (const prize of prizes) {
      if (prize.id.startsWith('new-')) {
        const { error } = await supabase.from('roulette_prizes').insert({
          name: prize.name,
          amount_cents: prize.amount_cents,
          weight: prize.weight,
          color: prize.color || 'green',
          active: prize.active,
          display_order: prize.display_order
        });
        if (error) toast.error(`Erro ao criar prêmio: ${prize.name}`);
      } else {
        const { error } = await supabase
          .from('roulette_prizes')
          .update({
            name: prize.name,
            amount_cents: prize.amount_cents,
            weight: prize.weight,
            color: prize.color,
            active: prize.active,
            display_order: prize.display_order
          })
          .eq('id', prize.id);

        if (error) {
          toast.error(`Erro ao salvar prêmio: ${prize.name}`);
        }
      }
    }
    
    // Save Packages
    for (const pkg of packages) {
      if (pkg.id.startsWith('new-')) {
        const { error } = await supabase.from('coin_packages').insert({
          name: pkg.name,
          price_cents: pkg.price_cents,
          coin_amount: pkg.coin_amount,
          active: pkg.active
        });
        if (error) toast.error(`Erro ao criar pacote: ${pkg.name}`);
      } else {
        const { error } = await supabase.from('coin_packages').update({
          name: pkg.name,
          price_cents: pkg.price_cents,
          coin_amount: pkg.coin_amount,
          active: pkg.active
        }).eq('id', pkg.id);
        if (error) toast.error(`Erro ao salvar pacote: ${pkg.name}`);
      }
    }

    // Save MP Config
    if (mpToken !== undefined || mpPublicKey !== undefined) {
      const { error: mpError } = await supabase.from('game_settings').upsert({
        id: 'MP_ACCESS_TOKEN',
        value: { token: mpToken, publicKey: mpPublicKey }
      });
      if (mpError) toast.error('Erro ao salvar credenciais do Mercado Pago');
    }

    // Save House Edge Config
    const { error: rtpError } = await supabase.from('game_settings').upsert({
      id: 'HOUSE_EDGE_CONFIG',
      value: { targetReserveCents: houseReserve, rtpPercent: houseRtp }
    });
    if (rtpError) toast.error('Erro ao salvar configurações da Casa');
    
    toast.success('Todas as alterações salvas!');
    await fetchData();
  };

  const addNewPrize = () => {
    setPrizes([...prizes, {
      id: `new-${Date.now()}`,
      name: 'Novo Prêmio',
      amount_cents: 0,
      weight: 10,
      color: 'green',
      active: true,
      display_order: prizes.length + 1
    }]);
  };

  const handleDeletePrize = async (id: string) => {
    if (id.startsWith('new-')) {
      setPrizes(prizes.filter(p => p.id !== id));
      return;
    }
    if (window.confirm('Tem certeza que deseja excluir este prêmio? A roleta tem visual otimizado para 12 prêmios.')) {
      setIsLoading(true);
      const { error } = await supabase.from('roulette_prizes').delete().eq('id', id);
      setIsLoading(false);
      if (error) {
        toast.error('Erro ao excluir prêmio');
      } else {
        toast.success('Prêmio excluído!');
        setPrizes(prizes.filter(p => p.id !== id));
      }
    }
  };

  const addNewPackage = () => {
    setPackages([...packages, { 
      id: `new-${Date.now()}`, 
      name: 'Novo Pacote', 
      price_cents: 1000, 
      coin_amount: 10, 
      active: true 
    }]);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-green-900/20 p-6 rounded-2xl border border-green-500/30">
          <div>
            <h1 className="text-3xl font-black text-green-400">Painel Admin</h1>
            <p className="text-gray-400">Gerencie os prêmios e configurações da roleta</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors font-semibold">
              <Home size={18} /> Voltar ao Site
            </button>
            <button 
              onClick={saveChanges}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 text-black font-black rounded-full transition-colors disabled:opacity-50"
            >
              <Save size={18} /> {isLoading ? 'Salvando...' : 'Salvar Tudo'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          <button 
            onClick={() => setActiveTab('prizes')}
            className={`px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === 'prizes' ? 'bg-green-600 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            Prêmios da Roleta
          </button>
          <button 
            onClick={() => setActiveTab('packages')}
            className={`px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === 'packages' ? 'bg-green-600 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            Pacotes de Saldo
          </button>
          <button 
            onClick={() => setActiveTab('integrations')}
            className={`px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === 'integrations' ? 'bg-green-600 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            Mercado Pago
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-green-600 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            Usuários
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-green-600 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            Configurações e Segurança
          </button>
        </div>

        {/* Editor Area */}
        <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
          
          {activeTab === 'prizes' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  ⚙️ Prêmios da Roleta
                </h2>
                <button onClick={addNewPrize} className="flex items-center gap-2 px-4 py-2 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-full transition-colors font-semibold border border-green-500/30">
                  <Plus size={18} /> Novo Prêmio
                </button>
              </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-sm">
                  <th className="p-3 font-semibold">Ordem</th>
                  <th className="p-3 font-semibold">Nome (Ex: R$ 50)</th>
                  <th className="p-3 font-semibold">Valor em Reais (R$)</th>
                  <th className="p-3 font-semibold">Peso (Probabilidade)</th>
                  <th className="p-3 font-semibold">Cor</th>
                  <th className="p-3 font-semibold text-center">Ativo</th>
                  <th className="p-3 font-semibold text-center">Ação</th>
                </tr>
              </thead>
              <tbody>
                {prizes.map((prize, index) => (
                  <tr key={prize.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="p-3">
                      <input 
                        type="number" 
                        value={prize.display_order} 
                        onChange={(e) => handleUpdatePrize(index, 'display_order', parseInt(e.target.value))}
                        className="w-16 bg-black border border-gray-700 rounded p-2 text-center focus:border-green-500 outline-none"
                      />
                    </td>
                    <td className="p-3">
                      <input 
                        type="text" 
                        value={prize.name} 
                        onChange={(e) => handleUpdatePrize(index, 'name', e.target.value)}
                        className="w-full bg-black border border-gray-700 rounded p-2 focus:border-green-500 outline-none"
                      />
                    </td>
                    <td className="p-3">
                      <input 
                        type="number" 
                        step="0.01"
                        value={(prize.amount_cents / 100).toFixed(2)} 
                        onChange={(e) => handleUpdatePrize(index, 'amount_cents', Math.round(parseFloat(e.target.value || '0') * 100))}
                        className="w-32 bg-black border border-gray-700 rounded p-2 focus:border-green-500 outline-none"
                      />
                    </td>
                    <td className="p-3">
                      <input 
                        type="number" 
                        value={prize.weight} 
                        onChange={(e) => handleUpdatePrize(index, 'weight', parseInt(e.target.value))}
                        className="w-24 bg-black border border-gray-700 rounded p-2 focus:border-green-500 outline-none"
                      />
                    </td>
                    <td className="p-3">
                      <select 
                        value={prize.color || 'green'} 
                        onChange={(e) => handleUpdatePrize(index, 'color', e.target.value)}
                        className="bg-black border border-gray-700 rounded p-2 focus:border-green-500 outline-none text-sm"
                      >
                        <option value="green">Verde</option>
                        <option value="black">Preto</option>
                      </select>
                    </td>
                    <td className="p-3 text-center">
                      <input 
                        type="checkbox" 
                        checked={prize.active} 
                        onChange={(e) => handleUpdatePrize(index, 'active', e.target.checked)}
                        className="w-5 h-5 accent-green-500"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleDeletePrize(prize.id)} className="bg-red-900/40 hover:bg-red-900 text-red-400 px-3 py-1.5 rounded-full text-sm transition-colors border border-red-900/50 font-semibold">
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 text-sm text-gray-500 bg-black/30 p-4 rounded-lg border border-gray-800">
            <p><strong>Dica de Probabilidade (Peso):</strong> Quanto maior o peso, maior a chance de cair na roleta. Um prêmio com peso 100 tem 10x mais chances de cair do que um prêmio com peso 10.</p>
            <p className="mt-2"><strong>Aviso:</strong> O design da roleta funciona melhor com 12 prêmios ativos.</p>
          </div>
          </>
        )}

        {activeTab === 'packages' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                💰 Pacotes de Saldo (Mercado Pago)
              </h2>
              <button onClick={addNewPackage} className="flex items-center gap-2 px-4 py-2 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-full transition-colors font-semibold border border-green-500/30">
                <Plus size={18} /> Novo Pacote
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-sm">
                    <th className="p-3 font-semibold">Nome do Pacote</th>
                    <th className="p-3 font-semibold">Preço (R$)</th>
                    <th className="p-3 font-semibold">Moedas Recebidas</th>
                    <th className="p-3 font-semibold text-center">Ativo</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg, index) => (
                    <tr key={pkg.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="p-3">
                        <input 
                          type="text" 
                          value={pkg.name} 
                          onChange={(e) => handleUpdatePackage(index, 'name', e.target.value)}
                          className="w-full bg-black border border-gray-700 rounded p-2 focus:border-green-500 outline-none"
                          placeholder="Ex: 10 Moedas"
                        />
                      </td>
                      <td className="p-3">
                        <input 
                          type="number" 
                          step="0.01"
                          value={(pkg.price_cents / 100).toFixed(2)} 
                          onChange={(e) => handleUpdatePackage(index, 'price_cents', Math.round(parseFloat(e.target.value || '0') * 100))}
                          className="w-32 bg-black border border-gray-700 rounded p-2 focus:border-green-500 outline-none"
                        />
                      </td>
                      <td className="p-3">
                        <input 
                          type="number" 
                          value={pkg.coin_amount} 
                          onChange={(e) => handleUpdatePackage(index, 'coin_amount', parseInt(e.target.value))}
                          className="w-24 bg-black border border-gray-700 rounded p-2 focus:border-green-500 outline-none"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input 
                          type="checkbox" 
                          checked={pkg.active} 
                          onChange={(e) => handleUpdatePackage(index, 'active', e.target.checked)}
                          className="w-5 h-5 accent-green-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {packages.length === 0 && (
              <p className="text-gray-500 text-center py-8">Nenhum pacote criado. Clique em "Novo Pacote" acima.</p>
            )}
          </>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto py-8 space-y-12">
            
            {/* HOUSE EDGE SETTINGS */}
            <div className="bg-gray-900/80 p-6 rounded-xl border border-gray-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-green-400">
                🏦 Controle de Lucro da Casa (RTP)
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Reserva Mínima da Casa (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={(houseReserve / 100).toFixed(2)}
                    onChange={(e) => setHouseReserve(Math.round(parseFloat(e.target.value || '0') * 100))}
                    className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-green-500 outline-none transition-colors text-white"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    A roleta não vai liberar nenhum prêmio em dinheiro enquanto a casa não tiver atingido esse lucro (Total Arrecadado - Total Pago).
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Pagamento Máximo aos Jogadores (%)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={houseRtp}
                      onChange={(e) => setHouseRtp(parseInt(e.target.value))}
                      className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-green-500 outline-none transition-colors text-white"
                    />
                    <span className="absolute right-4 top-3 text-gray-500">%</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Após atingir a reserva mínima, a casa só libera prêmios até atingir esse percentual de todo o valor arrecadado (Recomendado: 4%).
                  </p>
                </div>
              </div>
            </div>

            {/* SECURITY SETTINGS */}
            <div className="bg-gray-900/80 p-6 rounded-xl border border-gray-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                🔒 Alterar Senha do Admin
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Nova Senha</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-green-500 outline-none transition-colors text-white"
                    placeholder="Digite a nova senha..."
                  />
                </div>
                <button 
                  onClick={async () => {
                    if (newPassword.length < 6) {
                      toast.error('A senha deve ter no mínimo 6 caracteres');
                      return;
                    }
                    setIsLoading(true);
                    const { error } = await supabase.auth.updateUser({ password: newPassword });
                    setIsLoading(false);
                    if (error) {
                      toast.error('Erro ao alterar senha: ' + error.message);
                    } else {
                      toast.success('Senha alterada com sucesso!');
                      setNewPassword('');
                    }
                  }}
                  disabled={isLoading || !newPassword}
                  className="w-full bg-green-600 hover:bg-green-500 text-black font-black py-3 rounded-full transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-500 text-center">
                Lembre-se da sua senha! Se esquecer, você precisará redefinir pelo painel do Supabase.
              </p>
            </div>
            
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="max-w-md mx-auto py-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              💳 Integração Mercado Pago
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Public Key (Chave Pública)</label>
                <input 
                  type="text" 
                  value={mpPublicKey}
                  onChange={(e) => setMpPublicKey(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-green-500 outline-none transition-colors text-white"
                  placeholder="APP_USR-..."
                />
                <p className="mt-2 text-xs text-gray-500">
                  Chave pública do Mercado Pago, normalmente usada para exibir o checkout transparente no site.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Access Token (Token de Acesso)</label>
                <input 
                  type="password" 
                  value={mpToken}
                  onChange={(e) => setMpToken(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-green-500 outline-none transition-colors text-white"
                  placeholder="APP_USR-..."
                />
                <p className="mt-2 text-xs text-gray-500">
                  O token de acesso do Mercado Pago (privado), usado para gerar as cobranças de Pix e validar pagamentos.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              👥 Gerenciar Usuários
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-sm">
                    <th className="p-3 font-semibold">Nome</th>
                    <th className="p-3 font-semibold">Email</th>
                    <th className="p-3 font-semibold">Moedas</th>
                    <th className="p-3 font-semibold">Saldo (R$)</th>
                    <th className="p-3 font-semibold">Prêmio Forçado</th>
                    <th className="p-3 font-semibold text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="p-3 text-sm">
                        <input 
                          type="text" 
                          value={user.name || ''} 
                          onChange={(e) => handleUpdateUser(index, 'name', e.target.value)}
                          className="w-full min-w-[120px] bg-black border border-gray-700 rounded p-2 focus:border-green-500 outline-none"
                        />
                      </td>
                      <td className="p-3 text-sm text-gray-400">
                        <input 
                          type="text" 
                          value={user.email || ''} 
                          onChange={(e) => handleUpdateUser(index, 'email', e.target.value)}
                          className="w-full min-w-[150px] bg-black border border-gray-700 rounded p-2 focus:border-green-500 outline-none"
                        />
                      </td>
                      <td className="p-3">
                        <input 
                          type="number" 
                          value={user.free_spins} 
                          onChange={(e) => handleUpdateUser(index, 'free_spins', parseInt(e.target.value))}
                          className="w-20 bg-black border border-gray-700 rounded p-2 focus:border-green-500 outline-none"
                        />
                      </td>
                      <td className="p-3">
                        <input 
                          type="number" 
                          step="0.01"
                          value={((user.wallets[0]?.balance_cents || 0) / 100).toFixed(2)} 
                          onChange={(e) => handleUpdateUserWallet(index, Math.round(parseFloat(e.target.value || '0') * 100))}
                          className="w-24 bg-black border border-gray-700 rounded p-2 focus:border-green-500 outline-none"
                        />
                      </td>
                      <td className="p-3">
                        <select 
                          value={user.forced_prize_id || ''} 
                          onChange={(e) => handleUpdateUser(index, 'forced_prize_id', e.target.value || null)}
                          className="w-full min-w-[120px] bg-black border border-gray-700 rounded p-2 focus:border-green-500 outline-none text-sm text-gray-300"
                        >
                          <option value="">Nenhum (Aleatório)</option>
                          {prizes.filter(p => p.active).map(prize => (
                            <option key={prize.id} value={prize.id}>{prize.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 text-center flex flex-col gap-2 min-w-[100px]">
                        <button onClick={() => saveUser(user)} className="bg-green-600 hover:bg-green-500 text-black px-3 py-1.5 rounded font-bold text-xs transition-colors w-full">
                          Salvar
                        </button>
                        <button onClick={() => deleteUser(user)} className="bg-red-900/40 hover:bg-red-900 text-red-400 px-3 py-1.5 rounded text-xs transition-colors border border-red-900/50 font-semibold w-full">
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        </div>

      </div>
    </div>
  );
}
