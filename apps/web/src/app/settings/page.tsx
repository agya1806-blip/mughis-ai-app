"use client";
import { useState, useRef } from "react";
import { Key, Download, Upload, Eye, EyeOff, ExternalLink } from "lucide-react";
import { Card, CardTitle } from "@/components/card";
import { Button } from "@/components/button";
import { Sidebar, MobileNav } from "@/components/nav";
import { PROVIDERS, getConfiguredProvider, setProvider, getApiKey, setApiKey } from "@/lib/ai";
import { exportData, importData } from "@/lib/storage";
import { toast } from "@/lib/toast";

export default function SettingsPage() {
  const [provider, setProv] = useState(getConfiguredProvider);
  const [hfKey, setHfKey] = useState(getApiKey("huggingface"));
  const [geminiKey, setGeminiKey] = useState(getApiKey("gemini"));
  const [showKey, setShowKey] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const save = () => {
    setProvider(provider);
    setApiKey("huggingface", hfKey);
    setApiKey("gemini", geminiKey);
    toast.success("Pengaturan disimpan");
  };

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `mughis-backup-${Date.now()}.json`;
    a.click();
    toast.success("Data diekspor");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const err = importData(ev.target?.result as string);
      if (err) toast.error(err);
      else { toast.success("Data diimpor"); setTimeout(() => window.location.reload(), 1000); }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Sidebar /><MobileNav />
      <main className="md:pl-64 min-h-screen p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-xl font-bold text-white">Pengaturan</h1>

          <Card className="space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-400" />
              <CardTitle>Penyedia AI</CardTitle>
            </div>

            <div className="flex flex-wrap gap-2">
              {PROVIDERS.map((p) => (
                <button key={p.value} onClick={() => setProv(p.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                    provider === p.value
                      ? "bg-purple-600 text-white border-purple-500"
                      : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-600"
                  }`}>
                  <div>{p.label}</div>
                  <div className={`text-[10px] ${provider === p.value ? "text-purple-200" : "text-zinc-500"}`}>{p.desc}</div>
                </button>
              ))}
            </div>

            {provider !== "pollinations" && (
              <div className="space-y-3 p-3 rounded-xl bg-zinc-800/30 border border-zinc-800">
                <p className="text-sm text-zinc-400">Dapatkan token gratis di <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener" className="text-purple-400 inline-flex items-center gap-0.5">Hugging Face <ExternalLink className="w-3 h-3" /></a></p>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input type={showKey ? "text" : "password"} value={hfKey} onChange={(e) => setHfKey(e.target.value)}
                      placeholder="hf_xxxxxxxxxxxx" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-100 pr-10" />
                    <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-zinc-400">Atau gunakan <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="text-purple-400 inline-flex items-center gap-0.5">Gemini API Key <ExternalLink className="w-3 h-3" /></a> untuk chat</p>
                <input type="password" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..." className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-100" />
              </div>
            )}

            {provider === "pollinations" && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-400">
                Pollinations gratis, tanpa perlu API key!
              </div>
            )}

            <Button onClick={save} className="w-full">Simpan Pengaturan</Button>
          </Card>

          <Card className="space-y-4">
            <CardTitle>Data</CardTitle>
            <p className="text-sm text-zinc-400">Ekspor/Impor data ke perangkat lain</p>
            <div className="flex gap-3">
              <Button onClick={handleExport} variant="secondary"><Download className="w-4 h-4" /> Ekspor</Button>
              <Button onClick={() => fileRef.current?.click()} variant="secondary"><Upload className="w-4 h-4" /> Impor</Button>
              <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
