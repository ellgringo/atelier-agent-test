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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
      else setSession(session);
    });
  }, [router]);

  // FONCTION MICROPHONE SÉCURISÉE
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
        alert("Erreur micro: " + event.error + " (Vérifie que tu as autorisé le micro en haut de ton navigateur)");
        setIsListening(false);
      };

      recognition.onend = () => setIsListening(false);
      recognition.start();

    } catch (error) {
      alert("Impossible de lancer le micro : " + error.message);
    }
  };

  // ENVOI À L'IA
  const handleEnvoyer = async (e) => {
    e.preventDefault();
    if (!message) return;
    
    setLoading(true);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: message,
          userId: session.user.id 
        })
      });

      const data = await response.json();

      // C'EST ICI LA CORRECTION MAJEURE (data.analyse au lieu de data.devis)
      if (response.ok && data.analyse) {
        router.push({
          pathname: '/devis',
          query: { 
            nom: data.analyse.nom_client, 
            metier: data.analyse.metier, 
            montant: data.analyse.montant, 
            desc: data.analyse.description 
          }
        });
      } else {
        alert("L'IA a répondu mais il manque des infos. Vérifie ton fichier API.");
        console.error("Réponse de l'IA:", data);
      }
    } catch (error) {
      console.error("Erreur détaillée:", error);
      alert("Erreur de connexion avec le serveur IA.");
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
          
          <div style={{ position: 'relative' }}>
            <textarea 
              rows="4"
              placeholder="Ex: Fais un devis pour Dupont, plombier, 500€ pour une fuite."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', boxSizing: 'border-box' }}
            />
            
            {/* BOUTON MICROPHONE */}
            <button 
              type="button" 
              onClick={startListening}
              style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                background: isListening ? '#e74c3c' : '#f1f2f6',
                color: isListening ? 'white' : '#2c3e50',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '20px',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
              title="Dicter à la voix"
            >
              {isListening ? '🔴' : '🎙️'}
            </button>
          </div>

          {isListening && <p style={{ color: '#e74c3c', fontSize: '14px', textAlign: 'center', margin: '0' }}>Je t'écoute...</p>}

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
      </div>
    </div>
  );
}
