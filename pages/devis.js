import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rzuouakyvryuzfurryjk.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Devis() {
  const router = useRouter();
  
  // On récupère les nouvelles données de l'IA (nom, total, et le tableau des lignes)
  const { nom, total, lignes } = router.query;
  const [profil, setProfil] = useState({ entreprise_nom: 'Artisan', siret: 'En cours' });
  
  // On re-transforme le texte des lignes en un vrai tableau Javascript
  const lignesDevis = lignes ? JSON.parse(lignes) : [{ description: 'Prestation globale', prix: total || 0 }];

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (data) setProfil({ ...data, entreprise_nom: data.entreprise_nom || 'Artisan', siret: data.siret || 'En cours' });
      }
    }
    loadProfile();
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '40px', fontFamily: 'system-ui', background: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      
      <div className="print-hidden" style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <button onClick={() => router.push('/dashboard')} style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #ccc' }}>⬅ Retour</button>
        <button onClick={() => window.print()} style={{ background: '#2980b9', color: 'white', padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: 'none' }}>🖨️ Imprimer PDF</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: '0', color: '#3498db', fontSize: '24px' }}>{profil.entreprise_nom}</h1>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>📍 {profil.entreprise_adresse || 'Adresse non renseignée'}</p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>📞 {profil.telephone || 'Tél non renseigné'}</p>
          <p style={{ margin: '5px 0', fontSize: '14px', color: '#7f8c8d' }}>N° SIRET : {profil.siret}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ margin: '0', color: '#2c3e50', fontSize: '32px' }}>DEVIS</h2>
          <p style={{ margin: '10px 0 0 0', color: '#7f8c8d' }}>Date : {new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      <div style={{ marginBottom: '40px', padding: '20px', background: '#f8f9fa', display: 'inline-block', minWidth: '300px', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>CLIENT :</h3>
        <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold' }}>{nom || 'Client Anonyme'}</p>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
        <thead>
          <tr style={{ background: '#34495e', color: 'white' }}>
            <th style={{ padding: '15px', textAlign: 'left', borderRadius: '8px 0 0 8px' }}>Description des travaux</th>
            <th style={{ padding: '15px', textAlign: 'right', borderRadius: '0 8px 8px 0' }}>Prix TTC</th>
          </tr>
        </thead>
        <tbody>
          {/* C'EST ICI LA MAGIE : On dessine autant de lignes que l'IA en a généré */}
          {lignesDevis.map((ligne, index) => (
            <tr key={index}>
              <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>{ligne.description}</td>
              <td style={{ padding: '15px', borderBottom: '1px solid #eee', textAlign: 'right', fontWeight: 'bold' }}>{ligne.prix} €</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '300px', background: '#e8f4f8', padding: '20px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#7f8c8d' }}>
            <span>Total HT :</span>
            <span>{total ? (Number(total) * 0.8).toFixed(2) : '0.00'} €</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#7f8c8d', borderBottom: '1px solid #bdc3c7', paddingBottom: '15px' }}>
            <span>TVA (20%) :</span>
            <span>{total ? (Number(total) * 0.2).toFixed(2) : '0.00'} €</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>NET À PAYER :</span>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>{total || '0'} €</span>
          </div>
        </div>
      </div>

      <style jsx global>{`@media print { body { background: white !important; } .print-hidden { display: none !important; } }`}</style>
    </div>
  );
}
