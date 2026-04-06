import { createClient } from '@supabase/supabase-js';

// On initialise Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rzuouakyvryuzfurryjk.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Seulement POST' });
  }

  // NOUVEAU : On récupère AUSSI le userId (l'id de l'artisan)
  const { message, userId } = req.body;

  try {
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Tu analyses les messages d'artisans français. Extrait :
- NOM_CLIENT (ex: Dupont)
- METIER (plombier, maçon...)
- MONTANT (chiffre uniquement)
- DESCRIPTION (travaux)

Réponds JSON pur : {"nom_client":"Dupont","metier":"plombier","montant":450,"description":"Changement chaudière"}`
        },
        { role: 'user', content: message }
      ],
      temperature: 0
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // --- SAUVEGARDE SUPABASE ICI ---
    if (userId) {
      console.log("Tentative de sauvegarde pour l'artisan:", userId);
      const { error: dbError } = await supabase
        .from('devis')
        .insert({
          artisan_id: userId,
          nom_client: result.nom_client || 'Client Inconnu',
          metier: result.metier || 'Non précisé',
          montant: Number(result.montant) || 0,
          description: result.description || message
        });
      
      if (dbError) {
        console.error("❌ Erreur sauvegarde DB:", dbError);
      } else {
        console.log("✅ Devis sauvegardé !");
      }
    } else {
      console.log("⚠️ Aucun userId fourni, devis non sauvegardé.");
    }
    // -------------------------------
    
    res.json({ 
      success: true,
      analyse: result,
      reponse: `✅ Devis ${result.montant || '?'}€ pour ${result.nom_client || 'client'} (${result.metier})`
    });

  } catch (error) {
    console.error("ERREUR:", error);
    res.json({ 
      success: false,
      error: error.message || 'Erreur inconnue API'
    });
  }
}
