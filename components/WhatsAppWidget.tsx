"use client";
import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { formatWhatsAppLink, DEFAULT_WA_MESSAGE } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome to Dubai Sheesha Delivery! 🌟\n\nWe deliver premium sheesha in 30-60 mins across Dubai.\n\nPackages from AED 99:\n• Classic AED 99\n• Premium ⭐ AED 149 (Popular)\n• Double AED 249\n• Party AED 399\n\nHow can I help you today? Tell me how many sheeshas, your area, and time!",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "971501234567";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          history: messages,
          phone: "website-widget",
        }),
      });

      const data = await res.json();

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply || "Thanks! Our team will assist you shortly.",
            timestamp: new Date().toISOString(),
          },
        ]);
        setIsTyping(false);
      }, 800);
    } catch (e) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Thanks for your message! 😊 Our team will get back to you shortly on WhatsApp. Or click below to continue on WhatsApp directly.",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {isOpen && (
          <div className="w-[380px] max-w-[calc(100vw-2rem)] h-[520px] bg-[#0b141a] rounded-[1.5rem] shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="bg-[#202c33] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">💨</div>
                <div>
                  <div className="font-bold text-white">Sheesha Delivery</div>
                  <div className="text-xs text-white/60 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full" /> AI Assistant • Online
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b141a] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-[#005c4b] text-white rounded-br-sm" : "bg-[#202c33] text-white rounded-bl-sm"}`}>
                    <div className="whitespace-pre-wrap">{m.content}</div>
                    <div className="text-[10px] text-white/40 mt-1 text-right">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#202c33] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-[#202c33] p-3 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-[#2a3942] rounded-full px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none"
              />
              <button onClick={sendMessage} className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="bg-[#202c33] px-4 pb-3">
              <a href={formatWhatsAppLink(waNumber, DEFAULT_WA_MESSAGE)} target="_blank" className="block w-full bg-white/10 hover:bg-white/15 text-white text-center py-2 rounded-full text-xs">
                Continue on WhatsApp →
              </a>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          {!isOpen && (
            <div className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium shadow-xl animate-fade-in hidden md:block">
              Need sheesha? Chat with AI ✨
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] flex items-center justify-center shadow-[0_0_30px_rgba(37,211,102,0.4)] hover:shadow-[0_0_40px_rgba(37,211,102,0.6)] transition-all"
          >
            {isOpen ? <X className="w-7 h-7 text-white" /> : <MessageCircle className="w-7 h-7 text-white" />}
          </button>
        </div>
      </div>

      {/* WhatsApp FAB for mobile - direct link */}
      <a
        href={formatWhatsAppLink(waNumber, DEFAULT_WA_MESSAGE)}
        target="_blank"
        className="fixed bottom-6 left-6 z-40 md:hidden w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_0_20px_rgba(37,211,102,0.4)]"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </a>
    </>
  );
}
