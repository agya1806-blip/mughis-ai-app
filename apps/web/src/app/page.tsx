"use client";
import Link from "next/link";
import { Sparkles, Image, Video, MessageSquare, Mic, Wand2, Zap, ChevronRight } from "lucide-react";
import { Sidebar, MobileNav } from "@/components/nav";

export default function HomePage() {
  return (
    <>
      <Sidebar />
      <MobileNav />
      <main className="md:pl-64 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-10 space-y-8">
          <div className="text-center py-8 md:py-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/30 text-purple-400 text-sm font-medium mb-4">
              <Wand2 className="w-4 h-4" />
              Personal AI Assistant
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Selamat Datang di
              <span className="block mt-1 text-gradient">Mughis AI</span>
            </h1>
            <p className="text-zinc-400 max-w-lg mx-auto mb-8">
              Buat gambar, video, chat, dan suara dengan AI. Gratis, tanpa login, langsung pakai.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { href: "/image", label: "Buat Gambar", icon: Image },
                { href: "/video", label: "Buat Video", icon: Video },
                { href: "/chat", label: "AI Chat", icon: MessageSquare },
                { href: "/voice", label: "AI Suara", icon: Mic },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700 text-zinc-200 font-medium hover:bg-zinc-800 hover:border-purple-500/50 transition-all">
                  <item.icon className="w-4 h-4 text-purple-400" />
                  {item.label}
                  <ChevronRight className="w-3 h-3 text-zinc-500" />
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {features.map((f, i) => (
              <div key={i} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center">
                <f.icon className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-zinc-200">{f.title}</h3>
                <p className="text-xs text-zinc-500 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/20 text-center">
            <h2 className="text-lg font-bold text-white mb-2">100% Gratis & Pribadi</h2>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Semua data disimpan di perangkat Anda. Tidak ada server, tidak ada login, tidak ada biaya.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

const features = [
  { icon: Zap, title: "Cepat", desc: "Hasil dalam detik" },
  { icon: Image, title: "Gambar AI", desc: "Flux, SDXL, &更多" },
  { icon: Video, title: "Video AI", desc: "Stable Video" },
  { icon: Mic, title: "Voice AI", desc: "TTS & STT" },
];
