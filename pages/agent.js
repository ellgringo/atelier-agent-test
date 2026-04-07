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
  const [isListening, setIsListening] = useState(false);

  // Vérification de connexion
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
      else setSession(session);
    });
  }, [router]);

  // LE MICROPHONE EST DE RETOUR ET SÉCURISÉ
  const startListening = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Ton navigateur ne supporte pas le micro (Essaie sur Google Chrome).");
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage((prev) => prev ? prev + " " + transcript : transcript);
      };
      recognition.onerror = (event) => {
        alert("Erreur micro: " + event.error);
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (error) {
      alert("Impossible de lancer le micro : " + error.message);
    }
  };

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

      // SÉCURITÉ ABSOLUE : Ça marche même si l'API est sur l'ancienne version !
      if (response.ok && data.analyse) {
        let lignesArray = [];
        let totalAffiche = 0;

        // Si l'IA a bien fait les lignes séparées
        if (data.analyse.lignes && data.analyse.lignes.length > 0) {
          lignesArray = data.analyse.lignes;
          totalAffiche = data.analyse.montant_total || lignesArray.reduce((sum, l) => sum + Number(l.prix), 0);
        } 
        // Si l'IA a fait l'ancien format (1 seule ligne globale)
        else {
          lignesArray = [{ 
            description: data.analyse.description || "Prestation", 
            prix: data.analyse.montant || 0 
          }];
          totalAffiche = data.analyse.montant || 0;
        }

        const lignesTexte = JSON.stringify(lignesArray);
        
        router.push({
          pathname: '/devis',
          query: { 
            nom: data.analyse.nom_client || 'Client Anonyme', 
            total: totalAffiche,
            lignes: lignesTexte
          }
        });
      } else {
        alert("L'IA n'a pas pu traiter la demande. Vérifie l'historique.");
      }
    } catch (error) {
      alert("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>🤖 Assistant IA</h1>
        <button onClick={() => router.push('/dashboard')} style={{ padding: '10px 15px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #ccc' }}>Retour Dashboard</button>
      </div>

      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Dis-moi ce que tu veux facturer !</h2>
        
        <form onSubmit={handleEnvoyer} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ position: 'relative' }}>
            <textarea 
              rows="4" 
              placeholder="Ex: Devis pour Dubois. Peinture 400€, Main d'oeuvre 700€, Déplacement 100€."
              value={message} 
              onChange={(e) => setMessage(e.target.value)}
              style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', boxSizing: 'border-box' }}
            />
            {/* LE BOUTON MICROPHONE ROUGE/BLEU EST LÀ */}
            <button 
              type="button" 
              onClick={startListening}
              style={{
                position: 'absolute', bottom: '10px', right: '10px',
                background: isListening ? '#e74c3c' : '#f1f2f6',
                color: isListening ? 'white' : '#2c3e50',
                border: 'none', borderRadius: '50%', width: '40px', height: '40px',
                fontSize: '20px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              title="Dicter à la voix"
            >
              {isListening ? '🔴' : '🎙️'}
            </button>
          </div>

          {isListening && <p style={{ color: '#e74c3c', fontSize: '14px', textAlign: 'center', margin: '0' }}>Je t'écoute...</p>}
          
          <button type="submit" disabled={loading} style={{ background: '#3498db', color: 'white', padding: '15px', borderRadius: '8px', cursor: loading ? 'wait' : 'pointer', fontWeight: 'bold', border: 'none' }}>
            {loading ? 'Création en cours...' : '✨ Générer le devis détaillé'}
          </button>
        </form>
      </div>
    </div>
  );
}
