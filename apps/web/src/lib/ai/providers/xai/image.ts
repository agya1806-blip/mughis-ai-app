import { xaiFetch } from "./xai";

export async function grokImage(params: {
  prompt: string;
  width?: number;
  height?: number;
  referenceImages?: { data: Blob; weight?: number }[];
  characterRef?: string;
  strength?: number;
  signal?: AbortSignal;
}): Promise<{ data?: Blob; error?: string }> {
  try {
    const messages: { role: string; content: string | { type: string; text?: string; image_url?: { url: string } }[] }[] = [];

    const content: { type: string; text?: string; image_url?: { url: string } }[] = [];

    if (params.referenceImages && params.referenceImages.length > 0) {
      for (const ref of params.referenceImages) {
        const b64 = await blobToBase64(ref.data);
        content.push({
          type: "image_url",
          image_url: { url: b64 },
        });
      }
    }

    const promptParts: string[] = [params.prompt];
    if (params.characterRef) promptParts.push(`[Character ref: ${params.characterRef}]`);
    if (params.strength !== undefined) promptParts.push(`[Reference strength: ${params.strength}%]`);

    content.push({ type: "text", text: promptParts.join(" ") });
    messages.push({ role: "user", content });

    const resp = await xaiFetch("/chat/completions", {
      model: "grok-image",
      messages,
      max_tokens: 2048,
    }, params.signal);

    const data = await resp.json();
    const text = data.choices?.[0]?.message?.content || "";

    const imgUrl = extractImageUrl(text);
    if (imgUrl) {
      const imgResp = await fetch(imgUrl, { signal: params.signal });
      if (imgResp.ok) return { data: await imgResp.blob() };
    }
    return { error: "Tidak ada gambar dalam respons" };
  } catch (err: any) {
    return { error: err.message };
  }
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const b64 = btoa(binary);
  return `data:${blob.type};base64,${b64}`;
}

function extractImageUrl(text: string): string | null {
  const md = text.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
  if (md) return md[1];
  const raw = text.match(/(https?:\/\/[^\s)]+\.(png|jpg|jpeg|gif|webp))/i);
  if (raw) return raw[1];
  return null;
}
