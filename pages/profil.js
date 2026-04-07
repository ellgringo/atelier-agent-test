import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

// Initialiser Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rzuouakyvryuzfurryjk.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Profil() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Les données du profil
  const [profil, setProfil] = useState({
    entreprise_nom: '',
    entreprise_adresse: '',
    siret: '',
    telephone: ''
  });

  // 1. Vérifier la connexion et charger le profil existant
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        setSession(session);
        chargerProfil(session.user.id);
      }
    });
  }, [router]);

  async function chargerProfil(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single(); // On récupère une seule ligne

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = pas de profil trouvé, on ignore

      if (data) {
        setProfil({
          entreprise_nom: data.entreprise_nom || '',
          entreprise_adresse: data.entreprise_adresse || '',
          siret: data.siret || '',
          telephone: data.telephone || ''
        });
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error.message);
    } finally {
      setLoading(false);
    }
  }

  // 2. Mettre à jour le profil dans Supabase
  async function sauvegarderProfil(e) {
    e.preventDefault(); // Empêche la page de recharger
    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          entreprise_nom: profil.entreprise_nom,
          entreprise_adresse: profil.entreprise_adresse,
          siret: profil.siret,
          telephone: profil.telephone,
          updated_at: new Date()
        })
        .eq('id', session.user.id);

      if (error) throw error;
      setMessage('✅ Profil mis à jour avec succès !');
    } catch (error) {
      console.error(error);
      setMessage('❌ Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  }

  // Mettre à jour les champs de texte
  const handleChange = (e) => {
    setProfil({ ...profil, [e.target.name]: e.target.value });
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Chargement... ⏳</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#2c3e50', margin: 0 }}>Mon Entreprise</h1>
        <button onClick={() => router.push('/dashboard')} style={{ background: '#7f8c8d', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer' }}>
          Retour au Dashboard
        </button>
      </div>

      {/* FORMULAIRE */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <form onSubmit={sauvegarderProfil} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>Nom de l'entreprise</label>
            <input 
              type="text" 
              name="entreprise_nom" 
              value={profil.entreprise_nom} 
              onChange={handleChange}
              placeholder="Ex: Plomberie Express ou Lucas Perret"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>Adresse</label>
            <input 
              type="text" 
              name="entreprise_adresse" 
              value={profil.entreprise_adresse} 
              onChange={handleChange}
              placeholder="Ex: 12 rue de la Paix, 75000 Paris"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>Numéro SIRET</label>
            <input 
              type="text" 
              name="siret" 
              value={profil.siret} 
              onChange={handleChange}
              placeholder="Ex: 123 456 789 00012"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>Téléphone</label>
            <input 
              type="text" 
              name="telephone" 
              value={profil.telephone} 
              onChange={handleChange}
              placeholder="Ex: 06 12 34 56 78"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={saving}
            style={{ 
              background: '#3498db', 
              color: 'white', 
              border: 'none', 
              padding: '12px', 
              borderRadius: '8px', 
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              marginTop: '10px',
              fontSize: '16px'
            }}>
            {saving ? 'Enregistrement...' : '💾 Sauvegarder mon profil'}
          </button>

          {/* MESSAGE DE SUCCÈS OU ERREUR */}
          {message && (
            <div style={{ marginTop: '10px', padding: '10px', borderRadius: '8px', textAlign: 'center', background: message.includes('✅') ? '#d4edda' : '#f8d7da', color: message.includes('✅') ? '#155724' : '#721c24' }}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
