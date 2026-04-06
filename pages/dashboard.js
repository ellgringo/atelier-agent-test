import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

// Initialiser Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rzuouakyvryuzfurryjk.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [devisList, setDevisList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Vérifier si l'utilisateur est connecté
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        setSession(session);
        fetchDevis(session.user.id); // Charger les devis si connecté
      }
    });
  }, [router]);

  // 2. Fonction pour récupérer les devis dans la base de données
  async function fetchDevis(userId) {
    try {
      const { data, error } = await supabase
        .from('devis')
        .select('*')
        .eq('artisan_id', userId)
        .order('date_creation', { ascending: false }); // Du plus récent au plus ancien

      if (error) throw error;
      setDevisList(data || []);
    } catch (error) {
      console.error('Erreur récupération devis:', error.message);
    } finally {
      setLoading(false);
    }
  }

  // 3. Fonction pour re-générer le visuel du devis en cliquant dessus
  const voirDevis = (devis) => {
    router.push({
      pathname: '/devis',
      query: { 
        nom: devis.nom_client, 
        metier: devis.metier, 
        montant: devis.montant, 
        desc: devis.description 
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Chargement de tes devis... ⏳</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif', background: '#f4f7f6', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div>
          <h1 style={{ margin: '0', color: '#2c3e50', fontSize: '24px' }}>Mon Tableau de bord</h1>
          <p style={{ margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '14px' }}>👤 {session?.user?.email}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => router.push('/agent')} style={{ background: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Nouveau Devis
          </button>
          <button onClick={handleLogout} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '20px', cursor: 'pointer' }}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* LISTE DES DEVIS */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2 style={{ marginTop: '0', color: '#34495e', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>📄 Historique de mes devis</h2>
        
        {devisList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#95a5a6' }}>
            <p>Tu n'as généré aucun devis pour le moment.</p>
            <p>Va sur l'Agent IA pour créer ton premier devis à la voix !</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
            {devisList.map((devis) => (
              <div 
                key={devis.id} 
                onClick={() => voirDevis(devis)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '15px', 
                  background: '#f8f9fa', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  borderLeft: '4px solid #3498db',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#e8f4f8'}
                onMouseOut={(e) => e.currentTarget.style.background = '#f8f9fa'}
              >
                <div>
                  <strong style={{ display: 'block', color: '#2c3e50', fontSize: '16px' }}>Client : {devis.nom_client}</strong>
                  <span style={{ color: '#7f8c8d', fontSize: '14px' }}>
                    📅 {new Date(devis.date_creation).toLocaleDateString('fr-FR')} • {devis.description?.substring(0, 30)}...
                  </span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>
                  {devis.montant} €
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
