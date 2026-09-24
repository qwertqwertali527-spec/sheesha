"use client";
import { Clock, Shield, Truck, Star, MessageCircle, Phone } from "lucide-react";
import { formatWhatsAppLink, DEFAULT_WA_MESSAGE } from "@/lib/utils";

export default function Hero() {
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "971501234567";

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-black to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,20,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(212,175,20,0.08),transparent_50%)]" />
      
      {/* Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-gold-500/20 rounded-full px-4 py-1.5 text-xs">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-gold-300">Live Now - Delivering in Dubai • 4PM - 3AM Daily</span>
            </div>

            <div className="space-y-4">
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[0.9] tracking-tight">
                Premium
                <br />
                <span className="gold-text">Sheesha</span>
                <br />
                Delivered
                <br />
                <span className="text-3xl md:text-4xl font-normal text-white/60">in 45 Minutes</span>
              </h1>
              <p className="text-lg text-white/60 max-w-xl leading-relaxed">
                Dubai&apos;s most trusted luxury sheesha delivery. Fully prepared, ready-to-smoke, with professional setup. From <span className="text-white font-semibold">AED 99</span> only.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={formatWhatsAppLink(waNumber, DEFAULT_WA_MESSAGE)}
                target="_blank"
                className="group flex items-center gap-3 bg-[#25D366] hover:bg-[#1da851] text-white px-8 py-4 rounded-full font-bold text-base transition-all shadow-[0_0_30px_rgba(37,211,102,0.3)] hover:shadow-[0_0_40px_rgba(37,211,102,0.5)]"
              >
                <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Order on WhatsApp Now
                <span className="bg-white/20 rounded-full px-2.5 py-0.5 text-xs">24/7 AI</span>
              </a>
              <a
                href="#packages"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white px-8 py-4 rounded-full font-semibold transition-all backdrop-blur"
              >
                View Packages
              </a>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><Clock className="w-5 h-5 text-gold-400" /></div>
                <div><div className="font-bold">30-60 Min</div><div className="text-xs text-white/50">Delivery</div></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><Shield className="w-5 h-5 text-gold-400" /></div>
                <div><div className="font-bold">Licensed</div><div className="text-xs text-white/50">& Hygienic</div></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><Star className="w-5 h-5 text-gold-400" /></div>
                <div><div className="font-bold">4.9/5</div><div className="text-xs text-white/50">2,847 Reviews</div></div>
              </div>
            </div>
          </div>

          {/* Right - Visual */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            <div className="relative w-full max-w-md">
              {/* Glow */}
              <div className="absolute -inset-20 bg-gradient-to-r from-gold-500/20 to-amber-500/20 rounded-full blur-3xl" />
              
              {/* Card Stack */}
              <div className="relative bg-gradient-to-b from-zinc-900 to-black rounded-[2rem] border border-white/10 p-8 shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
                
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-gold-400 text-sm tracking-widest">MOST POPULAR</div>
                      <div className="font-display text-3xl font-bold mt-1">Premium</div>
                      <div className="text-white/50 text-sm">2-3 persons • 4-5 hrs</div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">AED 149</div>
                      <div className="text-sm line-through text-white/40">AED 199</div>
                    </div>
                  </div>

                  <div className="h-48 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl flex items-center justify-center relative overflow-hidden border border-white/5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(212,175,20,0.15),transparent)]" />
                    <div className="text-7xl">💨</div>
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between text-[10px] text-white/30">
                      <span>LUXURY SHEESHA</span><span>EST. DUBAI 2020</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    {["1 Luxury Sheesha", "2 Premium Flavors", "Coconut Charcoal + Setup", "Free Delivery & Pickup"].map((item) => (
                      <div key={item} className="flex items-center gap-3 text-white/70">
                        <div className="w-5 h-5 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0"><span className="text-gold-400 text-xs">✓</span></div>
                        {item}
                      </div>
                    ))}
                  </div>

                  <a href={formatWhatsAppLink(waNumber, "Hi! I want to order Premium Package AED 149")} target="_blank" className="block w-full gold-gradient text-black text-center py-4 rounded-full font-bold hover:opacity-90 transition-opacity">
                    Order Premium Now →
                  </a>

                  <div className="flex items-center justify-center gap-2 text-xs text-white/40">
                    <Truck className="w-4 h-4" /> Free delivery above AED 150 • 45 min avg
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -right-4 top-20 bg-white text-black rounded-full px-4 py-2 text-sm font-bold shadow-xl flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live • 12 orders tonight
              </div>
              <div className="absolute -left-6 bottom-20 bg-zinc-900 border border-white/10 rounded-2xl p-3 shadow-xl">
                <div className="flex items-center gap-3">
                  <img src="https://i.pravatar.cc/100?img=12" alt="customer" className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="text-sm font-bold">Ahmed M.</div>
                    <div className="text-xs text-white/50">Dubai Marina • 5 min ago</div>
                    <div className="flex text-gold-400 text-xs">★★★★★</div>
                  </div>
                </div>
                <div className="text-xs mt-2 text-white/60">“Best delivery! Came in 30 mins, perfect setup 🔥”</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
