import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rzuouakyvryuzfurryjk.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Agent() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        setSession(session);
      }
    });
  }, [router]);

  const handleEnvoyer = async (e) => {
    e.preventDefault();
    if (!message) return;
    
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: message,
          userId: session.user.id 
        })
      });

      const data = await response.json();

      if (response.ok && data.devis) {
        router.push({
          pathname: '/devis',
          query: { 
            nom: data.devis.nom_client, 
            metier: data.devis.metier, 
            montant: data.devis.montant, 
            desc: data.devis.description 
          }
        });
      } else {
        alert("L'IA a eu un petit problème de réflexion.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0 }}>🤖 Assistant IA</h1>
        <button onClick={() => router.push('/dashboard')} style={{ padding: '10px 15px', cursor: 'pointer' }}>
          Retour au Dashboard
        </button>
      </div>

      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Dis-moi ce que tu veux facturer !</h2>
        
        <form onSubmit={handleEnvoyer} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <textarea 
            rows="4"
            placeholder="Ex: Fais un devis pour Dupont, plombier, 500€ pour une fuite."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ padding: '15px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }}
          />

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              background: '#3498db', color: 'white', border: 'none', padding: '15px', 
              borderRadius: '8px', cursor: loading ? 'wait' : 'pointer', fontWeight: 'bold'
            }}>
            {loading ? 'Création en cours...' : '✨ Générer le devis'}
          </button>
        </form>
      </div>
    </div>
  );
}
