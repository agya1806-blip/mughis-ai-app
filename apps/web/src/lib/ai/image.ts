import type { AIProvider } from "./providers";
import { combineSignals } from "./providers";
import { getConfiguredProvider, getApiKey } from "./index";
import { grokImage } from "./providers/xai";

async function pollinations(prompt: string, w: number, h: number, signal?: AbortSignal) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.slice(0, 500))}?width=${w}&height=${h}&nologo=true&nojson=true`;
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 15000);
    const combined = signal ? combineSignals(signal, ctrl.signal) : ctrl;
    const resp = await fetch(url, { signal: combined.signal, mode: "cors" });
    clearTimeout(timeout);
    if (!resp.ok) return { error: `Error ${resp.status}`, imageUrl: url };
    const ct = resp.headers.get("content-type") || "";
    if (!ct.startsWith("image/")) return { error: "Format tidak terduga", imageUrl: url };
    return { data: await resp.blob() };
  } catch (err: any) {
    if (err.name === "AbortError") return { error: "Timeout" };
    return { error: "Gagal terhubung", imageUrl: url };
  }
}

async function huggingface(prompt: string, model: string, w: number, h: number, signal?: AbortSignal) {
  const key = getApiKey("huggingface");
  try {
    const resp = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(key ? { Authorization: `Bearer ${key}` } : {}) },
      body: JSON.stringify({ inputs: prompt, parameters: { width: w, height: h } }),
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

export async function generateImage(params: {
  prompt: string; model?: string; width?: number; height?: number; provider?: AIProvider; signal?: AbortSignal;
  referenceImages?: { data: Blob; weight?: number }[];
  characterRef?: string;
  strength?: number;
}): Promise<{ data?: Blob; error?: string; imageUrl?: string }> {
  const provider = params.provider || getConfiguredProvider() as AIProvider;
  const w = params.width || 1024;
  const h = params.height || 1024;
  if (provider === "xai") return grokImage({ prompt: params.prompt, width: w, height: h, referenceImages: params.referenceImages, characterRef: params.characterRef, strength: params.strength, signal: params.signal });
  if (provider === "huggingface") {
    return huggingface(params.prompt, params.model || "black-forest-labs/FLUX.1-dev", w, h, params.signal);
  }
  return pollinations(params.prompt, w, h, params.signal);
}

export const IMAGE_MODELS: Record<string, { value: string; label: string }[]> = {
  xai: [{ value: "grok-image", label: "Grok Image" }],
  huggingface: [
    { value: "black-forest-labs/FLUX.1-dev", label: "FLUX.1 Dev (Kualitas)" },
    { value: "black-forest-labs/FLUX.1-schnell", label: "FLUX.1 Schnell (Cepat)" },
    { value: "stabilityai/stable-diffusion-xl-base-1.0", label: "SDXL 1.0" },
    { value: "runwayml/stable-diffusion-v1-5", label: "SD 1.5 (Ringan)" },
  ],
  pollinations: [{ value: "pollinations", label: "Pollinations" }],
};

export const RESOLUTIONS = [
  { label: "Segi Empat (1024×1024)", width: 1024, height: 1024 },
  { label: "Potret (768×1024)", width: 768, height: 1024 },
  { label: "Lanskap (1024×768)", width: 1024, height: 768 },
  { label: "Wide (1280×720)", width: 1280, height: 720 },
  { label: "Standard (512×512)", width: 512, height: 512 },
  { label: "HD (768×768)", width: 768, height: 768 },
];
