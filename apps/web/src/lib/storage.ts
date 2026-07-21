type Item = {
  id: string;
  type: "image" | "video" | "chat";
  prompt: string;
  url?: string;
  data?: string;
  model?: string;
  provider?: string;
  referenceImage?: string;
  referenceVideo?: string;
  referenceStrength?: number;
  created_at: string;
};

function load<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch { return []; }
}

function save<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

export function getAll(type: Item["type"]): Item[] {
  return load<Item>(`mughis_${type}`).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function add(type: Item["type"], item: Partial<Item>): Item {
  const items = load<Item>(`mughis_${type}`);
  const entry: Item = { id: uid(), type, prompt: "", created_at: new Date().toISOString(), ...item };
  save(`mughis_${type}`, [entry, ...items]);
  return entry;
}

export function remove(type: Item["type"], id: string) {
  save(`mughis_${type}`, load<Item>(`mughis_${type}`).filter((i) => i.id !== id));
}

export function clear(type: Item["type"]) {
  save(`mughis_${type}`, []);
}

export function exportData(): string {
  return JSON.stringify({
    images: load("mughis_image"),
    videos: load("mughis_video"),
    chats: load("mughis_chat"),
  });
}

export function importData(json: string): string | null {
  try {
    const data = JSON.parse(json);
    if (data.images) save("mughis_image", data.images);
    if (data.videos) save("mughis_video", data.videos);
    if (data.chats) save("mughis_chat", data.chats);
    return null;
  } catch (e: any) {
    return e.message || "Invalid file";
  }
}

function uid(): string {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
