import { NextRequest, NextResponse } from "next/server";
import { getAll, remove } from "@/lib/server/storage";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
    const offset = parseInt(searchParams.get("offset") || "0");

    let results: any[] = [];

    if (type === "all" || type === "chat") {
      results = [...results, ...getAll("history").filter((h: any) => h.type === "chat")];
    }
    if (type === "all" || type === "image") {
      results = [...results, ...getAll("history").filter((h: any) => h.type === "image")];
      results = [...results, ...getAll("generated-images").map((h: any) => ({ ...h, type: "image" }))];
    }
    if (type === "all" || type === "video") {
      results = [...results, ...getAll("history").filter((h: any) => h.type === "video")];
      results = [...results, ...getAll("generated-videos").map((h: any) => ({ ...h, type: "video" }))];
    }
    if (type === "all" || type === "voice") {
      results = [...results, ...getAll("history").filter((h: any) => h.type === "voice")];
    }
    if (type === "prompts") {
      results = getAll("prompts");
    }

    results.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    const total = results.length;
    const paginated = results.slice(offset, offset + limit);

    return NextResponse.json({ data: paginated, total, limit, offset });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch history" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type") || "history";

    if (id) {
      remove(type, id);
    } else {
      const body = await req.json().catch(() => ({}));
      const { ids } = body;
      if (ids && Array.isArray(ids)) {
        ids.forEach((itemId: string) => remove(type, itemId));
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete" }, { status: 500 });
  }
}
