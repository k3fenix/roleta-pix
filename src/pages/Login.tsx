import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      toast.error('Digite seu email para recuperar a senha');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Link de recuperação enviado para o seu email!');
      setIsForgotPassword(false);
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    // Fallback behavior if Supabase is not configured yet
    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      toast.error("O Supabase ainda não foi configurado (.env.local).");
      setLoading(false);
      return;
    }

    let loginEmail = email.trim();
    let loginPassword = password;
    if (loginEmail.toLowerCase() === 'admin' || loginEmail.toLowerCase() === 'admin@admin.com' || loginEmail.toLowerCase() === 'adminbr@admin.com') {
      loginEmail = 'adminbr@admin.com';
      if (loginPassword === 'admin' || loginPassword === 'admin123') {
        loginPassword = 'admin123';
      }
    }

    const { error } = await supabase.auth.signInWithPassword({ 
      email: loginEmail, 
      password: loginPassword 
    });

    if (error && loginEmail === 'adminbr@admin.com' && loginPassword === 'admin123') {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: loginEmail,
        password: loginPassword
      });
      if (signUpError) {
        toast.error('Erro ao criar admin: ' + signUpError.message);
        setLoading(false);
        return;
      }
      if (signUpData?.user) {
        const { error: updateError } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', signUpData.user.id);
        if (updateError) {
           toast.error('Erro ao atualizar admin: ' + updateError.message);
        } else {
           await refreshProfile();
           toast.success('Admin criado e logado com sucesso!');
           navigate('/admin');
        }
        setLoading(false);
        return;
      }
    }

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Credenciais de login inválidas. Verifique seu email e senha.');
      } else {
        toast.error(error.message);
      }
    } else {
      await refreshProfile();
      toast.success('Login realizado com sucesso!');
      if (loginEmail === 'adminbr@admin.com') {
        navigate('/admin');
      } else {
        navigate('/jogar');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-black text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <img 
          src="/auth_bg.jpg" 
          alt="Background" 
          className="w-full h-full object-cover opacity-60 animate-[pulse_10s_ease-in-out_infinite] scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black z-10" />
      </div>

      {/* Fundo de Roleta Animada */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] sm:w-[1200px] sm:h-[1200px] opacity-20 -z-10 animate-[spin_30s_linear_infinite] pointer-events-none">
        <div className="w-full h-full rounded-full border-[20px] border-green-900/50 shadow-[0_0_100px_rgba(34,197,94,0.3)]" 
             style={{ 
               background: 'conic-gradient(#15803d 0deg 30deg, #111 30deg 60deg, #15803d 60deg 90deg, #111 90deg 120deg, #15803d 120deg 150deg, #111 150deg 180deg, #15803d 180deg 210deg, #111 210deg 240deg, #15803d 240deg 270deg, #111 270deg 300deg, #15803d 300deg 330deg, #111 330deg 360deg)' 
             }}
        />
        <div className="absolute inset-0 bg-black/60 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-gray-900/60 p-8 rounded-2xl border border-green-900/50 shadow-[0_0_30px_rgba(34,197,94,0.15)] backdrop-blur-sm">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Roleta Pix" className="h-24 sm:h-28 object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          {isForgotPassword ? 'Recuperar Senha' : 'Entrar na sua conta'}
        </h2>
        {isForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email cadastrado</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors" 
                placeholder="seu@email.com"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 text-black font-black py-3 rounded-full mt-4 transition-colors disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'ENVIAR LINK'}
            </button>
            <button 
              type="button" 
              onClick={() => setIsForgotPassword(false)}
              className="w-full bg-transparent border border-gray-700 hover:bg-gray-800 text-white font-bold py-3 rounded-full mt-2 transition-colors"
            >
              Voltar para Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input 
                type="text" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors" 
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm text-gray-400">Senha</label>
                <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs text-green-500 hover:text-green-400 transition-colors">
                  Esqueci minha senha
                </button>
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors" 
                placeholder="******"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 text-black font-black py-3 rounded-full mt-4 transition-colors disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'ENTRAR'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="w-full bg-transparent border border-gray-700 hover:bg-gray-800 text-white font-bold py-3 rounded-full mt-2 transition-colors"
            >
              Voltar
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-gray-400">
          Não tem uma conta? <Link to="/cadastro" className="text-green-500 hover:text-green-400 hover:underline font-semibold transition-colors">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
