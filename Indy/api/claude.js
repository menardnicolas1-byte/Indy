// /api/claude.js
// Proxy serveur entre l'app INDY et l'API Anthropic.
// La clé API ANTHROPIC_API_KEY reste cote serveur, jamais exposee au navigateur.

export default async function handler(req, res) {
  // CORS : autorise le front
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      content: [{ type: "text", text: "Methode non autorisee." }],
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY manquante dans les variables d'environnement Vercel");
    return res.status(500).json({
      error: "Configuration manquante",
      content: [{ type: "text", text: "Service indisponible. Contacte le support." }],
    });
  }

  try {
    // Recuperer le body (peut arriver en string ou en objet selon Vercel)
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (!body || !body.messages || !Array.isArray(body.messages)) {
      return res.status(400).json({
        error: "Requete invalide",
        content: [{ type: "text", text: "Requete invalide." }],
      });
    }

    // Relais vers Anthropic en ajoutant la cle cote serveur
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      console.error("Anthropic API error:", anthropicRes.status, data);
      return res.status(anthropicRes.status).json({
        error: data?.error?.message || "Erreur API",
        content: [{ type: "text", text: "Le service IA rencontre un souci. Reessaie dans un instant." }],
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({
      error: "Erreur serveur",
      content: [{ type: "text", text: "Erreur de connexion. Reessaie." }],
    });
  }
}
