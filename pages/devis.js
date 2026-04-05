import { useRouter } from 'next/router';
import React from 'react';

export default function Devis() {
  const router = useRouter();
  const { nom, metier, montant, desc } = router.query;

  // Si la page charge
  if (!nom) return <div style={{ padding: '50px', textAlign: 'center' }}>Génération du devis en cours... ⏳</div>;

  return (
    <div style={{ background: '#f4f7f6', minHeight: '100vh', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        
        {/* En-tête */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: '0', color: '#2c3e50', fontSize: '32px' }}>DEVIS</h1>
            <p style={{ color: '#7f8c8d', margin: '5px 0 0 0' }}>Date : {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: '0', color: '#3498db', textTransform: 'capitalize' }}>Artisan {metier}</h2>
            <p style={{ color: '#7f8c8d', margin: '5px 0 0 0' }}>N° SIRET : En cours</p>
          </div>
        </div>

        {/* Info Client */}
        <div style={{ marginBottom: '40px', background: '#f8f9fa', padding: '15px', borderRadius: '6px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '16px' }}>Client :</h3>
          <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold' }}>Monsieur / Madame {nom}</p>
        </div>

        {/* Détail des travaux */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
          <thead>
            <tr style={{ background: '#2c3e50', color: 'white' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderRadius: '6px 0 0 0' }}>Description des travaux</th>
              <th style={{ padding: '12px', textAlign: 'right', borderRadius: '0 6px 0 0' }}>Total TTC</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '15px 12px', color: '#34495e' }}>{desc}</td>
              <td style={{ padding: '15px 12px', textAlign: 'right', fontWeight: 'bold', fontSize: '18px' }}>{montant} €</td>
            </tr>
          </tbody>
        </table>

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ background: '#e8f4f8', padding: '20px', borderRadius: '8px', minWidth: '250px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: '#7f8c8d' }}>Total HT :</span>
              <span>{(montant * 0.8).toFixed(2)} €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: '#7f8c8d' }}>TVA (20%) :</span>
              <span>{(montant * 0.2).toFixed(2)} €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #bdc3c7', paddingTop: '10px', marginTop: '10px' }}>
              <strong style={{ fontSize: '20px' }}>NET À PAYER :</strong>
              <strong style={{ fontSize: '20px', color: '#27ae60' }}>{montant} €</strong>
            </div>
          </div>
        </div>

        {/* Bouton d'action (caché à l'impression) */}
        <div style={{ marginTop: '50px', textAlign: 'center' }}>
          <button 
            onClick={() => window.print()} 
            style={{ background: '#2c3e50', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '25px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🖨️ Imprimer / Sauvegarder en PDF
          </button>
        </div>

      </div>
    </div>
  );
}
