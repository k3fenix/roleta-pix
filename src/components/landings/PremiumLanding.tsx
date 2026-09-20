import { useNavigate } from 'react-router-dom';

export default function PremiumLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-green-500/30">
      <header className="flex flex-col md:flex-row justify-between items-center p-4 md:p-6 sm:px-12 border-b border-green-900/30 gap-4 md:gap-0">
        <div className="flex items-center w-full md:w-auto justify-between md:justify-start">
          <img src="/logo.png" alt="Roleta Pix Logo" className="h-12 md:h-20 w-auto object-contain" />
          <div className="flex md:hidden gap-3">
            <button onClick={() => navigate('/login')} className="text-gray-300 hover:text-white font-semibold text-sm">Entrar</button>
            <button onClick={() => navigate('/cadastro')} className="bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded-full font-bold text-sm transition-all text-white">Criar conta</button>
          </div>
        </div>
        <nav className="flex items-center gap-1 text-[11px] md:text-sm font-bold text-green-500 bg-green-950/40 p-1.5 rounded-full border border-green-900/50 uppercase tracking-wider w-full md:w-auto justify-center overflow-x-auto shadow-[0_0_15px_rgba(34,197,94,0.1)]">
          <a href="#como-funciona" className="px-3 md:px-5 py-2 rounded-full hover:bg-green-900/50 hover:text-green-300 transition-all whitespace-nowrap">Como funciona</a>
          <a href="#premios" className="px-3 md:px-5 py-2 rounded-full hover:bg-green-900/50 hover:text-green-300 transition-all whitespace-nowrap">Prêmios</a>
          <a href="#seguranca" className="px-3 md:px-5 py-2 rounded-full hover:bg-green-900/50 hover:text-green-300 transition-all whitespace-nowrap">Segurança</a>
        </nav>
        <div className="hidden md:flex gap-4">
          <button onClick={() => navigate('/login')} className="text-gray-300 hover:text-white font-semibold">Entrar</button>
          <button onClick={() => navigate('/cadastro')} className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-black px-6 py-2 rounded-full font-black shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all transform hover:scale-105">Criar conta</button>
        </div>
      </header>

      <main>
        <section className="relative flex flex-col items-center justify-center py-32 px-4 overflow-hidden min-h-[90vh]">
          {/* Fundo de Vídeo (O usuário pode colocar um bg-casino.mp4 na pasta public) */}
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-40 -z-20 mix-blend-screen"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          >
            <source src="/bg-casino.mp4" type="video/mp4" />
          </video>

          {/* Efeito de Chuva de Dinheiro Constante */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 opacity-60">
            {[...Array(30)].map((_, i) => (
              <div 
                key={i} 
                className="absolute text-4xl md:text-6xl animate-money-fall drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${4 + Math.random() * 6}s`
                }}
              >
                {['💸', '💰', '🤑', '🪙'][Math.floor(Math.random() * 4)]}
              </div>
            ))}
          </div>

          {/* Fundo de Roleta Animada Original */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] sm:w-[1200px] sm:h-[1200px] opacity-10 -z-10 animate-[spin_30s_linear_infinite] pointer-events-none">
            <div className="w-full h-full rounded-full border-[20px] border-green-900/50 shadow-[0_0_100px_rgba(34,197,94,0.3)]" 
                 style={{ 
                   background: 'conic-gradient(#15803d 0deg 30deg, #111 30deg 60deg, #15803d 60deg 90deg, #111 90deg 120deg, #15803d 120deg 150deg, #111 150deg 180deg, #15803d 180deg 210deg, #111 210deg 240deg, #15803d 240deg 270deg, #111 270deg 300deg, #15803d 300deg 330deg, #111 330deg 360deg)' 
                 }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/80 rounded-full blur-3xl"></div>
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
          
          {/* Fundo: Influencer Flutuante */}
          <div className="absolute inset-0 flex items-end md:items-center justify-center pointer-events-none opacity-40 z-0 overflow-hidden pb-5 md:pb-0">
             <div className="animate-float relative w-[900px] h-auto lg:w-[1100px] opacity-70 translate-y-[25%] md:translate-y-[20%]">
               <div className="absolute inset-0 bg-green-500/30 blur-[120px] rounded-full" />
               <img src="/influencer_hero.jpg" alt="Influencer Jogando" className="relative z-10 w-full h-auto object-cover [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_75%)]" />
               
               {/* Selos flutuantes extras no fundo */}
               <div className="absolute -right-5 md:right-0 top-5 md:top-20 bg-black/80 border border-green-500/50 px-4 md:px-8 py-2 md:py-4 rounded-3xl z-20 animate-bounce shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                  <span className="text-green-400 font-black text-lg md:text-3xl whitespace-nowrap">PIX NA HORA!</span>
               </div>
               <div className="absolute -left-5 md:left-0 bottom-32 md:bottom-40 bg-black/80 border border-green-500/50 px-4 md:px-8 py-2 md:py-4 rounded-3xl z-20 shadow-[0_0_30px_rgba(34,197,94,0.3)]" style={{ animation: 'bounce 3s infinite 1.5s' }}>
                  <span className="text-white font-bold text-base md:text-2xl whitespace-nowrap">Saques Instantâneos 💸</span>
               </div>
             </div>
          </div>

          <div className="relative z-10 w-full text-center flex flex-col items-center -mt-32 sm:-mt-24 md:-mt-16 lg:-mt-12">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4 md:mb-6 leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent drop-shadow-2xl">
              Gire a Sorte.<br />
              <span className="text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]">Ganhe na Hora.</span>
            </h1>
            <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-gray-300 font-medium max-w-3xl mx-auto mb-8 md:mb-12 drop-shadow-lg px-6 leading-relaxed">
              A roleta mais emocionante e recompensadora. Cadastre-se agora e receba giros gratuitos para começar a ganhar imediatamente.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center w-full px-8 sm:w-auto">
              <button onClick={() => navigate('/cadastro')} className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 shadow-[0_0_30px_rgba(34,197,94,0.6)] text-white text-lg sm:text-xl md:text-2xl font-black px-6 sm:px-10 md:px-14 py-3 sm:py-4 md:py-5 rounded-full transition-all transform hover:scale-105 border-b-[6px] border-green-900 active:border-b-0 active:mt-[6px]">
                JOGAR AGORA
              </button>
              <button onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto bg-gray-900 border border-gray-800 hover:border-gray-600 text-white text-lg sm:text-xl md:text-2xl font-bold px-6 sm:px-10 md:px-14 py-3 sm:py-4 md:py-5 rounded-full transition-all">
                COMO FUNCIONA
              </button>
            </div>

            <div className="mt-8 md:mt-12 inline-block bg-green-950/70 border border-green-900/70 rounded-full px-5 md:px-8 py-2 md:py-3 text-green-400 font-bold text-xs sm:text-sm md:text-lg animate-pulse backdrop-blur-md">
              🎁 3 GIROS GRÁTIS PARA NOVOS USUÁRIOS
            </div>
          </div>
        </section>

        <section id="premios" className="py-24 relative bg-black px-4 overflow-hidden">
          {/* Luzes de fundo para dar destaque */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-green-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Prêmios <span className="text-green-500">Reais</span></h2>
            <p className="text-gray-300 text-xl md:text-2xl font-medium leading-relaxed mb-16 max-w-3xl mx-auto drop-shadow-md">
              Nossa roleta está recheada de prêmios em <span className="text-green-400 font-bold">dinheiro vivo</span>. Gire e receba direto na sua conta bancária via <span className="text-emerald-400 font-black bg-emerald-900/40 px-2 py-1 rounded-lg border border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]">PIX</span> em segundos!
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {/* Card Prêmio 1 */}
              <div className="bg-gradient-to-b from-gray-900 to-black p-6 rounded-2xl border border-green-900/30 hover:border-green-400 hover:shadow-[0_0_40px_rgba(34,197,94,0.3)] transition-all duration-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-green-500/5 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-green-500 text-4xl mb-4 group-hover:-translate-y-2 group-hover:scale-125 transition-all duration-500 animate-float-fast">💸</div>
                <div className="text-3xl font-black text-white mb-1 group-hover:text-green-400 transition-colors relative z-10">R$ 50</div>
                <div className="text-sm text-gray-500 uppercase tracking-widest font-bold group-hover:text-gray-300 relative z-10">Saque Imediato</div>
              </div>
              
              {/* Card Prêmio 2 */}
              <div className="bg-gradient-to-b from-gray-900 to-black p-6 rounded-2xl border border-green-900/30 hover:border-green-400 hover:shadow-[0_0_40px_rgba(34,197,94,0.3)] transition-all duration-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-green-500/5 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-green-500 text-4xl mb-4 group-hover:-translate-y-2 group-hover:scale-125 transition-all duration-500 animate-float-delayed">💵</div>
                <div className="text-4xl font-black text-white mb-1 group-hover:text-green-400 transition-colors relative z-10">R$ 100</div>
                <div className="text-sm text-gray-500 uppercase tracking-widest font-bold group-hover:text-gray-300 relative z-10">Saque Imediato</div>
              </div>
              
              {/* Card Prêmio 3 (Destaque) */}
              <div className="bg-gradient-to-b from-green-900/50 to-black p-6 rounded-2xl border-2 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)] hover:shadow-[0_0_60px_rgba(34,197,94,0.5)] transition-all duration-500 transform hover:-translate-y-3 group relative overflow-hidden">
                <div className="absolute inset-0 bg-green-500/10 blur-xl rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                <div className="absolute top-0 right-0 bg-green-500 text-black text-xs font-black px-3 py-1 rounded-bl-lg z-20 shadow-lg">MAIS POPULAR</div>
                <div className="text-green-400 text-5xl mb-4 group-hover:-translate-y-2 group-hover:scale-125 transition-all duration-500 animate-float relative z-10 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]">💰</div>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-200 mb-1 group-hover:from-white group-hover:to-green-300 transition-all relative z-10">R$ 250</div>
                <div className="text-sm text-green-500/80 uppercase tracking-widest font-black group-hover:text-green-400 relative z-10">Saque Imediato</div>
              </div>
              
              {/* Card Prêmio 4 */}
              <div className="bg-gradient-to-b from-gray-900 to-black p-6 rounded-2xl border border-green-900/30 hover:border-green-400 hover:shadow-[0_0_40px_rgba(34,197,94,0.3)] transition-all duration-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-green-500/5 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-green-500 text-4xl mb-4 group-hover:-translate-y-2 group-hover:scale-125 transition-all duration-500 animate-float-fast">🤑</div>
                <div className="text-4xl font-black text-white mb-1 group-hover:text-green-400 transition-colors relative z-10">R$ 500</div>
                <div className="text-sm text-gray-500 uppercase tracking-widest font-bold group-hover:text-gray-300 relative z-10">Prêmio Máximo</div>
              </div>
            </div>
            
            <div className="mt-16">
              <button onClick={() => navigate('/cadastro')} className="bg-transparent border-2 border-green-500 text-green-400 hover:bg-green-500 hover:text-black font-black px-8 py-3 rounded-full transition-all text-lg">
                QUERO TENTAR A SORTE
              </button>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="py-24 bg-gray-950/50 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-16">Como Funciona</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
                <div className="text-green-500 text-4xl mb-4 font-black">1</div>
                <h3 className="text-xl font-bold mb-2">Crie sua conta</h3>
                <p className="text-gray-400">Rápido e seguro. Ganhe 3 giros grátis ao se cadastrar.</p>
              </div>
              <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 border-b-4 border-b-green-600">
                <div className="text-green-500 text-4xl mb-4 font-black">2</div>
                <h3 className="text-xl font-bold mb-2">Gire a Roleta</h3>
                <p className="text-gray-400">Assista à roleta girar e veja seu prêmio cair na hora.</p>
              </div>
              <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
                <div className="text-green-500 text-4xl mb-4 font-black">3</div>
                <h3 className="text-xl font-bold mb-2">Saque via PIX</h3>
                <p className="text-gray-400">Atinja o mínimo e receba seu saldo direto na sua conta.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="seguranca" className="py-24 relative bg-black px-4 overflow-hidden">
          <div className="absolute bottom-0 right-1/4 w-full max-w-2xl h-[300px] bg-green-600/5 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <h2 className="text-4xl font-black mb-16 tracking-tight">Sua <span className="text-green-500">Segurança</span> é Prioridade</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl border border-green-900/20 hover:border-green-500/50 hover:-translate-y-2 transition-all duration-300">
                <div className="text-green-500 text-5xl mb-6 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">🔒</div>
                <h3 className="text-2xl font-bold mb-3 text-white">Dados Criptografados</h3>
                <p className="text-gray-400">Todas as suas informações são protegidas com criptografia de nível bancário de ponta a ponta.</p>
              </div>
              <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl border border-green-900/20 hover:border-green-500/50 hover:-translate-y-2 transition-all duration-300">
                <div className="text-green-500 text-5xl mb-6 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">🛡️</div>
                <h3 className="text-2xl font-bold mb-3 text-white">Transações Seguras</h3>
                <p className="text-gray-400">Nossos pagamentos via PIX são instantâneos, auditados e 100% livres de fraudes.</p>
              </div>
              <div className="bg-gradient-to-b from-gray-900 to-black p-8 rounded-2xl border border-green-900/20 hover:border-green-500/50 hover:-translate-y-2 transition-all duration-300">
                <div className="text-green-500 text-5xl mb-6 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">🎲</div>
                <h3 className="text-2xl font-bold mb-3 text-white">Sorteios Justos</h3>
                <p className="text-gray-400">Utilizamos um algoritmo certificado para garantir resultados 100% aleatórios e transparentes.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black py-12 border-t border-gray-900 text-center text-sm text-gray-500">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-gray-900 p-3 rounded-full hover:bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-500 hover:text-white transition-all duration-300 group">
              <svg className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>
          
          <div className="flex justify-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Jogo Responsável</a>
          </div>
          
          <p>&copy; {new Date().getFullYear()} Roleta Pix. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
