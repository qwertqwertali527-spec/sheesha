import { NextRequest, NextResponse } from "next/server";
import { getInquiries, saveInquiries } from "@/lib/storage";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const action = searchParams.get("action");

  if (action === "pending") {
    const inquiries = getInquiries();
    const pending = inquiries.filter((inq: any) => {
      if (inq.followUpSent) return false;
      if (inq.status !== 'completed' && inq.status !== 'delivered') return false;
      const created = new Date(inq.createdAt);
      const now = new Date();
      const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
      return diffHours >= 24;
    });

    return NextResponse.json({ count: pending.length, inquiries: pending.slice(0, 10) });
  }

  return NextResponse.json({ message: "Follow-ups API. Use ?action=pending" });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, inquiryId, customMessage } = body;

    if (password !== (process.env.ADMIN_PASSWORD || "admin123")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const inquiries = getInquiries();
    const inquiry: any = inquiries.find((i: any) => i.id === inquiryId);

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    const followUpMessage = customMessage || 
`Hi ${inquiry.name || "there"}! 👋

Hope you enjoyed your sheesha delivery from Dubai Sheesha Delivery! 🌟

We'd love your feedback:
⭐ How was the delivery time?
⭐ Quality of sheesha?
⭐ Overall experience?

Reply with rating 1-5 and we'll give you 10% off next order with code THANKS10!

Thank you for choosing us 🙏
- Dubai Sheesha Team`;

    const phone = inquiry.phoneNumber || inquiry.phone || inquiry.phoneNumber;
    let sent = false;
    
    if (phone) {
      sent = await sendWhatsAppMessage(phone, followUpMessage);
    }

    inquiry.followUpSent = true;
    inquiry.updatedAt = new Date().toISOString();
    saveInquiries(inquiries);

    return NextResponse.json({ 
      success: true, 
      sent,
      message: followUpMessage,
      inquiryId
    });
  } catch (e) {
    console.error("Follow-up error:", e);
    return NextResponse.json({ error: "Failed to send follow-up" }, { status: 500 });
  }
}
