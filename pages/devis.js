import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rzuouakyvryuzfurryjk.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Devis() {
  const router = useRouter();
  const { nom, metier, montant, desc } = router.query;
  const [profil, setProfil] = useState({
    entreprise_nom: 'Artisan Peintre',
    entreprise_adresse: '',
    telephone: '',
    siret: 'En cours'
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('entreprise_nom, entreprise_adresse, telephone, siret')
          .eq('id', session.user.id)
          .single();

        if (data) {
          setProfil({
            entreprise_nom: data.entreprise_nom || 'Artisan',
            entreprise_adresse: data.entreprise_adresse || '',
            telephone: data.telephone || '',
            siret: data.siret || 'En cours'
          });
        }
      } catch (err) {
        console.error("Erreur chargement profil:", err);
      }
    }
    loadProfile();
  }, []);

  const imprimer = () => window.print();

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '40px', fontFamily: 'system-ui, sans-serif', background: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderRadius: '8px' }}>
      
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
        <div style={{ color: '#2c3e50' }}>
          <h1 style={{ margin: '0 0 10px 0', color: '#3498db', fontSize: '24px' }}>
            {profil.entreprise_nom}
          </h1>
          {/* L'adresse et le téléphone forceront leur affichage s'ils existent */}
          <p style={{ margin: '3px 0', fontSize: '14px' }}>
            {profil.entreprise_adresse ? `📍 ${profil.entreprise_adresse}` : '📍 Adresse non renseignée'}
          </p>
          <p style={{ margin: '3px 0', fontSize: '14px' }}>
            {profil.telephone ? `📞 ${profil.telephone}` : '📞 Tél non renseigné'}
          </p>
          <p style={{ margin: '3px 0', fontSize: '14px', color: '#7f8c8d' }}>
            N° SIRET : {profil.siret}
          </p>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ margin: '0', color: '#2c3e50', fontSize: '32px', textTransform: 'uppercase', letterSpacing: '1px' }}>Devis</h2>
          <p style={{ margin: '10px 0 0 0', color: '#7f8c8d' }}>Date : {new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      {/* INFO CLIENT */}
      <div style={{ marginBottom: '40px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', display: 'inline-block', minWidth: '300px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#7f8c8d', fontSize: '14px', textTransform: 'uppercase' }}>Client :</h3>
        <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>{nom || 'Client Anonyme'}</p>
      </div>

      {/* TABLEAU */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
        <thead>
          <tr style={{ background: '#34495e', color: 'white' }}>
            <th style={{ padding: '15px', textAlign: 'left', borderRadius: '8px 0 0 8px' }}>Description des travaux</th>
            <th style={{ padding: '15px', textAlign: 'right', borderRadius: '0 8px 8px 0', width: '150px' }}>Total TTC</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '20px 15px', borderBottom: '1px solid #eee', color: '#2c3e50', lineHeight: '1.6' }}>
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
        <div style={{ width: '300px', background: '#e8f4f8', padding: '20px', borderRadius: '8px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#7f8c8d' }}>
            <span>Total HT :</span>
            <span>{montant ? (Number(montant) * 0.8).toFixed(2) : '0.00'} €</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#7f8c8d', borderBottom: '1px solid #bdc3c7', paddingBottom: '15px' }}>
            <span>TVA (20%) :</span>
            <span>{montant ? (Number(montant) * 0.2).toFixed(2) : '0.00'} €</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' }}>NET À PAYER :</span>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>{montant || '0'} €</span>
          </div>
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
