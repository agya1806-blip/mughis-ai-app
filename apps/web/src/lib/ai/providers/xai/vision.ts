import { xaiFetch } from "./xai";

async function imageToB64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return `data:${blob.type};base64,${btoa(binary)}`;
}

function visionContent(b64: string, text: string) {
  return [
    { type: "image_url", image_url: { url: b64 } },
    { type: "text", text },
  ];
}

async function analyze(image: Blob, system: string, prompt: string, signal?: AbortSignal) {
  try {
    const b64 = await imageToB64(image);
    const resp = await xaiFetch("/chat/completions", {
      model: "grok-vision",
      messages: [
        { role: "system", content: system },
        { role: "user", content: visionContent(b64, prompt) },
      ],
      max_tokens: 1024,
    }, signal);
    const data = await resp.json();
    return { content: data.choices?.[0]?.message?.content || "" };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function analyzeImage(
  image: Blob,
  signal?: AbortSignal,
) {
  return analyze(
    image,
    "You are an AI image analyst. Describe the image in detail including composition, colors, lighting, subjects, and style.",
    "Analyze this image comprehensively.",
    signal,
  );
}

export async function extractStyle(
  image: Blob,
  signal?: AbortSignal,
) {
  return analyze(
    image,
    "You are a style extraction expert. Describe the artistic style of this image including art movement, technique, color palette, brushwork, and mood. Return ONLY the style description.",
    "Extract the artistic style from this image.",
    signal,
  );
}

export async function extractCharacter(
  image: Blob,
  signal?: AbortSignal,
) {
  return analyze(
    image,
    "You are a character design expert. Describe the character's appearance, features, clothing, pose, and expression in detail. Return a detailed character reference description.",
    "Extract character details from this image.",
    signal,
  );
}

export async function generateCaption(
  image: Blob,
  signal?: AbortSignal,
) {
  return analyze(
    image,
    "You are a creative caption writer. Generate a short, engaging caption for this image.",
    "Generate a caption for this image.",
    signal,
  );
}

export async function visionEnhancePrompt(
  image: Blob,
  prompt: string,
  signal?: AbortSignal,
) {
  return analyze(
    image,
    "You are a prompt engineering expert. Given a reference image and a user prompt, create an enhanced, detailed prompt optimized for AI image generation. Combine the visual elements from the image with the user's intent.",
    `User prompt: "${prompt}".\nAnalyze the reference image and create an enhanced prompt.`,
    signal,
  );
}
