import { NextRequest, NextResponse } from "next/server";
import { parseWhatsAppWebhook, sendWhatsAppMessage, sendBusinessNotification } from "@/lib/whatsapp";
import { processMessage, generateSummary } from "@/lib/ai-assistant";
import { getConversation, addMessageToConversation, getInquiryByPhone, upsertInquiry } from "@/lib/storage";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "sheesha_verify_2024";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("WhatsApp webhook verified");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("WhatsApp webhook body:", JSON.stringify(body, null, 2));

    const parsed = parseWhatsAppWebhook(body);

    if (!parsed) {
      // Could be status update, not a message
      return NextResponse.json({ status: "ok" });
    }

    const { from, text, name } = parsed;

    if (!text) {
      return NextResponse.json({ status: "ok" });
    }

    console.log(`Incoming WhatsApp from ${from} (${name}): ${text}`);

    const history = getConversation(from);
    const result = await processMessage(text, history, from);

    // Save conversation
    addMessageToConversation(from, {
      role: "user",
      content: text,
      timestamp: new Date().toISOString()
    });

    addMessageToConversation(from, {
      role: "assistant",
      content: result.reply,
      timestamp: new Date().toISOString()
    });

    // Handle inquiry
    const existing = getInquiryByPhone(from);
    const inquiryId = existing?.id || `INQ-${Date.now().toString(36).toUpperCase()}`;

    const inquiryData = {
      id: inquiryId,
      name: result.inquiry.name || existing?.name || name,
      ...existing,
      ...result.inquiry,
      rawMessages: [...history, { role: 'user' as const, content: text, timestamp: new Date().toISOString() }],
      status: (result.needsHuman ? 'handover' : result.isComplete ? 'completed' : 'collecting') as any,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      phoneNumber: from,
      source: 'whatsapp' as const,
      isComplete: result.isComplete,
      needsHuman: result.needsHuman
    };

    upsertInquiry(inquiryData as any);

    // Send reply via WhatsApp
    await sendWhatsAppMessage(from, result.reply);

    // If complete or needs human, notify business
    if (result.isComplete || result.needsHuman) {
      const summary = generateSummary({ ...inquiryData } as any);
      const enhancedSummary = `${summary}\n\nCustomer WhatsApp: +${from}\nCustomer Name (WA): ${name}\n\n---\nFull conversation in admin panel: /admin`;
      await sendBusinessNotification(enhancedSummary);
    }

    return NextResponse.json({ status: "ok" });

  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ status: "error", message: String(error) }, { status: 500 });
  }
}
