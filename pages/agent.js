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
      if (!session) router.push('/login');
      else setSession(session);
    });
  }, []);

  const handleEnvoyer = async (e) => {
    e.preventDefault();
    if (!message) return;
    setLoading(true);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: message, userId: session?.user?.id })
      });

      const data = await response.json();

      if (response.ok && data.analyse && data.analyse.lignes) {
        // On transforme le tableau de lignes en texte pour le passer dans l'URL
        const lignesTexte = JSON.stringify(data.analyse.lignes);
        
        router.push({
          pathname: '/devis',
          query: { 
            nom: data.analyse.nom_client, 
            total: data.analyse.montant_total,
            lignes: lignesTexte // Les multiples lignes générées par l'IA
          }
        });
      } else {
        alert("L'IA n'a pas renvoyé le bon format. Réessaie.");
      }
    } catch (error) {
      alert("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1>🤖 Assistant IA</h1>
        <button onClick={() => router.push('/dashboard')}>Retour Dashboard</button>
      </div>
      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2>Dis-moi ce que tu veux facturer !</h2>
        <form onSubmit={handleEnvoyer} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <textarea 
            rows="4" 
            placeholder="Ex: Devis pour Dubois. Peinture 400€, Main d'oeuvre 700€, Déplacement 100€."
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            style={{ padding: '15px', borderRadius: '8px', fontSize: '16px' }}
          />
          <button type="submit" disabled={loading} style={{ background: '#3498db', color: 'white', padding: '15px', borderRadius: '8px', cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? 'Création en cours...' : '✨ Générer le devis détaillé'}
          </button>
        </form>
      </div>
    </div>
  );
}
