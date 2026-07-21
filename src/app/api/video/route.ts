import { NextRequest, NextResponse } from "next/server";
import { add } from "@/lib/server/storage";
import { cache } from "@/lib/server/cache";
import { queue } from "@/lib/server/queue";

const HF_API = "https://api-inference.huggingface.co";

queue.register("generate_video", async (task) => {
  const { prompt, model, provider } = task.payload;
  const key = process.env.HF_API_KEY || "";
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
  const buffer = await resp.arrayBuffer();
  return `data:video/mp4;base64,${Buffer.from(buffer).toString("base64")}`;
});

export async function POST(req: NextRequest) {
  try {
    const { prompt, model = "stabilityai/stable-video-diffusion-img2vid", provider = "huggingface" } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const cacheKey = `video:${provider}:${model}:${prompt.slice(0, 100)}`;
    const cached = cache.get<{ url: string }>(cacheKey);
    if (cached) {
      add("generated-videos", { prompt, url: cached.url, model, provider, cached: true });
      add("history", { type: "video", prompt, url: cached.url, model, provider });
      return NextResponse.json({ ...cached, cached: true });
    }

    const task = queue.enqueue("generate_video", { prompt, model, provider });
    return NextResponse.json({ taskId: task.id, status: "queued" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Video generation failed" }, { status: 500 });
  }
}
