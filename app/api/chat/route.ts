import { NextRequest, NextResponse } from "next/server";
import { processMessage, generateSummary } from "@/lib/ai-assistant";
import { getConversation, addMessageToConversation, upsertInquiry, getInquiryByPhone } from "@/lib/storage";
import { sendBusinessNotification } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const { message, history, phone } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const phoneKey = phone || "unknown";
    const existingHistory = phone === "website-widget" ? (history || []) : getConversation(phoneKey);
    
    // Normalize history format
    const conversationHistory = existingHistory.map((m: any) => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp || new Date().toISOString()
    }));

    const result = await processMessage(message, conversationHistory, phoneKey);

    // Save to conversation storage if not widget preview
    if (phoneKey !== "website-widget") {
      addMessageToConversation(phoneKey, {
        role: "user",
        content: message,
        timestamp: new Date().toISOString()
      });
      addMessageToConversation(phoneKey, {
        role: "assistant",
        content: result.reply,
        timestamp: new Date().toISOString()
      });
    }

    // Handle inquiry data
    let inquiryId = `INQ-${Date.now().toString(36).toUpperCase()}`;
    const existingInquiry = phoneKey !== "website-widget" ? getInquiryByPhone(phoneKey) : null;
    
    if (existingInquiry) {
      inquiryId = existingInquiry.id;
    }

    const inquiryData = {
      id: inquiryId,
      ...result.inquiry,
      rawMessages: [...conversationHistory, { role: 'user' as const, content: message, timestamp: new Date().toISOString() }],
      status: (result.needsHuman ? 'handover' : result.isComplete ? 'completed' : 'collecting') as any,
      createdAt: existingInquiry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      phoneNumber: phoneKey,
      source: (phoneKey === "website-widget" ? "website" : "whatsapp") as any,
      isComplete: result.isComplete,
      needsHuman: result.needsHuman
    };

    // Only save if meaningful data
    if (phoneKey !== "website-widget" || result.isComplete || result.needsHuman) {
      upsertInquiry(inquiryData as any);

      // If complete or handover, notify business
      if (result.isComplete || result.needsHuman) {
        const summary = generateSummary({ ...result.inquiry, id: inquiryId } as any);
        await sendBusinessNotification(summary);
      }
    }

    return NextResponse.json({
      reply: result.reply,
      inquiry: result.inquiry,
      isComplete: result.isComplete,
      needsHuman: result.needsHuman,
      id: inquiryId
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      reply: "Thanks for your message! Our team will assist you shortly. You can also call us directly.",
      isComplete: false,
      needsHuman: true
    });
  }
}

export async function GET() {
  return NextResponse.json({ status: "AI Assistant API is running", model: process.env.OPENAI_MODEL || "gpt-4o-mini" });
}
