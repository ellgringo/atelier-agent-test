import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rzuouakyvryuzfurryjk.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Seulement POST' });

  const { prompt, userId } = req.body;

  try {
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          // L'ERREUR ÉTAIT ICI : J'ai rajouté le mot JSON qui est obligatoire pour OpenAI
          content: `Tu es un assistant pour artisan qui génère des lignes de devis.
          Tu DOIS extraire chaque prestation et son prix séparément et répondre UNIQUEMENT au format JSON.

          Exemple 1 :
          User: "Devis pour Dubois. Peinture 400€, déplacement 50€ et nettoyage 150€."
          Toi: {"nom_client":"Dubois","lignes":[{"description":"Peinture","prix":400},{"description":"Déplacement","prix":50},{"description":"Nettoyage","prix":150}]}

          Exemple 2 :
          User: "Je suis maçon, fais un devis de 1000 euros pour faire le mur de monsieur Martin."
          Toi: {"nom_client":"Martin","lignes":[{"description":"Construction du mur","prix":1000}]}

          RÉPONDS TOUJOURS DANS CE FORMAT JSON EXACT.`
        },
        { role: 'user', content: prompt || "Message vide" }
      ],
      response_format: { type: "json_object" },
      temperature: 0
    });

    const result = JSON.parse(completion.choices[0].message.content);

    let lignesFinales = result.lignes || [];
    if (!Array.isArray(lignesFinales) || lignesFinales.length === 0) {
       lignesFinales = [{ description: result.description || "Prestation globale", prix: result.montant || 0 }];
    }

    const totalGlobal = lignesFinales.reduce((sum, ligne) => sum + Number(ligne.prix || 0), 0);

    if (userId) {
      await supabase
        .from('devis')
        .insert({
          artisan_id: userId,
          nom_client: result.nom_client || 'Client Inconnu',
          metier: 'Multiservice',
          montant: totalGlobal,
          description: JSON.stringify(lignesFinales)
        });
    }
    
    res.status(200).json({ 
      success: true,
      analyse: {
        nom_client: result.nom_client,
        lignes: lignesFinales,
        montant_total: totalGlobal
      }
    });

  } catch (error) {
    console.error("ERREUR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
