"use client";
import { useState, useRef, useCallback } from "react";
import { Sparkles, Download, RefreshCw, Trash2, Clock, StopCircle, Video as VideoIcon, Upload, X, Image as ImageIcon, Film } from "lucide-react";
import { Card, CardTitle } from "@/components/card";
import { Button } from "@/components/button";
import { Textarea } from "@/components/input";
import { Sidebar, MobileNav } from "@/components/nav";
import { generateVideo, VIDEO_MODELS } from "@/lib/ai";
import { getAll, add, remove } from "@/lib/storage";
import { toast } from "@/lib/toast";

type RefItem = { id: string; type: "image" | "video"; url: string; name: string };

export default function VideoPage() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(VIDEO_MODELS.huggingface[0].value);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState(getAll("video"));
  const [references, setReferences] = useState<RefItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);

  const addRef = useCallback((file: File) => {
    const type = file.type.startsWith("video") ? "video" : "image";
    if (type === "image" && !file.type.startsWith("image/")) { toast.error("Format tidak didukung"); return; }
    if (type === "video" && !file.type.startsWith("video/")) { toast.error("Format video tidak didukung"); return; }
    const url = URL.createObjectURL(file);
    setReferences((prev) => [...prev, { id: crypto.randomUUID(), type, url, name: file.name }]);
  }, []);

  const removeRef = useCallback((id: string) => {
    setReferences((prev) => { const item = prev.find((r) => r.id === id); if (item) URL.revokeObjectURL(item.url); return prev.filter((r) => r.id !== id); });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach((f) => addRef(f));
  }, [addRef]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error("Masukkan prompt"); return; }
    setGenerating(true);
    setResult(null);
    abortRef.current = new AbortController();
    const res = await generateVideo({ prompt: prompt.trim(), model, signal: abortRef.current.signal });
    if (res.error) { toast.error(res.error); setGenerating(false); return; }
    if (!res.data) { toast.error("Tidak ada hasil"); setGenerating(false); return; }
    const url = URL.createObjectURL(res.data);
    add("video", { prompt: prompt.trim(), url, model, referenceVideo: references.map((r) => r.url).join(",") });
    setResult(url);
    setHistory(getAll("video"));
    setGenerating(false);
    toast.success("Video selesai!");
  };

  const cancel = () => { abortRef.current?.abort(); setGenerating(false); };

  return (
    <>
      <Sidebar /><MobileNav />
      <main className="md:pl-64 min-h-screen p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-xl font-bold text-white">Buat Video</h1>

          <Card className="space-y-4">
            <Textarea value={prompt} onChange={setPrompt} placeholder="Jelaskan video yang ingin dibuat..." />

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400 uppercase">Model</label>
              <select value={model} onChange={(e) => setModel(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100">
                {Object.entries(VIDEO_MODELS).flatMap(([prov, models]) =>
                  models.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)
                )}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-400 uppercase">References</label>
                {references.length > 0 && (
                  <div className="flex gap-1">
                    <button onClick={() => imgRef.current?.click()} className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded-lg bg-zinc-800 transition-colors">
                      <ImageIcon className="w-3 h-3 inline mr-1" />Gambar
                    </button>
                    <button onClick={() => vidRef.current?.click()} className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1 rounded-lg bg-zinc-800 transition-colors">
                      <Film className="w-3 h-3 inline mr-1" />Video
                    </button>
                  </div>
                )}
              </div>

              {references.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {references.map((ref) => (
                    <div key={ref.id} className="relative group">
                      {ref.type === "image" ? (
                        <img src={ref.url} alt="" className="h-20 w-20 rounded-xl object-cover border border-zinc-700" />
                      ) : (
                        <div className="h-20 w-20 rounded-xl border border-zinc-700 bg-zinc-800 flex items-center justify-center">
                          <video src={ref.url} className="h-full w-full rounded-xl object-cover" />
                        </div>
                      )}
                      <button onClick={() => removeRef(ref.id)}
                        className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] text-zinc-500 mt-0.5 block truncate max-w-20">{ref.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                  dragOver ? "border-purple-500 bg-purple-500/10" : "border-zinc-700 hover:border-zinc-600 bg-zinc-800/30"
                }`}>
                <Upload className="w-5 h-5 text-zinc-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-zinc-500">Drop file atau klik untuk upload</p>
                  <div className="flex gap-2 mt-1">
                    <button onClick={(e) => { e.stopPropagation(); imgRef.current?.click(); }} className="text-[11px] text-zinc-600 hover:text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md">Gambar</button>
                    <button onClick={(e) => { e.stopPropagation(); vidRef.current?.click(); }} className="text-[11px] text-zinc-600 hover:text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md">Video</button>
                  </div>
                </div>
              </div>
              <input ref={imgRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) addRef(f); e.target.value = ""; }} className="hidden" />
              <input ref={vidRef} type="file" accept="video/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) addRef(f); e.target.value = ""; }} className="hidden" />
            </div>

            <Button onClick={generating ? cancel : handleGenerate} className="w-full" size="lg" variant="secondary">
              {generating ? <><StopCircle className="w-4 h-4" /> Batal</> : <><Sparkles className="w-4 h-4" /> Buat Video</>}
            </Button>
          </Card>

          {result && (
            <Card className="space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle>Hasil</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => { const a = document.createElement("a"); a.href = result; a.download = `mughis-${Date.now()}.mp4`; a.click(); }}>
                  <Download className="w-3 h-3" />
                </Button>
              </div>
              <video src={result} controls className="w-full rounded-xl border border-zinc-700" />
            </Card>
          )}

          {history.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-indigo-400" />
                <CardTitle>Riwayat</CardTitle>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {history.map((item) => (
                  <div key={item.id} className="group relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                    {item.url ? (
                      <video src={item.url} className="w-full aspect-square object-cover" onClick={() => setResult(item.url || null)} />
                    ) : (
                      <div className="w-full aspect-square bg-zinc-800 flex items-center justify-center"><VideoIcon className="w-6 h-6 text-zinc-600" /></div>
                    )}
                    <button onClick={() => { remove("video", item.id); setHistory(getAll("video")); }}
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
