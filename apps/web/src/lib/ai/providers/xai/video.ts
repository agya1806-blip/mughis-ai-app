import { xaiFetch } from "./xai";

export const CAMERA_MOTIONS = [
  { value: "none", label: "No Motion" },
  { value: "zoom_in", label: "Zoom In" },
  { value: "zoom_out", label: "Zoom Out" },
  { value: "pan_left", label: "Pan Left" },
  { value: "pan_right", label: "Pan Right" },
  { value: "orbit", label: "Orbit" },
  { value: "drone", label: "Drone" },
  { value: "handheld", label: "Handheld" },
] as const;

function cameraMotionDescription(motion: string): string {
  const map: Record<string, string> = {
    zoom_in: "The camera smoothly zooms in on the subject, drawing closer with a slow, cinematic movement.",
    zoom_out: "The camera smoothly zooms out, revealing more of the environment around the subject.",
    pan_left: "The camera pans to the left, tracking the scene horizontally with steady motion.",
    pan_right: "The camera pans to the right, tracking the scene horizontally with steady motion.",
    orbit: "The camera orbits around the subject in a smooth circular path, revealing all angles.",
    drone: "The camera moves like a drone, swooping and gliding through the scene with dynamic aerial movement.",
    handheld: "The camera has a subtle handheld feel with slight natural wobble for an intimate, documentary-style look.",
  };
  return map[motion] || "";
}

export async function grokVideo(params: {
  prompt: string;
  referenceImages?: { data: Blob }[];
  referenceVideo?: Blob;
  motionStrength?: number;
  cameraMotion?: string;
  characterRef?: string;
  signal?: AbortSignal;
}): Promise<{ data?: Blob; error?: string }> {
  try {
    const promptParts: string[] = [params.prompt];

    if (params.cameraMotion && params.cameraMotion !== "none") {
      promptParts.push(`[Camera: ${cameraMotionDescription(params.cameraMotion)}]`);
    }

    if (params.motionStrength !== undefined) {
      promptParts.push(`[Motion strength: ${params.motionStrength}%]`);
    }

    if (params.characterRef) {
      promptParts.push(`[Character consistency: ${params.characterRef}]`);
    }

    const messages: { role: string; content: string | { type: string; text?: string; image_url?: { url: string } }[] }[] = [];

    if (params.referenceImages && params.referenceImages.length > 0) {
      const content: { type: string; text?: string; image_url?: { url: string } }[] = [];
      for (const ref of params.referenceImages) {
        const b64 = await blobToB64(ref.data);
        content.push({ type: "image_url", image_url: { url: b64 } });
      }
      content.push({ type: "text", text: promptParts.join(" ") });
      messages.push({ role: "user", content });
    } else {
      messages.push({ role: "user", content: promptParts.join(" ") });
    }

    const resp = await xaiFetch("/chat/completions", {
      model: "grok-video",
      messages,
      max_tokens: 2048,
    }, params.signal);

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content || "";

    const vidUrl = extractMediaUrl(text);
    if (vidUrl) {
      const vidResp = await fetch(vidUrl, { signal: params.signal });
      if (vidResp.ok) return { data: await vidResp.blob() };
    }
    return { error: "Tidak ada video dalam respons" };
  } catch (err: any) {
    return { error: err.message };
  }
}

async function blobToB64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return `data:${blob.type};base64,${btoa(binary)}`;
}

function extractMediaUrl(text: string): string | null {
  const md = text.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
  if (md) return md[1];
  const raw = text.match(/(https?:\/\/[^\s)]+\.(mp4|webm|mov|avi|gif))/i);
  if (raw) return raw[1];
  const anyUrl = text.match(/(https?:\/\/[^\s)]+)/);
  if (anyUrl) return anyUrl[1];
  return null;
}
