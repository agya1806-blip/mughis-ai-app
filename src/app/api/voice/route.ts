import { NextRequest, NextResponse } from "next/server";
import { add } from "@/lib/server/storage";
import { cache } from "@/lib/server/cache";
import { queue } from "@/lib/server/queue";

const HF_API = "https://api-inference.huggingface.co";

queue.register("generate_voice", async (task) => {
  const { text, model, provider, voice } = task.payload;
  const key = process.env.HF_API_KEY || "";
  const resp = await fetch(`${HF_API}/models/${model}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
    },
    body: JSON.stringify({ inputs: text, parameters: { voice: voice || "default" } }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text.slice(0, 200));
  }
  const buffer = await resp.arrayBuffer();
  return `data:audio/wav;base64,${Buffer.from(buffer).toString("base64")}`;
});

export async function POST(req: NextRequest) {
  try {
    const { text, model = "espnet/kan-bayashi_ljspeech_vits", provider = "huggingface", voice } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const cacheKey = `voice:${provider}:${model}:${text.slice(0, 100)}`;
    const cached = cache.get<{ url: string }>(cacheKey);
    if (cached) {
      add("history", { type: "voice", text, url: cached.url, model, provider, cached: true });
      return NextResponse.json({ ...cached, cached: true });
    }

    const task = queue.enqueue("generate_voice", { text, model, provider, voice });
    return NextResponse.json({ taskId: task.id, status: "queued" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Voice generation failed" }, { status: 500 });
  }
}
