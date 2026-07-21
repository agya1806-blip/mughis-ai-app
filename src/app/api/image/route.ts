import { NextRequest, NextResponse } from "next/server";
import { add } from "@/lib/server/storage";
import { cache } from "@/lib/server/cache";
import { queue } from "@/lib/server/queue";
import { withRetry } from "@/lib/server/retry";

const HF_API = "https://api-inference.huggingface.co";
const POLLINATIONS_IMG = "https://image.pollinations.ai/prompt";

async function generateHFImage(prompt: string, model: string, key: string, width = 1024, height = 1024): Promise<string> {
  const resp = await fetch(`${HF_API}/models/${model}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
    },
    body: JSON.stringify({ inputs: prompt, parameters: { width, height } }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text.slice(0, 200));
  }
  const buffer = await resp.arrayBuffer();
  return `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
}

function pollinationsUrl(prompt: string, width = 1024, height = 1024): string {
  return `${POLLINATIONS_IMG}/${encodeURIComponent(prompt.slice(0, 500))}?width=${width}&height=${height}&nologo=true&nojson=true`;
}

queue.register("generate_image", async (task) => {
  const { prompt, model, provider, width, height } = task.payload;
  if (provider === "huggingface") {
    const key = process.env.HF_API_KEY || "";
    return generateHFImage(prompt, model, key, width, height);
  }
  const url = pollinationsUrl(prompt, width, height);
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Pollinations error ${resp.status}`);
  const buffer = await resp.arrayBuffer();
  return `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
});

export async function POST(req: NextRequest) {
  try {
    const { prompt, model = "black-forest-labs/FLUX.1-dev", provider = "pollinations", width = 1024, height = 1024 } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const cacheKey = `image:${provider}:${model}:${prompt.slice(0, 100)}:${width}x${height}`;
    const cached = cache.get<{ url: string }>(cacheKey);
    if (cached) {
      add("generated-images", { prompt, url: cached.url, model, provider, width, height, cached: true });
      add("history", { type: "image", prompt, url: cached.url, model, provider });
      return NextResponse.json({ ...cached, cached: true });
    }

    if (provider === "pollinations") {
      const url = pollinationsUrl(prompt, width, height);
      const result = await withRetry(async () => {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Pollinations error ${resp.status}`);
        const buffer = await resp.arrayBuffer();
        return `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;
      });
      const data = { url: result };
      cache.set(cacheKey, data);
      add("generated-images", { prompt, url: result, model, provider, width, height });
      add("history", { type: "image", prompt, url: result, model, provider });
      return NextResponse.json(data);
    }

    const task = queue.enqueue("generate_image", { prompt, model, provider, width, height });
    return NextResponse.json({ taskId: task.id, status: "queued" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Image generation failed" }, { status: 500 });
  }
}
