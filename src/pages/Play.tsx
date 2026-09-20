import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Roulette } from '../components/Roulette';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Home, Wallet, LogOut } from 'lucide-react';
import confetti from 'canvas-confetti';

// Default prizes just in case DB doesn't load them immediately
const DEFAULT_PRIZES = [
  { id: '1', name: 'R$ 50', amount_cents: 5000, color: 'green' },
  { id: '2', name: 'R$ 100', amount_cents: 10000, color: 'black' },
  { id: '3', name: 'R$ 200', amount_cents: 20000, color: 'green' },
  { id: '4', name: 'R$ 500', amount_cents: 50000, color: 'black' },
  { id: '5', name: 'R$ 20', amount_cents: 2000, color: 'green' },
  { id: '6', name: 'R$ 30', amount_cents: 3000, color: 'black' },
  { id: '7', name: 'R$ 10', amount_cents: 1000, color: 'green' },
  { id: '8', name: 'R$ 250', amount_cents: 25000, color: 'black' },
  { id: '9', name: 'R$ 150', amount_cents: 15000, color: 'green' },
  { id: '10', name: 'R$ 150', amount_cents: 15000, color: 'black' },
  { id: '11', name: 'R$ 75', amount_cents: 7500, color: 'green' },
  { id: '12', name: 'R$ 300', amount_cents: 30000, color: 'black' },
];

