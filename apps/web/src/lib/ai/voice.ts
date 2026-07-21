import { getApiKey } from "./index";

export async function textToSpeech(text: string, signal?: AbortSignal): Promise<{ data?: Blob; error?: string }> {
  const key = getApiKey("huggingface");
  if (typeof window !== "undefined" && window.speechSynthesis) {
    return browserTTS(text);
  }
  if (!key) return { error: "Browser TTS tidak tersedia. Atur Hugging Face key." };
  try {
    const resp = await fetch("https://api-inference.huggingface.co/models/facebook/mms-tts-eng", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ inputs: text }),
      signal,
    });
    if (!resp.ok) return { error: `Error ${resp.status}` };
    return { data: await resp.blob() };
  } catch (err: any) {
    return { error: err.message || "Gagal" };
  }
}

function browserTTS(text: string): Promise<{ data?: Blob; error?: string }> {
  return new Promise((resolve) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const ac = new AudioContext();
      const dest = ac.createMediaStreamDestination();
      const mr = new MediaRecorder(dest.stream);
      const chunks: BlobPart[] = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => {
        resolve({ data: new Blob(chunks, { type: "audio/webm" }) });
        ac.close();
      };
      mr.onerror = () => { ac.close(); resolve({ error: "Gagal merekam" }); };
      mr.start();
      window.speechSynthesis.speak(utterance);
      utterance.onend = () => setTimeout(() => mr.stop(), 300);
      utterance.onerror = () => { mr.stop(); ac.close(); resolve({ error: "TTS error" }); };
    } catch {
      resolve({ error: "Browser TTS tidak didukung" });
    }
  });
}

export async function speechToText(audioBase64: string, signal?: AbortSignal): Promise<{ text?: string; error?: string }> {
  const key = getApiKey("huggingface");
  if (!key) return { error: "Atur Hugging Face key untuk Speech-to-Text" };
  try {
    const binary = atob(audioBase64.split(",")[1] || audioBase64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const resp = await fetch("https://api-inference.huggingface.co/models/openai/whisper-small", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: bytes,
      signal,
    });
    if (!resp.ok) return { error: `Error ${resp.status}` };
    const data = await resp.json();
    return { text: data.text || "Tidak terdeteksi" };
  } catch (err: any) {
    return { error: err.message || "Gagal" };
  }
}
