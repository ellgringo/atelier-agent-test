import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

// Initialiser Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rzuouakyvryuzfurryjk.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Devis() {
  const router = useRouter();
  const { nom, metier, montant, desc } = router.query;
  const [profil, setProfil] = useState(null);

  // Récupérer le profil de l'artisan connecté
  useEffect(() => {
    async function fetchProfil() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (data) setProfil(data);
      }
    }
    fetchProfil();
  }, []);

  const imprimer = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '40px', fontFamily: 'system-ui, sans-serif', background: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderRadius: '8px' }}>
      
      {/* BOUTON IMPRIMER (Invisible à l'impression) */}
      <div className="print-hidden" style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: '#7f8c8d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
          ⬅ Retour
        </button>
        <button onClick={imprimer} style={{ background: '#2980b9', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          🖨️ Imprimer / Sauvegarder en PDF
        </button>
      </div>

      {/* EN-TÊTE DU DEVIS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          {/* C'EST ICI QUE TES INFOS APPARAISSENT */}
          <h1 style={{ margin: '0', color: '#2c3e50', fontSize: '24px' }}>
            {profil?.entreprise_nom || 'Mon Entreprise'}
          </h1>
          <p style={{ margin: '5px 0', color: '#7f8c8d' }}>{profil?.entreprise_adresse || 'Adresse à configurer dans le profil'}</p>
          <p style={{ margin: '5px 0', color: '#7f8c8d' }}>Tél : {profil?.telephone || 'Non renseigné'}</p>
          <p style={{ margin: '5px 0', color: '#7f8c8d' }}>SIRET : {profil?.siret || 'Non renseigné'}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ margin: '0', color: '#3498db', fontSize: '32px', textTransform: 'uppercase', letterSpacing: '2px' }}>Devis</h2>
          <p style={{ margin: '10px 0 0 0', color: '#7f8c8d' }}>Date : {new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      {/* INFO CLIENT */}
      <div style={{ marginBottom: '40px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', display: 'inline-block', minWidth: '300px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#7f8c8d', fontSize: '14px', textTransform: 'uppercase' }}>Devis pour :</h3>
        <p style={{ margin: '0', fontSize: '20px', fontWeight: 'bold', color: '#2c3e50' }}>{nom || 'Client Anonyme'}</p>
      </div>

      {/* TABLEAU DES PRESTATIONS */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
        <thead>
          <tr style={{ background: '#2c3e50', color: 'white' }}>
            <th style={{ padding: '15px', textAlign: 'left', borderRadius: '8px 0 0 8px' }}>Description de la prestation</th>
            <th style={{ padding: '15px', textAlign: 'right', borderRadius: '0 8px 8px 0', width: '150px' }}>Prix TTC</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '20px 15px', borderBottom: '1px solid #eee', color: '#34495e', lineHeight: '1.6' }}>
              {desc || `Prestation de ${metier}`}
            </td>
            <td style={{ padding: '20px 15px', borderBottom: '1px solid #eee', textAlign: 'right', fontWeight: 'bold', fontSize: '18px', color: '#2c3e50' }}>
              {montant || '0'} €
            </td>
          </tr>
        </tbody>
      </table>

      {/* TOTAL */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '300px', background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', color: '#7f8c8d' }}>Total à payer</span>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>{montant || '0'} €</span>
          </div>
          <p style={{ fontSize: '11px', color: '#95a5a6', marginTop: '10px', textAlign: 'right' }}>
            TVA non applicable, art. 293 B du CGI
          </p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .print-hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
