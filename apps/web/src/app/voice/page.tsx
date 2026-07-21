"use client";
import { useState, useRef } from "react";
import { Mic, Play, Square, Download, Upload } from "lucide-react";
import { Card, CardTitle } from "@/components/card";
import { Button } from "@/components/button";
import { Textarea } from "@/components/input";
import { Sidebar, MobileNav } from "@/components/nav";
import { textToSpeech, speechToText } from "@/lib/ai/voice";
import { toast } from "@/lib/toast";

export default function VoicePage() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sttText, setSttText] = useState("");
  const [sttLoading, setSttLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleTTS = async () => {
    if (!text.trim()) { toast.error("Masukkan teks"); return; }
    setLoading(true);
    const res = await textToSpeech(text);
    if (res.error) { toast.error(res.error); setLoading(false); return; }
    if (res.data) {
      const url = URL.createObjectURL(res.data);
      setAudioUrl(url);
      if (audioRef.current) audioRef.current.src = url;
    }
    setLoading(false);
  };

  const handleSTT = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSttLoading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      const res = await speechToText(base64);
      if (res.error) { toast.error(res.error); } else { setSttText(res.text || ""); }
      setSttLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Sidebar /><MobileNav />
      <main className="md:pl-64 min-h-screen p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-xl font-bold text-white">AI Voice</h1>

          <Card className="space-y-4">
            <CardTitle>Text to Speech</CardTitle>
            <Textarea value={text} onChange={setText} placeholder="Teks yang akan diubah menjadi suara..." rows={3} />
            <Button onClick={handleTTS} loading={loading} className="w-full">
              <Play className="w-4 h-4" /> Hasilkan Suara
            </Button>
            {audioUrl && (
              <div className="flex items-center gap-3">
                <audio ref={audioRef} src={audioUrl} controls className="flex-1 h-10" />
                <Button variant="ghost" size="sm" onClick={() => { const a = document.createElement("a"); a.href = audioUrl; a.download = `mughis-tts-${Date.now()}.webm`; a.click(); }}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            )}
          </Card>

          <Card className="space-y-4">
            <CardTitle>Speech to Text</CardTitle>
            <p className="text-sm text-zinc-400">Upload file audio untuk diubah menjadi teks</p>
            <input ref={fileRef} type="file" accept="audio/*" onChange={handleSTT} className="hidden" />
            <Button onClick={() => fileRef.current?.click()} loading={sttLoading} variant="secondary" className="w-full">
              <Upload className="w-4 h-4" /> Upload Audio
            </Button>
            {sttText && (
              <div className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-sm text-zinc-200">{sttText}</div>
            )}
          </Card>
        </div>
      </main>
    </>
  );
}
