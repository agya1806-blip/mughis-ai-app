"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Image, Video, MessageSquare, Mic, LayoutGrid, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Beranda", icon: Sparkles },
  { href: "/image", label: "Gambar", icon: Image },
  { href: "/video", label: "Video", icon: Video },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/voice", label: "Suara", icon: Mic },
  { href: "/gallery", label: "Galeri", icon: LayoutGrid },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-64 h-screen glass border-r border-zinc-800/50 p-4 shrink-0 fixed left-0 top-0 z-40">
      <Link href="/" className="flex items-center gap-2.5 px-3 py-4 mb-6">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold text-gradient">Mughis AI</span>
      </Link>
      <nav className="flex-1 flex flex-col gap-1">
        {links.map((item) => {
          const active = path === item.href || (item.href !== "/" && path.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50")}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
        <p className="text-xs text-zinc-500">Mughis AI Personal</p>
        <p className="text-xs text-zinc-600 mt-0.5">v1.0.0</p>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const path = usePathname();
  const mainLinks = links.filter((l) => l.href !== "/" && l.href !== "/settings");
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
      <div className="glass border-t border-zinc-800/80 px-2 pt-2 pb-1 flex items-center justify-around">
        <Link href="/" className={cn("flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all",
          path === "/" ? "text-purple-400" : "text-zinc-500 hover:text-zinc-300")}>
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        {mainLinks.slice(0, 4).map((item) => {
          const active = path.startsWith(item.href) && item.href !== "/";
          return (
            <Link key={item.href} href={item.href} className={cn("flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all",
              active ? "text-purple-400" : "text-zinc-500 hover:text-zinc-300")}>
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        <Link href="/settings" className={cn("flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all",
          path === "/settings" ? "text-purple-400" : "text-zinc-500 hover:text-zinc-300")}>
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium">Setting</span>
        </Link>
      </div>
    </nav>
  );
}
