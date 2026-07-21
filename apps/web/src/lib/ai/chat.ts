import type { AIProvider } from "./providers";
import { getConfiguredProvider, getApiKey } from "./index";

export type ChatMessage = { role: "user" | "assistant"; content: string };

async function huggingface(messages: ChatMessage[], model: string, signal?: AbortSignal) {
  const key = getApiKey("huggingface");
  const prompt = messages.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n") + "\nAssistant:";
  try {
    const resp = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(key ? { Authorization: `Bearer ${key}` } : {}) },
      body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 512 } }),
      signal,
    });
    if (!resp.ok) {
      const text = await resp.text();
      try { return { error: JSON.parse(text).error || `Error ${resp.status}` }; } catch { return { error: text || `Error ${resp.status}` }; }
    }
    const result = await resp.json();
    const text = Array.isArray(result) ? result[0]?.generated_text || "" : result.generated_text || "";
    const reply = text.split("Assistant:").pop()?.trim() || text;
    return { content: reply };
  } catch (err: any) {
    return { error: err.message || "Gagal" };
  }
}

async function gemini(messages: ChatMessage[], signal?: AbortSignal) {
  const key = getApiKey("gemini");
  if (!key) return { error: "API key Gemini belum diatur" };
  const contents = messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  try {
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
      signal,
    });
    if (!resp.ok) {
      const text = await resp.text();
      try { return { error: JSON.parse(text).error?.message || `Error ${resp.status}` }; } catch { return { error: text || `Error ${resp.status}` }; }
    }
    const data = await resp.json();
    return { content: data.candidates?.[0]?.content?.parts?.[0]?.text || "Tidak ada respons" };
  } catch (err: any) {
    return { error: err.message || "Gagal" };
  }
}

export async function chat(params: {
  messages: ChatMessage[]; model?: string; provider?: AIProvider; signal?: AbortSignal;
}): Promise<{ content?: string; error?: string }> {
  const provider = params.provider || getConfiguredProvider() as AIProvider;
  if (provider === "pollinations") return { error: "Gunakan Gemini atau Hugging Face untuk chat" };
  if (provider === "huggingface") return huggingface(params.messages, params.model || "microsoft/DialoGPT-medium", params.signal);
  return gemini(params.messages, params.signal);
}

export const CHAT_MODELS: Record<string, { value: string; label: string }[]> = {
  huggingface: [
    { value: "microsoft/DialoGPT-medium", label: "DialoGPT (Ringan)" },
    { value: "microsoft/DialoGPT-large", label: "DialoGPT Large" },
  ],
  gemini: [
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash (Default)" },
  ],
};
