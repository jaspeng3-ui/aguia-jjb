export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST uniquement" });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "JSON invalide" }); }
  }

  const prompt = body?.prompt;
  const context = body?.context || "";

  if (!prompt || prompt.trim().length < 3) {
    return res.status(400).json({ error: "Prompt trop court" });
  }

  const apiKey = process.env.GEMINI_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_KEY non configuree dans Vercel > Settings > Environment Variables" });
  }

  const systemMsg = "Tu es un assistant de redaction pour le club de Jiu-Jitsu Bresilien Aguia JJB base a Toulon et La Moutonne, France. Redige en francais avec un ton professionnel, chaleureux et dynamique, adapte au monde du sport et des arts martiaux. Sois concis et efficace. " + (context ? "Contexte supplementaire: " + context : "");

  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemMsg }] },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", response.status, JSON.stringify(data));
      const msg = data?.error?.message || "Erreur API " + response.status;
      return res.status(response.status).json({ error: msg });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!text) {
      return res.status(500).json({ error: "Reponse vide de Gemini" });
    }

    return res.status(200).json({ text });
  } catch (e) {
    console.error("Fetch error:", e.message);
    return res.status(500).json({ error: "Erreur reseau: " + e.message });
  }
}
