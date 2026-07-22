const BASE = "https://api.x.ai/v1";

export function getKey(): string {
  // Ambil dari Vercel Environment Variables (sudah kamu tambahkan)
  if (typeof process !== "undefined" && process.env?.XAI_API_KEY) {
    return process.env.XAI_API_KEY;
  }
  
  // Cadangan untuk development
  if (typeof window !== "undefined") {
    return localStorage.getItem("mughis_key_xai") || "";
  }
  
  return "";
}

export async function xaiFetch(
  path: string,
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<Response> {
  const key = getKey();
  if (!key) throw new Error("xAI API key belum diatur. Cek Vercel Environment Variables.");

  const resp = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!resp.ok) {
    const text = await resp.text();
    let msg: string;
    try {
      msg = JSON.parse(text).error?.message || JSON.parse(text).error || `Error ${resp.status}`;
    } catch {
      msg = text || `Error ${resp.status}`;
    }
    throw new Error(msg);
  }
  return resp;
}

export async function testConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    const key = getKey();
    if (!key) {
      return { ok: false, error: "API Key belum terdeteksi di Vercel" };
    }
    // test sederhana
    const resp = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "grok-2",
        messages: [{ role: "user", content: "test" }],
        max_tokens: 1,
      }),
    });
    return { ok: resp.ok };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}
