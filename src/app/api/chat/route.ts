import { NextRequest, NextResponse } from "next/server";
import { add } from "@/lib/server/storage";
import { cache } from "@/lib/server/cache";
import { withRetry } from "@/lib/server/retry";

const HF_API = "https://api-inference.huggingface.co";
const POLLINATIONS_API = "https://text.pollinations.ai";

async function queryHF(prompt: string, model: string, key: string): Promise<string> {
  const resp = await fetch(`${HF_API}/models/${model}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
    },
    body: JSON.stringify({ inputs: prompt }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text.slice(0, 200));
  }
  const data = await resp.json();
  return Array.isArray(data) ? data.map((d: any) => d.generated_text || "").join("\n") : data.generated_text || JSON.stringify(data);
}

async function queryPollinations(prompt: string): Promise<string> {
  const resp = await fetch(`${POLLINATIONS_API}/${encodeURIComponent(prompt)}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!resp.ok) throw new Error(`Pollinations error ${resp.status}`);
  return resp.text();
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, model = "gpt-4o-mini", provider = "pollinations" } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const cacheKey = `chat:${provider}:${model}:${prompt.slice(0, 100)}`;
    const cached = cache.get<string>(cacheKey);
    if (cached) {
      add("history", { type: "chat", prompt, response: cached, model, provider, cached: true });
      return NextResponse.json({ response: cached, cached: true });
    }

    const response = await withRetry(async () => {
      if (provider === "huggingface") {
        const key = process.env.HF_API_KEY || "";
        return queryHF(prompt, model, key);
      }
      return queryPollinations(prompt);
    });

    cache.set(cacheKey, response);
    add("history", { type: "chat", prompt, response, model, provider });

    return NextResponse.json({ response });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Chat generation failed" }, { status: 500 });
  }
}
