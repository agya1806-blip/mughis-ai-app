import type { AIProvider } from "./providers";
import { getConfiguredProvider, getApiKey } from "./index";
import { grokVideo } from "./providers/xai";

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
  referenceImages?: { data: Blob }[];
  motionStrength?: number;
  cameraMotion?: string;
  characterRef?: string;
}): Promise<{ data?: Blob; error?: string }> {
  const provider = params.provider || getConfiguredProvider() as AIProvider;
  if (provider === "xai") return grokVideo({ prompt: params.prompt, referenceImages: params.referenceImages, motionStrength: params.motionStrength, cameraMotion: params.cameraMotion, characterRef: params.characterRef, signal: params.signal });
  if (provider === "pollinations") return { error: "Gunakan xAI atau Hugging Face untuk video" };
  return huggingface(params.prompt, params.model || "stabilityai/stable-video-diffusion-img2vid", params.signal);
}

export async function imageToVideo(params: {
  imageBlob: Blob; prompt?: string; model?: string; signal?: AbortSignal;
}): Promise<{ data?: Blob; error?: string }> {
  const key = getApiKey("huggingface");
  if (!key) return { error: "Atur Hugging Face key untuk Image-to-Video" };
  try {
    const formData = new FormData();
    formData.append("image", params.imageBlob, "input.png");
    if (params.prompt) formData.append("prompt", params.prompt);
    const resp = await fetch(`https://api-inference.huggingface.co/models/${params.model || "stabilityai/stable-video-diffusion-img2vid"}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: formData,
      signal: params.signal,
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

export const VIDEO_MODELS: Record<string, { value: string; label: string }[]> = {
  xai: [{ value: "grok-video", label: "Grok Video" }],
  huggingface: [
    { value: "stabilityai/stable-video-diffusion-img2vid", label: "Stable Video" },
    { value: "damo-vilab/text-to-video-ms-1.7b", label: "Text-to-Video" },
  ],
  pollinations: [],
};

export const IMG2VID_MODELS = [
  { value: "stabilityai/stable-video-diffusion-img2vid", label: "Stable Video Diffusion" },
  { value: "stabilityai/stable-video-diffusion-img2vid-xt", label: "SVD XT (Better)" },
];
