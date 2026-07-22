export { generateImage, IMAGE_MODELS, RESOLUTIONS } from "./image";
export { generateVideo, imageToVideo, VIDEO_MODELS, IMG2VID_MODELS } from "./video";
export { chat, CHAT_MODELS } from "./chat";
export { textToSpeech, speechToText } from "./voice";
export type { AIProvider } from "./providers";
export {
  grokChat,
  enhancePrompt,
  generateNegativePrompt,
  generateMotionPrompt,
  grokImage,
  grokVideo,
  CAMERA_MOTIONS,
  analyzeImage,
  extractStyle,
  extractCharacter,
  generateCaption,
  visionEnhancePrompt,
  testConnection as testXaiConnection,
} from "./providers/xai";

export const PROVIDERS = [
  { value: "pollinations" as const, label: "Pollinations.ai", desc: "Gratis, tanpa API key", free: true },
  { value: "huggingface" as const, label: "Hugging Face", desc: "Perlu token gratis", free: true },
  { value: "xai" as const, label: "xAI (Grok)", desc: "Grok 4.5, Image, Video", free: false },
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