export default function Play() {
  const { profile, wallet, session, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [prizes, setPrizes] = useState<any[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState<number | null>(null);
  const [wonPrize, setWonPrize] = useState<any>(null);

  useEffect(() => {
    // Load prizes
    const fetchPrizes = async () => {
      try {
        const { data } = await supabase.from('roulette_prizes').select('*').eq('active', true).order('display_order', { ascending: true });
        if (data && data.length > 0) {
          setPrizes(data);
        } else {
          setPrizes(DEFAULT_PRIZES);
        }
      } catch (e) {
        setPrizes(DEFAULT_PRIZES);
      }
    };
    fetchPrizes();
  }, []);

  const handleSpinClick = async () => {
    if (isSpinning) return;
    if (!profile || !wallet) return;

    if ((profile?.free_spins || 0) <= 0) {
      toast.error('Você não tem moedas! Compre pacotes na carteira.');
      navigate('/carteira');
      return;
    }

    setIsSpinning(true);
    setWonPrize(null);

    try {
      // 1. Call debit RPC
      const { data: debitResult, error: debitError } = await supabase.rpc('debit_spin', {
        p_user_id: session?.user?.id
      });

      if (debitError) {
        console.error("Erro Supabase RPC:", debitError);
        throw new Error(`Erro do servidor: ${debitError.message}`);
      }

      // 1. Verificar se a casa autoriza prêmios em dinheiro (RTP e Lucro)
      let maxAllowedPrizeCents = 99999999;
      const { data: maxPrizeData, error: rpcError } = await supabase.rpc('get_max_allowed_prize');
      if (!rpcError && maxPrizeData !== null) {
        maxAllowedPrizeCents = maxPrizeData;
      }

      // 2. Filtrar os prêmios disponíveis com base no teto da casa
      const availablePrizes = displayPrizes.filter(p => p.amount_cents <= maxAllowedPrizeCents);
      
      let finalPrizesToPickFrom = availablePrizes;
      if (finalPrizesToPickFrom.length === 0) {
        // Se a casa está pobre (reserva não atingida), força prêmio de valor ZERO (ex: Não foi dessa vez)
        finalPrizesToPickFrom = displayPrizes.filter(p => p.amount_cents === 0);
      }
      
      if (finalPrizesToPickFrom.length === 0) {
        // Se o admin não cadastrou nenhum prêmio 0, pega o menor possível para evitar erro
        const lowestPrize = [...displayPrizes].sort((a,b) => a.amount_cents - b.amount_cents)[0];
        finalPrizesToPickFrom = [lowestPrize];
      }

      // 3. Sortear o prêmio dentre os permitidos
      let selectedPrize = finalPrizesToPickFrom[0];
      
      if ((profile as any)?.forced_prize_id) {
        const forcedPrize = displayPrizes.find(p => p.id === (profile as any).forced_prize_id);
        if (forcedPrize) {
          selectedPrize = forcedPrize;
          // Limpa a manipulação para o próximo giro ser normal
          if (session?.user?.id) {
            await supabase.from('profiles').update({ forced_prize_id: null }).eq('id', session.user.id);
          }
        } else {
          const totalWeight = finalPrizesToPickFrom.reduce((sum, p) => sum + p.weight, 0);
          let randomValue = Math.floor(Math.random() * totalWeight);
          let currentWeight = 0;
          for (const prize of finalPrizesToPickFrom) {
            currentWeight += prize.weight;
            if (randomValue < currentWeight) {
              selectedPrize = prize;
              break;
            }
          }
        }
      } else {
        const totalWeight = finalPrizesToPickFrom.reduce((sum, p) => sum + p.weight, 0);
        let randomValue = Math.floor(Math.random() * totalWeight);
        let currentWeight = 0;
        for (const prize of finalPrizesToPickFrom) {
          currentWeight += prize.weight;
          if (randomValue < currentWeight) {
            selectedPrize = prize;
            break;
          }
        }
      }

      // 3. Record Round
      if (!session?.user?.id) throw new Error("Usuário não autenticado");
      
      const { data: roundData, error: roundError } = await supabase
        .from('roulette_rounds')
        .insert({
          user_id: session.user.id,
          prize_id: selectedPrize.id,
          cost_cents: debitResult.cost_cents,
          result_amount_cents: selectedPrize.amount_cents,
          is_free_spin: debitResult.is_free_spin,
          status: 'completed'
        })
        .select('id')
        .single();

      if (roundError) {
        console.error("Erro Supabase Round:", roundError);
        throw new Error(`Erro ao registrar rodada: ${roundError.message}`);
      }

      // 4. Credit Prize
      if (selectedPrize.amount_cents > 0) {
        const { error: creditError } = await supabase.rpc('credit_prize', {
          prize_amount_cents: selectedPrize.amount_cents,
          user_uuid: session?.user?.id,
          round_uuid: roundData.id
        });
        
        if (creditError) {
          throw new Error('Erro ao creditar prêmio');
        }
      }

      const targetPrizeIndex = displayPrizes.findIndex(p => p.id === selectedPrize.id);
      const finalIndex = targetPrizeIndex !== -1 ? targetPrizeIndex : Math.floor(Math.random() * displayPrizes.length);

      setWonPrize(selectedPrize);
      setPrizeIndex(finalIndex);

    } catch (err: any) {
      toast.error(err.message);
      setIsSpinning(false);
    }
  };

  const handleSpinEnd = async () => {
    setIsSpinning(false);
    if (wonPrize && profile) {
      toast.success(`Parabéns! Você ganhou ${wonPrize.name}!`);
      
      // Voice narration
      const userName = profile.name ? profile.name.split(' ')[0] : 'Jogador';
      let message = '';
      
      if (wonPrize.amount_cents > 0) {
        const valorEmReais = wonPrize.amount_cents / 100;
        message = `Parabéns ${userName}, você ganhou ${valorEmReais} reais!`;
        
        // Efeito de confetes saindo da roleta
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6, x: 0.5 },
          colors: ['#22c55e', '#ffffff', '#eab308'],
          zIndex: 0 // Atrás da roleta
        });
        
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 120,
            origin: { y: 0.6, x: 0.5 },
            colors: ['#15803d', '#4ade80', '#fbbf24'],
            zIndex: 100 // Na frente da roleta
          });
        }, 300);

        // Som da multidão gritando "Eeeee!"
        try {
          const audio = new Audio('https://actions.google.com/sounds/v1/crowds/crowd_cheering.ogg');
          audio.volume = 0.6;
          audio.play();
        } catch(e) {}
        
      } else {
        message = `Que pena ${userName}, você não ganhou dessa vez.`;
      }

      // Check if browser supports speech synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // <--- Limpa a fila para garantir que fale sempre
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    }
    // Refresh balance and profile
    await refreshProfile();
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Fallback to default if empty so it always renders
  const displayPrizes = prizes.length > 0 ? prizes : DEFAULT_PRIZES;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center relative overflow-hidden">
      {/* Decorative Casino Background Elements (Green and Black) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-green-600 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-emerald-900 rounded-full mix-blend-screen filter blur-[128px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation Menu */}
      <nav className="w-full bg-black/80 border-b border-green-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Logo" className="h-12 w-auto object-contain drop-shadow-[0_0_10px_rgba(34,197,94,0.2)]" />
              <div className="hidden md:block">
                <div className="flex items-baseline space-x-4">
                  <button onClick={() => navigate('/')} className="text-gray-300 hover:text-green-400 hover:bg-green-900/30 px-3 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
                    <Home size={18} /> Início
                  </button>
                  <button onClick={() => navigate('/jogar')} className="bg-green-900/40 text-green-400 px-3 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-green-500/30">
                    🎰 Jogar
                  </button>
                  <button onClick={() => navigate('/carteira')} className="text-gray-300 hover:text-green-400 hover:bg-green-900/30 px-3 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
                    <Wallet size={18} /> Carteira
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-0.5">Saldo</span>
                <div className="bg-green-900/30 px-3 py-1 rounded border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                  <span className="text-lg font-black text-green-400">R$ {((wallet?.balance_cents || 0) / 100).toFixed(2)}</span>
                </div>
              </div>
              <button 
                onClick={handleLogout} 
                className="text-gray-400 hover:text-red-400 p-2 rounded-full transition-colors"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center w-full relative z-10 p-2 sm:p-4">
        
        {(profile?.free_spins || 0) > 0 ? (
          <div className="mb-6 text-center animate-bounce">
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-black px-8 py-2.5 rounded-full text-sm font-black shadow-[0_0_30px_rgba(234,179,8,0.4)] border-2 border-yellow-200 tracking-wide uppercase">
              🪙 {profile?.free_spins} Moedas (Giros)
            </div>
          </div>
        ) : (
          <div className="mb-6 text-center bg-black/60 px-8 py-2.5 rounded-full border border-red-900/50 backdrop-blur-md shadow-lg">
            <span className="text-red-400 text-sm font-black tracking-wide">Você não tem moedas! Compre pacotes na carteira.</span>
          </div>
        )}

        <div className="mb-8 mt-2 relative scale-90 sm:scale-100">
          {/* Sparkles behind roulette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-500/20 via-transparent to-transparent blur-3xl scale-150"></div>
          
          <Roulette 
            isSpinning={isSpinning}
            prizeIndex={prizeIndex}
            numSegments={displayPrizes.length}
            onSpinEnd={handleSpinEnd}
            prizes={displayPrizes}
          />
        </div>

        <button 
          onClick={handleSpinClick}
          disabled={isSpinning}
          className="group relative inline-flex items-center justify-center px-12 py-4 text-2xl font-black text-black transition-all duration-200 bg-gradient-to-b from-green-400 via-green-500 to-green-700 rounded-full focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-offset-black focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] border-b-[6px] border-green-900 active:border-b-0 active:mt-[6px]"
          style={{ textShadow: '0 1px 2px rgba(255,255,255,0.3)' }}
        >
          <span className="absolute inset-0 w-full h-full -mt-1 rounded-full opacity-20 bg-gradient-to-b from-transparent via-transparent to-black"></span>
          <span className="relative drop-shadow-sm tracking-wider">GIRAR AGORA</span>
          {/* Animated glow border */}
          <div className="absolute inset-0 rounded-full ring-4 ring-green-400 ring-opacity-100 group-hover:animate-ping opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 blur opacity-40 group-hover:opacity-70 transition duration-200"></div>
        </button>

      </main>
    </div>
  );
}
