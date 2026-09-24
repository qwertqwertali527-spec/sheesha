import { NextRequest, NextResponse } from "next/server";
import { getKnowledge, saveKnowledge } from "@/lib/knowledge";

export async function POST(req: NextRequest) {
  const { password, action, data } = await req.json();

  if (password !== (process.env.ADMIN_PASSWORD || "admin123")) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  if (action === "getKnowledge") {
    return NextResponse.json(getKnowledge());
  }

  if (action === "saveKnowledge") {
    saveKnowledge(data);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
