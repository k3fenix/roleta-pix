import { useNavigate } from 'react-router-dom';

export default function FuturisticLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-cyan-400 font-mono overflow-hidden relative">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom -z-10" />

      <header className="flex justify-between items-center p-6 border-b border-cyan-900/50 bg-black/50 backdrop-blur-md">
        <div className="flex items-center">
          <img src="/logo.jpg" alt="Roleta Pix Logo" className="h-10 w-auto object-contain rounded-md opacity-90" />
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/login')} className="text-cyan-600 hover:text-cyan-300 transition-colors uppercase text-sm tracking-widest">/login</button>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <div className="relative">
          {/* Glowing orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/20 blur-[100px] rounded-full -z-10" />
          
          <h1 className="text-5xl sm:text-7xl font-light tracking-tight mb-8 text-white">
            A ROLETA QUE PODE <br />
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">MUDAR SEU GIRO.</span>
          </h1>

          <div className="flex flex-col items-center gap-8">
            <button onClick={() => navigate('/cadastro')} className="group relative px-12 py-4 bg-transparent overflow-hidden">
              <div className="absolute inset-0 w-full h-full border border-cyan-500 transition-all duration-300 ease-out group-hover:bg-cyan-500/10" />
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white" />
              <span className="relative text-cyan-400 font-bold tracking-[0.2em] group-hover:text-white transition-colors">
                GIRAR AGORA
              </span>
            </button>

            <div className="border border-cyan-900/50 bg-cyan-950/20 px-6 py-2 rounded text-sm tracking-widest text-cyan-300">
              <span className="text-white">&gt; </span> 3 GIROS GRÁTIS PARA NOVOS USUÁRIOS
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
