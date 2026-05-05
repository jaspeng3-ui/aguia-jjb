// api/generate.js — Vercel Serverless Function
// La clé API reste côté serveur, jamais exposée au frontend

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST uniquement" });

  const { prompt, context } = req.body || {};
  if (!prompt || prompt.trim().length < 3) {
    return res.status(400).json({ error: "Le prompt est trop court (min 3 caractères)" });
  }

  const apiKey = process.env.AI_SECRET_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Clé API non configurée — ajoutez AI_SECRET_KEY dans les variables Vercel" });
  }

  const systemPrompt = `Tu es un assistant de rédaction pour le club de Jiu-Jitsu Brésilien "Aguia JJB" basé à Toulon et La Moutonne, France.
Tu rédiges des textes en français, professionnels mais chaleureux, adaptés au monde du sport et des arts martiaux.
Tu peux rédiger : articles de blog, descriptions, annonces d'événements, résultats de compétitions, présentations d'athlètes, textes de bienvenue, etc.
Garde un ton dynamique, motivant et communautaire. Sois concis et efficace.
${context ? "Contexte supplémentaire : " + context : ""}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[AI] API error:", response.status, err);
      if (response.status === 401) return res.status(401).json({ error: "Clé API invalide" });
      if (response.status === 429) return res.status(429).json({ error: "Trop de requêtes — réessayez dans 1 minute" });
      return res.status(500).json({ error: "Erreur API (" + response.status + ")" });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    return res.status(200).json({ text });
  } catch (e) {
    console.error("[AI] Fetch error:", e.message);
    return res.status(500).json({ error: "Erreur réseau : " + e.message });
  }
}
