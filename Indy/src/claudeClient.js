// lib/claudeClient.js
// Helper centralisé pour tous les appels IA depuis le front INDY.
// Remplace les 4 fetch("https://api.anthropic.com...") dans ton code.

export async function askClaude({ messages, system, maxTokens = 1024 }) {
  try {
    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        system,
        max_tokens: maxTokens,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      // Le proxy renvoie déjà un fallback dans "content", on le remonte tel quel
      return json;
    }

    return json;
  } catch (err) {
    console.error("askClaude error:", err);
    return {
      content: [{ type: "text", text: "Erreur de connexion. Réessaie." }],
    };
  }
}

// Extrait proprement le texte de la réponse
export function extractText(response) {
  return response?.content?.map((b) => b.text || "").join("") || "";
}
