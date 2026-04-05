import React, { useState, useEffect } from 'react';

export default function AgentArtisan() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [reponse, setReponse] = useState('');
  const [ecoute, setEcoute] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.lang = 'fr-FR';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setEcoute(false);
      };
      
      rec.onerror = () => {
        setEcoute(false);
        alert("Erreur de reconnaissance vocale. Réessaie !");
      };
      
      setRecognition(rec);
    }
  }, []);

  async function envoyerMessage(e) {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setReponse('');
    
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await res.json();
      
      if (data.success) {
        setReponse(data.reponse);
      } else {
        setReponse("❌ Erreur : " + (data.error || "Problème API"));
      }
    } catch (error) {
      setReponse("❌ Impossible de joindre l'IA.");
    } finally {
      setLoading(false);
      setMessage('');
    }
  }

  function toggleEcoute() {
    if (!recognition) {
      alert("Reconnaissance vocale non supportée sur ce navigateur");
      return;
    }

    if (ecoute) {
      recognition.stop();
      setEcoute(false);
    } else {
      recognition.start();
      setEcoute(true);
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f7f6' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '20px' }}>
        <h1 style={{ color: '#2c3e50', fontSize: '24px', margin: '0' }}>🛠️ Ton Assistant IA</h1>
        <p style={{ color: '#7f8c8d', margin: '5px 0' }}>Dicte-moi ce que tu veux facturer</p>
      </div>

      <div style={{ flex: 1, background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto' }}>
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '12px 12px 12px 0', alignSelf: 'flex-start', maxWidth: '85%' }}>
          Bonjour ! Dicte-moi un devis ou une facture. Ex: "Devis 500€ peinture Dupont"
        </div>

        {reponse && (
          <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '12px 12px 12px 0', alignSelf: 'flex-start', maxWidth: '85%' }}>
            {reponse}
          </div>
        )}

        {loading && (
          <div style={{ alignSelf: 'center', color: '#95a5a6', fontStyle: 'italic' }}>
            L'IA prépare ton document... ⏳
          </div>
        )}
      </div>

      <form onSubmit={envoyerMessage} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ display: 'flex', flex: 1, position: 'relative', background: 'white', borderRadius: '25px', padding: '5px 15px', border: '1px solid #ddd', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <input type="text" placeholder="Dicte ou tape ton message..." value={message} onChange={(e) => setMessage(e.target.value)} disabled={loading} style={{ flex: 1, padding: '12px 0', border: 'none', outline: 'none', fontSize: '16px' }} />
          <button type="button" onClick={toggleEcoute} disabled={loading || !recognition} style={{ background: ecoute ? '#e74c3c' : '#3498db', color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '50%', cursor: recognition ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', opacity: recognition ? 1 : 0.5 }} title="Dictée vocale">
            {ecoute ? '⏹️' : '🎤'}
          </button>
        </div>
        <button type="submit" disabled={loading || !message.trim()} style={{ background: message.trim() ? '#27ae60' : '#bdc3c7', color: 'white', border: 'none', padding: '0 25px', borderRadius: '25px', cursor: message.trim() ? 'pointer' : 'not-allowed', fontWeight: 'bold', height: '55px' }}>
          Générer 📄
        </button>
      </form>
    </div>
  );
}
