"use client";
import { MapPin, Flame } from "lucide-react";

export default function FlavorsAreas() {
  const flavors = [
    { name: "Double Apple", cat: "Fruity", pop: true },
    { name: "Mint", cat: "Fresh", pop: true },
    { name: "Watermelon", cat: "Fruity", pop: true },
    { name: "Grape", cat: "Fruity", pop: true },
    { name: "Blueberry", cat: "Fruity", pop: true },
    { name: "Lemon Mint", cat: "Fresh", pop: true },
    { name: "Paan Raas", cat: "Traditional", pop: true },
    { name: "Rose", cat: "Floral", pop: false },
    { name: "Mango", cat: "Fruity", pop: false },
    { name: "Gum Mint", cat: "Fresh", pop: false },
    { name: "Vanilla", cat: "Sweet", pop: false },
    { name: "Kiwi", cat: "Fruity", pop: false },
  ];

  const areas = [
    "Dubai Marina", "JLT", "JBR", "Downtown", "Business Bay", "DIFC", "Palm Jumeirah", "Jumeirah",
    "Al Barsha", "Dubai Hills", "Arabian Ranches", "Sports City", "Motor City", "JVC", "JVT", "Discovery Gardens",
    "Dubai Silicon Oasis", "International City", "Deira", "Bur Dubai", "Al Karama", "Mirdif"
  ];

  return (
    <>
      <section id="flavors" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/60 mb-4">
                <Flame className="w-4 h-4 text-gold-400" /> 15+ PREMIUM FLAVORS
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold">Flavors that <span className="gold-text">Hit Different</span></h2>
            </div>
            <p className="text-white/50 max-w-md">All flavors are premium quality, 100% tobacco, mixed fresh for each order. Mix & match available.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {flavors.map((f) => (
              <div key={f.name} className="group bg-zinc-900/50 border border-white/5 hover:border-gold-500/30 rounded-2xl p-5 transition-all hover:bg-zinc-900">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-gold-500/10 flex items-center justify-center text-lg">🍃</div>
                  {f.pop && <span className="text-[10px] bg-gold-500/20 text-gold-300 px-2 py-1 rounded-full">POPULAR</span>}
                </div>
                <div className="font-bold">{f.name}</div>
                <div className="text-xs text-white/40 mt-1">{f.cat}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 text-sm text-white/30">+ Custom mixes available on request • Ask on WhatsApp</div>
        </div>
      </section>

      <section id="areas" className="py-20 bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,20,0.08),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/60 mb-4">
              <MapPin className="w-4 h-4 text-gold-400" /> DELIVERY COVERAGE
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">We Deliver <span className="gold-text">Everywhere</span> in Dubai</h2>
            <p className="text-white/50">30-60 minutes delivery. Free delivery above AED 150, otherwise AED 25. Marina, JLT, Downtown in 30-45 mins.</p>
          </div>

          <div className="bg-black border border-white/10 rounded-[2rem] p-8 md:p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {areas.map((area) => (
                <div key={area} className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-full px-4 py-2.5 text-sm hover:bg-white/[0.06] transition-colors">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" /> {area}
                </div>
              ))}
            </div>

            <div className="mt-10 grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-zinc-900 rounded-2xl p-6">
                <div className="text-3xl font-bold gold-text">30-45 min</div>
                <div className="text-sm text-white/50 mt-1">Marina, JLT, JBR, Downtown, Business Bay</div>
              </div>
              <div className="bg-zinc-900 rounded-2xl p-6">
                <div className="text-3xl font-bold gold-text">45-60 min</div>
                <div className="text-sm text-white/50 mt-1">Palm, Jumeirah, Al Barsha, Hills, Ranches</div>
              </div>
              <div className="bg-zinc-900 rounded-2xl p-6">
                <div className="text-3xl font-bold gold-text">Free Delivery</div>
                <div className="text-sm text-white/50 mt-1">Orders above AED 150 • Otherwise AED 25</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
