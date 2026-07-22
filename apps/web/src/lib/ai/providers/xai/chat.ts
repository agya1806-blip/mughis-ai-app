import { xaiFetch } from "./xai";
import type { ChatMessage } from "../../chat";

export async function grokChat(
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<{ content?: string; error?: string }> {
  try {
    const resp = await xaiFetch("/chat/completions", {
      model: "grok-4.5",
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: 1024,
    }, signal);
    const data = await resp.json();
    return { content: data.choices?.[0]?.message?.content || "" };
  } catch (err: any) {
    return { error: err.message };
  }
}

const ENHANCE_SYSTEM = "You are a prompt engineering expert. Enhance the following prompt to be more detailed, vivid, and effective for AI image generation. Return ONLY the enhanced prompt, no explanation.";

export async function enhancePrompt(
  prompt: string,
  signal?: AbortSignal,
): Promise<{ content?: string; error?: string }> {
  try {
    const resp = await xaiFetch("/chat/completions", {
      model: "grok-4.5",
      messages: [
        { role: "system", content: ENHANCE_SYSTEM },
        { role: "user", content: prompt },
      ],
      max_tokens: 512,
    }, signal);
    const data = await resp.json();
    return { content: data.choices?.[0]?.message?.content || prompt };
  } catch (err: any) {
    return { error: err.message };
  }
}

const NEGATIVE_SYSTEM = "Generate a comma-separated list of negative prompt keywords for AI image generation. Return ONLY the keywords, no explanation.";

export async function generateNegativePrompt(
  prompt: string,
  signal?: AbortSignal,
): Promise<{ content?: string; error?: string }> {
  try {
    const resp = await xaiFetch("/chat/completions", {
      model: "grok-4.5",
      messages: [
        { role: "system", content: NEGATIVE_SYSTEM },
        { role: "user", content: `Original prompt: ${prompt}` },
      ],
      max_tokens: 256,
    }, signal);
    const data = await resp.json();
    return { content: data.choices?.[0]?.message?.content || "" };
  } catch (err: any) {
    return { error: err.message };
  }
}

const MOTION_SYSTEM = "Generate a camera motion description for AI video generation based on the user's prompt. Consider camera moves like zoom, pan, orbit, dolly, handheld. Return ONLY the motion description (2-3 sentences), no explanation.";

export async function generateMotionPrompt(
  prompt: string,
  signal?: AbortSignal,
): Promise<{ content?: string; error?: string }> {
  try {
    const resp = await xaiFetch("/chat/completions", {
      model: "grok-4.5",
      messages: [
        { role: "system", content: MOTION_SYSTEM },
        { role: "user", content: prompt },
      ],
      max_tokens: 256,
    }, signal);
    const data = await resp.json();
    return { content: data.choices?.[0]?.message?.content || "" };
  } catch (err: any) {
    return { error: err.message };
  }
}
