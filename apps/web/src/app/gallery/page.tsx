"use client";
import { useState, useEffect } from "react";
import { Image, Video, Trash2 } from "lucide-react";
import { Card } from "@/components/card";
import { Sidebar, MobileNav } from "@/components/nav";
import { getAll, remove } from "@/lib/storage";
import { toast } from "@/lib/toast";

type Tab = "image" | "video";

export default function GalleryPage() {
  const [tab, setTab] = useState<Tab>("image");
  const [items, setItems] = useState(getAll(tab));

  useEffect(() => { setItems(getAll(tab)); }, [tab]);

  const handleDelete = (id: string) => {
    remove(tab, id);
    setItems(getAll(tab));
    toast.success("Dihapus");
  };

  return (
    <>
      <Sidebar /><MobileNav />
      <main className="md:pl-64 min-h-screen p-4 md:p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          <h1 className="text-xl font-bold text-white">Galeri</h1>

          <div className="flex gap-1 p-1 bg-zinc-800 rounded-xl w-fit">
            {(["image", "video"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  tab === t ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-300"
                }`}>
                {t === "image" ? <Image className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                {t === "image" ? "Gambar" : "Video"} ({items.length})
              </button>
            ))}
          </div>

          {items.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-zinc-500">Belum ada {tab === "image" ? "gambar" : "video"}</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map((item) => (
                <Card key={item.id} className="p-0 overflow-hidden group">
                  {tab === "image" ? (
                    <img src={item.url} alt="" className="w-full aspect-square object-cover" loading="lazy" />
                  ) : (
                    <video src={item.url} className="w-full aspect-square object-cover" />
                  )}
                  <div className="p-2">
                    <p className="text-xs text-zinc-400 truncate">{item.prompt}</p>
                  </div>
                  <button onClick={() => handleDelete(item.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
