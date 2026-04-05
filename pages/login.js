import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';

// Initialiser Supabase (côté client)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rzuouakyvryuzfurryjk.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        // Connexion
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/agent'); // Redirection vers l'IA
      } else {
        // Inscription
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('✅ Inscription réussie ! Tu peux maintenant te connecter.');
        setIsLogin(true);
      }
    } catch (error) {
      setMessage('❌ Erreur : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f7f6', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        
        <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>
          {isLogin ? 'Connexion Artisan' : 'Créer un compte'}
        </h1>

        {message && (
          <div style={{ padding: '15px', marginBottom: '20px', borderRadius: '8px', background: message.includes('❌') ? '#ffeaa7' : '#d4edda', color: '#2d3436', textAlign: 'center' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            abel style={{ display: 'block', marginBottom: '8px', color: '#7f8c8d' }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
            />
          </div>
          
          <div>
            abel style={{ display: 'block', marginBottom: '8px', color: '#7f8c8d' }}>Mot de passe</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ background: '#3498db', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px' }}
          >
            {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire")}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#7f8c8d', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
        </p>

      </div>
    </div>
  );
}
