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
  const [loading, setLoading] = useState(true);

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
    try {
      // ON ENLÈVE LA RESTRICTION "eq('artisan_id', userId)" QUI BLOQUAIT LA LECTURE
      const { data, error } = await supabase
        .from('devis')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erreur chargement:", error);
      } else if (data) {
        // On filtre manuellement côté client pour être 100% sûr
        const mesDevis = data.filter(devis => devis.artisan_id === userId);
        setHistorique(mesDevis);
      }
    } catch (err) {
      console.error("Erreur serveur:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const relancerDevis = (devisItem) => {
    let lignesData = "";
    
    try {
      if (devisItem.description && devisItem.description.trim().startsWith('[')) {
        JSON.parse(devisItem.description);
        lignesData = devisItem.description;
      } else {
        lignesData = JSON.stringify([
          { description: devisItem.description || "Prestation globale", prix: devisItem.montant || 0 }
        ]);
      }
    } catch (e) {
      lignesData = JSON.stringify([
        { description: "Prestation globale", prix: devisItem.montant || 0 }
      ]);
    }

    router.push({
      pathname: '/devis',
      query: { 
        nom: devisItem.nom_client, 
        total: devisItem.montant,
        lignes: lignesData
      }
    });
  };

  if (!session) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Chargement...</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0 }}>🏠 Tableau de bord</h1>
        <button onClick={handleLogout} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer' }}>
          Déconnexion
        </button>
      </div>

      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <p style={{ margin: 0 }}>Bienvenue, <strong>{session.user.email}</strong> !</p>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <button 
          onClick={() => router.push('/agent')} 
          style={{ flex: 1, background: '#3498db', color: 'white', border: 'none', padding: '20px', borderRadius: '12px', fontSize: '18px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontWeight: 'bold' }}>
          ✨ Créer un devis avec l'IA
        </button>

        <button 
          onClick={() => router.push('/profil')} 
          style={{ flex: 1, background: '#2c3e50', color: 'white', border: 'none', padding: '20px', borderRadius: '12px', fontSize: '18px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontWeight: 'bold' }}>
          🏢 Mon Entreprise
        </button>
      </div>

      <h2>📂 Historique de tes devis</h2>
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        {loading ? (
          <p style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>Chargement de l'historique...</p>
        ) : historique.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>Aucun devis généré pour le moment.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {historique.map((item) => (
              <li key={item.id} style={{ borderBottom: '1px solid #eee', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '16px', color: '#2c3e50' }}>{item.nom_client || 'Client inconnu'}</strong>
                  <br />
                  <span style={{ color: '#7f8c8d', fontSize: '14px' }}>
                    {new Date(item.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontWeight: 'bold', color: '#27ae60', fontSize: '16px' }}>{item.montant || 0} €</span>
                  <button 
                    onClick={() => relancerDevis(item)}
                    style={{ background: '#f1f2f6', border: '1px solid #dcdde1', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', color: '#2c3e50', fontWeight: 'bold' }}>
                    📄 Voir PDF
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}
