// /api/claude.js
// Route serverless Vercel — proxy sécurisé vers l'API Anthropic
// La clé API reste côté serveur, jamais exposée au navigateur.

export default async function handler(req, res) {
  // --- CORS (autorise ton propre domaine Vercel) ---
  res.setHeader("Access-Control-Allow-Origin", "*"); // en prod : mets ton domaine exact
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // --- Vérifie que la clé est bien configurée côté Vercel ---
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Configuration manquante",
      content: [{ type: "text", text: "Service temporairement indisponible." }],
    });
  }

  try {
    // --- Extrait le payload envoyé par le front ---
    const { messages, system, max_tokens = 1024, model = "claude-haiku-4-5-20251001" } = req.body || {};

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages[] requis" });
    }

    // --- Relaie la requête vers Anthropic ---
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens,
        system,
        messages,
      }),
    });

    const data = await anthropicRes.json();

    // --- Gestion des erreurs côté Anthropic (429, 401, etc.) ---
    if (!anthropicRes.ok) {
      console.error("Anthropic API error:", data);
      return res.status(anthropicRes.status).json({
        error: data?.error?.message || "Erreur API",
        content: [{ type: "text", text: "Le service IA rencontre un souci. Réessaie dans un instant." }],
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({
      error: "Erreur serveur",
      content: [{ type: "text", text: "Erreur de connexion. Réessaie." }],
    });
  }
}
