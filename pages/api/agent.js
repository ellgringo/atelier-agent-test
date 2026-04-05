export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Seulement POST' });
  }

  const { message } = req.body;

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
- MONTANT (chiffre)
- DESCRIPTION (travaux)

Réponds JSON pur : {"nom_client":"Dupont","metier":"plombier","montant":450,"description":"Changement chaudière"}`
        },
        { role: 'user', content: message }
      ],
      temperature: 0
    });

    const result = JSON.parse(completion.choices[0].message.content);
    
    res.json({ 
      success: true,
      analyse: result,
      reponse: `✅ Devis ${result.montant || '?'}€ pour ${result.nom_client || 'client'} (${result.metier})`
    });

  } catch (error) {
    console.error("ERREUR OPENAI:", error); // ça va s'afficher dans les logs Vercel
    res.json({ 
      success: false,
      error: error.message || 'Erreur inconnue API'
    });
  }
}
