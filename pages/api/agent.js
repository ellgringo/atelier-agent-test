import { createClient } from '@supabase/supabase-js';

// On initialise Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rzuouakyvryuzfurryjk.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Seulement POST' });
  }

  // 🐛 LA CORRECTION EST ICI : on lit "prompt" (pas "message") !
  const { prompt, userId } = req.body;

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
          content: `Tu analyses les demandes de devis. Extrait les infos suivantes:
- nom_client (ex: Dupont)
- metier (ex: plombier)
- montant (nombre uniquement)
- description (résumé court)
Réponds UNIQUEMENT au format JSON strict.`
        },
        { role: 'user', content: prompt || "Message vide" }
      ],
      response_format: { type: "json_object" }, // Sécurité pour forcer le bon format
      temperature: 0
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // --- SAUVEGARDE SUPABASE ---
    if (userId) {
      await supabase
        .from('devis')
        .insert({
          artisan_id: userId,
          nom_client: result.nom_client || 'Client Inconnu',
          metier: result.metier || 'Non précisé',
          montant: Number(result.montant) || 0,
          description: result.description || prompt
        });
    }
    
    // On renvoie bien 'analyse' au site web
    res.status(200).json({ 
      success: true,
      analyse: result 
    });

  } catch (error) {
    console.error("ERREUR:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Erreur inconnue API'
    });
  }
}
