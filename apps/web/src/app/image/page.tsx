"use client";
import { useState, useRef } from "react";
import { Sparkles, Download, RefreshCw, Trash2, Clock, StopCircle } from "lucide-react";
import { Card, CardTitle } from "@/components/card";
import { Button } from "@/components/button";
import { Textarea } from "@/components/input";
import { Sidebar, MobileNav } from "@/components/nav";
import { generateImage, IMAGE_MODELS, RESOLUTIONS } from "@/lib/ai";
import { getAll, add, remove } from "@/lib/storage";
import { toast } from "@/lib/toast";

export default function ImagePage() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(IMAGE_MODELS.pollinations[0].value);
  const [res, setRes] = useState(RESOLUTIONS[0]);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState(getAll("image"));
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error("Masukkan prompt"); return; }
    setGenerating(true);
    setResult(null);
    abortRef.current = new AbortController();
    const res2 = await generateImage({ prompt: prompt.trim(), model, width: res.width, height: res.height, signal: abortRef.current.signal });
    if (res2.error && !res2.imageUrl) { toast.error(res2.error); setGenerating(false); return; }
    const url = res2.data ? URL.createObjectURL(res2.data) : res2.imageUrl || "";
    const item = add("image", { prompt: prompt.trim(), url, model });
    setResult(item.url || null);
    setHistory(getAll("image"));
    setGenerating(false);
    toast.success("Gambar selesai!");
  };

  const cancel = () => { abortRef.current?.abort(); setGenerating(false); };

  return (
    <>
      <Sidebar /><MobileNav />
      <main className="md:pl-64 min-h-screen p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-xl font-bold text-white">Buat Gambar</h1>

          <Card className="space-y-4">
            <Textarea value={prompt} onChange={setPrompt} placeholder="Jelaskan gambar yang ingin dibuat..." />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Model</label>
                <select value={model} onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100">
                  {Object.entries(IMAGE_MODELS).flatMap(([prov, models]) =>
                    models.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)
                  )}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Ukuran</label>
                <select value={RESOLUTIONS.indexOf(res)} onChange={(e) => setRes(RESOLUTIONS[+e.target.value])}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100">
                  {RESOLUTIONS.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
                </select>
              </div>
            </div>

            <Button onClick={generating ? cancel : handleGenerate} className="w-full" size="lg">
              {generating ? <><StopCircle className="w-4 h-4" /> Batal</> : <><Sparkles className="w-4 h-4" /> Buat Gambar</>}
            </Button>
          </Card>

          {result && (
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle>Hasil</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { const a = document.createElement("a"); a.href = result; a.download = `mughis-${Date.now()}.png`; a.click(); }}>
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setResult(null)}>
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <img src={result} alt="" className="w-full rounded-xl border border-zinc-700" />
            </Card>
          )}

          {history.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-purple-400" />
                <CardTitle>Riwayat</CardTitle>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {history.map((item) => (
                  <div key={item.id} className="group relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                    {item.url ? (
                      <img src={item.url} alt="" className="w-full aspect-square object-cover" loading="lazy"
                        onClick={() => setResult(item.url || null)} />
                    ) : (
                      <div className="w-full aspect-square bg-zinc-800 flex items-center justify-center text-zinc-600 text-xs">No preview</div>
                    )}
                    <button onClick={() => { remove("image", item.id); setHistory(getAll("image")); }}
                      className="absolute top-1 right-1 p-1 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
