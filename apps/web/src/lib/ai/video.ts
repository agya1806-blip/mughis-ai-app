import type { AIProvider } from "./providers";
import { getConfiguredProvider, getApiKey } from "./index";

async function huggingface(prompt: string, model: string, signal?: AbortSignal) {
  const key = getApiKey("huggingface");
  try {
    const resp = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(key ? { Authorization: `Bearer ${key}` } : {}) },
      body: JSON.stringify({ inputs: prompt }),
      signal,
    });
    if (!resp.ok) {
      const text = await resp.text();
      try { return { error: JSON.parse(text).error || `Error ${resp.status}` }; } catch { return { error: text || `Error ${resp.status}` }; }
    }
    return { data: await resp.blob() };
  } catch (err: any) {
    return { error: err.message || "Gagal" };
  }
}

export async function generateVideo(params: {
  prompt: string; model?: string; provider?: AIProvider; signal?: AbortSignal;
}): Promise<{ data?: Blob; error?: string }> {
  const provider = params.provider || getConfiguredProvider() as AIProvider;
  if (provider === "pollinations") return { error: "Gunakan Hugging Face untuk video" };
  return huggingface(params.prompt, params.model || "stabilityai/stable-video-diffusion-img2vid", params.signal);
}

export const VIDEO_MODELS: Record<string, { value: string; label: string }[]> = {
  huggingface: [
    { value: "stabilityai/stable-video-diffusion-img2vid", label: "Stable Video" },
    { value: "damo-vilab/text-to-video-ms-1.7b", label: "Text-to-Video" },
  ],
  pollinations: [],
};
