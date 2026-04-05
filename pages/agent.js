import React, { useState } from 'react';

export default function AgentArtisan() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [reponse, setReponse] = useState('');

  // Fonction pour envoyer le message à l'IA (qu'on codera juste après)
  async function envoyerMessage(e) {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setReponse('');
    
    // Pour l'instant, on simule l'IA qui réfléchit
    setTimeout(() => {
      setReponse("🤖 C'est noté ! Je prépare le devis pour : " + message);
      setLoading(false);
      setMessage('');
    }, 1500);
  }

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      padding: '20px', 
      fontFamily: 'system-ui, sans-serif',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f4f7f6'
    }}>
      
      {/* En-tête de l'application */}
      <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '20px' }}>
        <h1 style={{ color: '#2c3e50', fontSize: '24px', margin: '0' }}>🛠️ Ton Assistant IA</h1>
        <p style={{ color: '#7f8c8d', margin: '5px 0' }}>Dis-moi ce que tu veux facturer</p>
      </div>

      {/* Zone de discussion (Chat) */}
      <div style={{ 
        flex: 1, 
        background: 'white', 
        borderRadius: '12px', 
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        
        <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '12px 12px 12px 0', alignSelf: 'flex-start', maxWidth: '85%' }}>
          Bonjour ! Que puis-je faire pour toi aujourd'hui ? Un devis ? Une facture ?
        </div>

        {reponse && (
          <div style={{ background: '#e8f4f8', padding: '15px', borderRadius: '12px 12px 12px 0', alignSelf: 'flex-start', maxWidth: '85%' }}>
            {reponse}
          </div>
        )}

        {loading && (
          <div style={{ alignSelf: 'center', color: '#95a5a6', fontStyle: 'italic' }}>
            L'IA réfléchit... ⏳
          </div>
        )}
      </div>

      {/* Zone de saisie du message */}
      <form onSubmit={envoyerMessage} style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Ex: Devis 500€ peinture pour M. Dupont..." 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
          style={{ 
            flex: 1, 
            padding: '15px', 
            borderRadius: '25px', 
            border: '1px solid #ddd',
            fontSize: '16px',
            outline: 'none'
          }}
        />
        <button 
          type="submit" 
          disabled={loading || !message.trim()}
          style={{ 
            background: message.trim() ? '#3498db' : '#bdc3c7', 
            color: 'white', 
            border: 'none', 
            padding: '0 25px', 
            borderRadius: '25px', 
            cursor: message.trim() ? 'pointer' : 'not-allowed',
            fontWeight: 'bold'
          }}
        >
          Envoyer
        </button>
      </form>

    </div>
  );
}
