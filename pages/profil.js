import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rzuouakyvryuzfurryjk.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Profil() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Les champs du profil
  const [entrepriseNom, setEntrepriseNom] = useState('');
  const [entrepriseAdresse, setEntrepriseAdresse] = useState('');
  const [telephone, setTelephone] = useState('');
  const [siret, setSiret] = useState('');

  // Au chargement, on va chercher tes infos dans la base de données
  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setEntrepriseNom(data.entreprise_nom || '');
        setEntrepriseAdresse(data.entreprise_adresse || '');
        setTelephone(data.telephone || '');
        setSiret(data.siret || '');
      }
    }
    loadProfile();
  }, [router]);

  // Quand on clique sur Sauvegarder
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id, // upsert met à jour si l'id existe déjà
          entreprise_nom: entrepriseNom,
          entreprise_adresse: entrepriseAdresse,
          telephone: telephone,
          siret: siret,
          updated_at: new Date()
        });

      if (error) throw error;
      setMessage('✅ Profil mis à jour avec succès ! Tes devis seront parfaits.');
    } catch (error) {
      setMessage('❌ Erreur lors de la sauvegarde : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, color: '#2c3e50' }}>🏢 Mon Entreprise</h1>
        <button onClick={() => router.push('/dashboard')} style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #ccc', cursor: 'pointer' }}>
          ⬅ Retour Dashboard
        </button>
      </div>

      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
          Ces informations apparaîtront en haut à gauche de tous tes futurs devis.
        </p>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>Nom de l'entreprise</label>
            <input 
              type="text" 
              value={entrepriseNom} 
              onChange={(e) => setEntrepriseNom(e.target.value)} 
              placeholder="Ex: Dubois Peinture"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>Adresse postale</label>
            <input 
              type="text" 
              value={entrepriseAdresse} 
              onChange={(e) => setEntrepriseAdresse(e.target.value)} 
              placeholder="Ex: 12 Rue des Lilas, 75000 Paris"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>Numéro de téléphone</label>
            <input 
              type="text" 
              value={telephone} 
              onChange={(e) => setTelephone(e.target.value)} 
              placeholder="Ex: 06 12 34 56 78"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#34495e' }}>Numéro SIRET</label>
            <input 
              type="text" 
              value={siret} 
              onChange={(e) => setSiret(e.target.value)} 
              placeholder="Ex: 123 456 789 00012"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>

          {message && (
            <div style={{ padding: '10px', borderRadius: '8px', background: message.includes('✅') ? '#e8f8f5' : '#fdebd0', color: message.includes('✅') ? '#27ae60' : '#e74c3c', textAlign: 'center' }}>
              {message}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{ background: '#27ae60', color: 'white', padding: '15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: loading ? 'wait' : 'pointer', marginTop: '10px' }}
          >
            {loading ? 'Sauvegarde...' : '💾 Sauvegarder mon profil'}
          </button>
        </form>
      </div>
    </div>
  );
}
