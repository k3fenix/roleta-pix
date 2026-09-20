import { useNavigate } from 'react-router-dom';

export default function GameShowLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-blue-950 text-yellow-400 font-sans selection:bg-yellow-400/30 selection:text-blue-950">
      <header className="flex justify-between items-center p-6 border-b-4 border-yellow-500 bg-blue-900 shadow-2xl">
        <div className="flex items-center">
          <img src="/logo.jpg" alt="Roleta Pix Logo" className="h-12 w-auto object-contain rounded-md border-2 border-yellow-500" />
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/login')} className="text-white hover:text-yellow-400 font-bold uppercase tracking-wider">Entrar</button>
        </div>
      </header>

      <main className="relative overflow-hidden">
        {/* Stage Lights Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-700 via-blue-950 to-black -z-10" />
        <div className="absolute top-0 left-1/4 w-32 h-[800px] bg-yellow-400/10 blur-3xl transform rotate-45 -z-10" />
        <div className="absolute top-0 right-1/4 w-32 h-[800px] bg-yellow-400/10 blur-3xl transform -rotate-45 -z-10" />

        <section className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="bg-blue-900 border-4 border-yellow-500 p-8 sm:p-16 rounded-3xl shadow-[0_0_50px_rgba(234,179,8,0.3)] max-w-4xl relative">
            <h1 className="text-6xl sm:text-8xl font-black mb-4 tracking-tighter text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]">
              GIROU. PAROU.<br/>
              <span className="text-yellow-400">GANHOU.</span>
            </h1>
            
            <p className="text-xl text-blue-200 mb-12 font-bold uppercase tracking-widest">
              O maior show de prêmios da internet!
            </p>

            <button onClick={() => navigate('/cadastro')} className="bg-yellow-500 hover:bg-yellow-400 text-blue-950 text-3xl font-black px-16 py-6 rounded-full uppercase tracking-widest shadow-[0_10px_0_rgb(161,98,7)] transition-transform active:translate-y-2 active:shadow-none hover:scale-105 border-4 border-white">
              COMEÇAR GRÁTIS
            </button>

            <div className="mt-8 text-2xl font-black text-white bg-red-600 inline-block px-8 py-3 rounded-xl border-4 border-white transform -rotate-2 animate-bounce shadow-xl">
              3 GIROS GRÁTIS!
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
