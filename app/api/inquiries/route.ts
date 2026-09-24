import { NextRequest, NextResponse } from "next/server";
import { getInquiries, saveInquiries } from "@/lib/storage";
import { getKnowledge, saveKnowledge } from "@/lib/knowledge";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get("type");

  if (type === "knowledge") {
    const kb = getKnowledge();
    return NextResponse.json(kb);
  }

  const inquiries = getInquiries();
  return NextResponse.json(inquiries);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type } = body;

  if (type === "knowledge") {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.ADMIN_PASSWORD || "admin123"}`) {
      // Also check body password for simple admin
      if (body.password !== (process.env.ADMIN_PASSWORD || "admin123")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    saveKnowledge(body.data);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get("id");
  
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const inquiries = getInquiries();
  const filtered = inquiries.filter((i: any) => i.id !== id);
  saveInquiries(filtered);

  return NextResponse.json({ success: true });
}
