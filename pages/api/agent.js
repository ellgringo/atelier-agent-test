import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabaseUrl = 'https://rzuouakyvryuzfurryjk.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'ton-clef-supabase';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { message } = req.body;

  try {
    // L'IA analyse le message et extrait les infos
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Tu es un assistant pour artisans. 
          
Analyse ce message et extrait :
- NOM_CLIENT (nom du client)
- METIER (plombier, électricien, etc.)
- MONTANT (le prix total)
- DESCRIPTION (travaux à faire)

Réponds en JSON uniquement, exemple :
{
  "nom_client": "Dupont", 
  "metier": "plombier", 
  "montant": 500, 
  "description": "Changement cumulus"
}`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0,
    });

    const analyse = JSON.parse(completion.choices[0].message.content);

    // Enregistre dans Supabase
    const { data, error } = await supabase
      .from('artisans')
      .insert({
        nom: analyse.nom_client || 'Client inconnu',
        metier: analyse.metier || 'Non spécifié',
        telephone: 'À ajouter',
        ville: 'Saint-Just-Saint-Rambert'
      });

    if (error) throw error;

    res.status(200).json({
      success: true,
      artisan: data[0],
      reponse: `✅ Devis créé pour ${analyse.nom_client || 'le client'} - ${analyse.montant || '?'}€`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur IA', details: error.message });
  }
}
