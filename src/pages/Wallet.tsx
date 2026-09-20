import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Home, LogOut, Loader2, Coins } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function Wallet() {
  const { wallet, session, signOut } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    const { data } = await supabase.from('coin_packages').select('*').eq('active', true).order('price_cents', { ascending: true });
    if (data) {
      setPackages(data);
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleBuy = async (packageId: string) => {
    setIsProcessing(packageId);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ packageId })
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // Estamos rodando no Vite puro, sem o backend Vercel. 
        // Vamos simular a compra e adicionar moedas direto para o usuário poder testar.
        toast.success("Modo Teste: Como o backend não está ativo, adicionamos as moedas grátis para você testar!");
        
        const pkg = packages.find(p => p.id === packageId);
        if (pkg) {
          const { data: purchaseData } = await supabase.from('purchases').insert({
            user_id: session?.user.id,
            package_id: packageId,
            amount_cents: pkg.price_cents,
            status: 'pending'
          }).select('id').single();

          if (purchaseData) {
            await supabase.rpc('credit_purchase', {
              purchase_uuid: purchaseData.id,
              mp_payment_id: 'LOCAL_TEST_' + Date.now()
            });
          }
        }
        setIsProcessing(null);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar pagamento');
      }

      if (data.init_point) {
        window.location.href = data.init_point;
      }
    } catch (err: any) {
      toast.error(err.message);
      setIsProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-green-600 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse"></div>
      </div>
      
      {/* Navbar */}
      <nav className="w-full bg-black/80 border-b border-green-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Logo" className="h-12 w-auto object-contain drop-shadow-[0_0_10px_rgba(34,197,94,0.2)]" />
              <div className="hidden md:block">
                <div className="flex items-baseline space-x-4">
                  <button onClick={() => navigate('/jogar')} className="text-gray-300 hover:text-green-400 hover:bg-green-900/30 px-3 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
                    <Home size={18} /> Voltar para o Jogo
                  </button>
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 p-2 rounded-full transition-colors" title="Sair">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 w-full max-w-4xl p-4 sm:p-8 relative z-10 flex flex-col items-center justify-center">
        <div className="bg-black/60 border border-green-500/30 rounded-2xl p-8 w-full max-w-md backdrop-blur-sm text-center shadow-[0_0_30px_rgba(34,197,94,0.1)]">
          <h1 className="text-3xl font-black text-green-400 mb-2">Sua Carteira</h1>
          <p className="text-gray-400 mb-8">Escolha um pacote de saldo para continuar jogando.</p>
          
          <div className="bg-green-900/20 border border-green-500/20 rounded-xl p-6 mb-8">
            <span className="text-sm uppercase tracking-widest text-gray-500 font-bold block mb-2">Saldo Atual</span>
            <span className="text-4xl font-black text-white">R$ {((wallet?.balance_cents || 0) / 100).toFixed(2)}</span>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="animate-spin text-green-500" size={32} />
              </div>
            ) : packages.length > 0 ? (
              packages.map((pkg) => (
                <button 
                  key={pkg.id}
                  onClick={() => handleBuy(pkg.id)}
                  disabled={isProcessing !== null}
                  className="w-full flex items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800 hover:from-green-900 hover:to-gray-800 border border-gray-700 hover:border-green-500 px-6 py-4 rounded-full transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500/20 p-2 rounded-lg text-green-400">
                      <Coins size={24} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-lg text-white group-hover:text-green-400 transition-colors">{pkg.name}</div>
                      <div className="text-xs text-gray-400">Receba {pkg.coin_amount} moedas</div>
                    </div>
                  </div>
                  <div className="text-xl font-black text-white">
                    R$ {(pkg.price_cents / 100).toFixed(2)}
                  </div>
                </button>
              ))
            ) : (
              <div className="text-gray-500 bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                Nenhum pacote de moedas disponível no momento.
              </div>
            )}
            
            {isProcessing && (
              <p className="text-green-400 text-sm animate-pulse mt-4">Gerando PIX no Mercado Pago...</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
