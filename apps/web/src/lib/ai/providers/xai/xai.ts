const BASE = "https://api.x.ai/v1";

export function getKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("mughis_key_xai") || "";
}

export async function xaiFetch(
  path: string,
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<Response> {
  const key = getKey();
  if (!key) throw new Error("xAI API key belum diatur");
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
    const resp = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getKey()}`,
      },
      body: JSON.stringify({
        model: "grok-2",
        messages: [{ role: "user", content: "test" }],
        max_tokens: 1,
      }),
    });
    if (!resp.ok) {
      const text = await resp.text();
      let msg: string;
      try { msg = JSON.parse(text).error?.message || JSON.parse(text).error || `HTTP ${resp.status}`; } catch { msg = text || `HTTP ${resp.status}`; }
      return { ok: false, error: msg };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}
