import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rzuouakyvryuzfurryjk.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [historique, setHistorique] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        setSession(session);
        chargerHistorique(session.user.id);
      }
    });
  }, [router]);

  async function chargerHistorique(userId) {
    const { data, error } = await supabase
      .from('devis')
      .select('*')
      .eq('artisan_id', userId)
      .order('created_at', { ascending: false });

    if (data) setHistorique(data);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Permet de rouvrir un ancien devis
  const ouvrirAncienDevis = (devis) => {
    // Si on a les nouvelles 'lignes' en JSON dans la description
    let lignesAEnvoyer = "";
    if (devis.description && devis.description.startsWith('[')) {
      lignesAEnvoyer = devis.description;
    } else {
      // Si c'est un très vieux devis avec juste du texte
      lignesAEnvoyer = JSON.stringify([{ description: devis.description || "Ancien devis", prix: devis.montant }]);
    }

    router.push({
      pathname: '/devis',
      query: { 
        nom: devis.nom_client, 
        total: devis.montant,
        lignes: lignesAEnvoyer
      }
    });
  };

  if (!session) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Chargement...</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'system-ui' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>🏠 Tableau de bord</h1>
        <button onClick={handleLogout} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer' }}>
          Déconnexion
        </button>
      </div>

      <p>Bienvenue, <strong>{session.user.email}</strong> !</p>

      {/* ZONE DES BOUTONS D'ACTION */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', marginTop: '20px' }}>
        <button 
          onClick={() => router.push('/agent')} 
          style={{ flex: 1, background: '#3498db', color: 'white', border: 'none', padding: '20px', borderRadius: '12px', fontSize: '18px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontWeight: 'bold' }}>
          ✨ Créer un nouveau devis avec l'IA
        </button>

        {/* NOUVEAU BOUTON PROFIL ICI */}
        <button 
          onClick={() => router.push('/profil')} 
          style={{ flex: 1, background: '#2c3e50', color: 'white', border: 'none', padding: '20px', borderRadius: '12px', fontSize: '18px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontWeight: 'bold' }}>
          🏢 Mon Entreprise (Profil)
        </button>
      </div>

      <h2>📂 Historique de tes devis</h2>
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {historique.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>Aucun devis généré pour le moment.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {historique.map((devis) => (
              <li key={devis.id} style={{ borderBottom: '1px solid #eee', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{devis.nom_client}</strong> - {new Date(devis.created_at).toLocaleDateString('fr-FR')}
                  <br/>
                  <span style={{ color: '#7f8c8d', fontSize: '14px' }}>Montant : {devis.montant} €</span>
                </div>
                <button 
                  onClick={() => ouvrirAncienDevis(devis)}
                  style={{ background: '#f1f2f6', border: '1px solid #dcdde1', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', color: '#2c3e50' }}>
                  📄 Voir le PDF
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}
