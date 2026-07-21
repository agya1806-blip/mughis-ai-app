export { generateImage, IMAGE_MODELS, RESOLUTIONS } from "./image";
export { generateVideo, VIDEO_MODELS } from "./video";
export { chat, CHAT_MODELS } from "./chat";
export { textToSpeech, speechToText } from "./voice";
export type { AIProvider } from "./providers";

export const PROVIDERS = [
  { value: "pollinations" as const, label: "Pollinations.ai", desc: "Gratis, tanpa API key", free: true },
  { value: "huggingface" as const, label: "Hugging Face", desc: "Perlu token gratis", free: true },
];

export function getConfiguredProvider(): string {
  if (typeof window === "undefined") return "pollinations";
  return localStorage.getItem("mughis_provider") || "pollinations";
}

export function setProvider(p: string) {
  localStorage.setItem("mughis_provider", p);
}

export function getApiKey(provider: string): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(`mughis_key_${provider}`) || "";
}

export function setApiKey(provider: string, key: string) {
  if (key) localStorage.setItem(`mughis_key_${provider}`, key);
  else localStorage.removeItem(`mughis_key_${provider}`);
}
