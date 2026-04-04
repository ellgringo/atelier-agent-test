import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Connexion à ton Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ArtisanApp() {
  const [artisans, setArtisans] = useState([]);
  const [newArtisan, setNewArtisan] = useState({ nom: '', metier: '', ville: '', telephone: '' });
  const [loading, setLoading] = useState(true);

  // Charger les artisans au démarrage
  useEffect(() => {
    fetchArtisans();
  }, []);

  async function fetchArtisans() {
    setLoading(true);
    const { data, error } = await supabase
      .from('artisans')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setArtisans(data);
    setLoading(false);
  }

  // Ajouter un artisan
  async function addArtisan(e) {
    e.preventDefault();
    if (!newArtisan.nom || !newArtisan.metier) return alert('Nom et métier obligatoires');

    const { error } = await supabase
      .from('artisans')
      .insert([newArtisan]);

    if (error) {
      alert('Erreur lors de l\'ajout');
    } else {
      setNewArtisan({ nom: '', metier: '', ville: '', telephone: '' });
      fetchArtisans(); // Rafraîchir la liste
    }
  }

  // Supprimer un artisan
  async function deleteArtisan(id) {
    const { error } = await supabase
      .from('artisans')
      .delete()
      .eq('id', id);
    
    if (!error) fetchArtisans();
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        🛠️ Annuaire des Artisans
      </h1>

      {/* Formulaire d'ajout */}
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>Ajouter un nouvel artisan</h3>
        <form onSubmit={addArtisan} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            type="text" placeholder="Nom de l'artisan *" required
            value={newArtisan.nom} onChange={e => setNewArtisan({...newArtisan, nom: e.target.value})}
            style={{ padding: '8px', flex: '1', minWidth: '150px' }}
          />
          <input 
            type="text" placeholder="Métier *" required
            value={newArtisan.metier} onChange={e => setNewArtisan({...newArtisan, metier: e.target.value})}
            style={{ padding: '8px', flex: '1', minWidth: '150px' }}
          />
          <input 
            type="text" placeholder="Ville"
            value={newArtisan.ville} onChange={e => setNewArtisan({...newArtisan, ville: e.target.value})}
            style={{ padding: '8px', flex: '1', minWidth: '150px' }}
          />
          <input 
            type="text" placeholder="Téléphone"
            value={newArtisan.telephone} onChange={e => setNewArtisan({...newArtisan, telephone: e.target.value})}
            style={{ padding: '8px', flex: '1', minWidth: '150px' }}
          />
          <button type="submit" style={{ background: '#3498db', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
            Ajouter
          </button>
        </form>
      </div>

      {/* Liste des artisans */}
      <div>
        <h3>Liste des artisans ({artisans.length})</h3>
        {loading ? <p>Chargement...</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {artisans.map(artisan => (
              <div key={artisan.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '1.2em' }}>{artisan.nom}</strong> - <span style={{ color: '#666' }}>{artisan.metier}</span>
                  <div style={{ fontSize: '0.9em', marginTop: '5px' }}>
                    📍 {artisan.ville || 'Non renseigné'} | 📞 {artisan.telephone || 'Non renseigné'}
                  </div>
                </div>
                <button onClick={() => deleteArtisan(artisan.id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                  Supprimer
                </button>
              </div>
            ))}
            {artisans.length === 0 && !loading && (
              <p style={{ fontStyle: 'italic', color: '#7f8c8d' }}>Aucun artisan pour le moment. Ajoutez-en un !</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
