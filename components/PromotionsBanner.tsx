"use client";
import { useState, useEffect } from "react";
import { Gift, Clock, Copy, Check, Sparkles } from "lucide-react";
import { formatWhatsAppLink } from "@/lib/utils";

export default function PromotionsBanner() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await fetch("/api/promotions");
      const data = await res.json();
      setPromotions(data.slice(0, 3));
    } catch (e) {
      setPromotions([
        { code: "WELCOME20", title: "20% Off First Order", description: "New customers get 20% off", discountType: "percentage", discountValue: 20, validUntil: new Date(Date.now() + 7*24*60*60*1000).toISOString() },
        { code: "RAMADAN25", title: "AED 25 Off", description: "Orders above AED 200", discountType: "fixed", discountValue: 25, validUntil: new Date(Date.now() + 30*24*60*60*1000).toISOString() },
        { code: "PARTY50", title: "Party Special - AED 50 Off", description: "Party & VIP packages", discountType: "fixed", discountValue: 50, validUntil: new Date(Date.now() + 15*24*60*60*1000).toISOString() }
      ]);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "coupon_copied", metadata: { code } })
    });
  };

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "971501234567";

  return (
    <section className="py-8 bg-gradient-to-r from-zinc-950 via-black to-zinc-950 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center"><Gift className="w-5 h-5 text-black" /></div>
          <div>
            <div className="font-bold flex items-center gap-2">Active Promotions <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">LIVE - PHASE 2</span></div>
            <div className="text-xs text-white/50">Limited time offers - Use code at checkout or WhatsApp</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {promotions.map((promo) => (
            <div key={promo.code} className="relative bg-gradient-to-br from-zinc-900 to-black border border-gold-500/20 rounded-2xl p-5 overflow-hidden group hover:border-gold-500/40 transition-colors">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gold-500/5 rounded-full blur-xl group-hover:bg-gold-500/10 transition-colors" />
              
              <div className="flex justify-between items-start mb-3">
                <div className="bg-gold-500/10 border border-gold-500/20 rounded-full px-3 py-1 text-xs font-bold text-gold-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `AED ${promo.discountValue} OFF`}
                </div>
                <div className="text-[10px] text-white/40 flex items-center gap-1"><Clock className="w-3 h-3" /> Ends {new Date(promo.validUntil).toLocaleDateString()}</div>
              </div>

              <div className="font-bold mb-1">{promo.title}</div>
              <div className="text-xs text-white/50 mb-4">{promo.description}</div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-black border border-dashed border-white/20 rounded-full px-4 py-2.5 font-mono text-sm font-bold tracking-widest flex items-center justify-between">
                  {promo.code}
                  <button onClick={() => copyCode(promo.code)} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                    {copiedCode === promo.code ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <a
                  href={formatWhatsAppLink(waNumber, `Hi! I want to use coupon ${promo.code} for my order`)}
                  target="_blank"
                  className="bg-white text-black px-4 py-2.5 rounded-full text-xs font-bold hover:bg-white/90"
                >
                  Use Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
