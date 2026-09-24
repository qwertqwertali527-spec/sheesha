"use client";
import { Check, Flame, Crown, Users, PartyPopper, Sparkles } from "lucide-react";
import { formatWhatsAppLink } from "@/lib/utils";
import { getKnowledge } from "@/lib/knowledge";

const iconMap: any = {
  basic: Flame,
  premium: Crown,
  double: Users,
  party: PartyPopper,
  vip: Sparkles,
};

export default function Packages() {
  // For client component, we hardcode same as knowledge.json but could fetch
  const packages = [
    {
      id: "basic",
      name: "Classic Package",
      price: "AED 99",
      originalPrice: "AED 129",
      duration: "3-4 hours",
      includes: ["1 Premium Sheesha", "1 Flavor of Choice", "Natural Charcoal", "Setup & Pickup", "Free Delivery"],
      popular: false,
      bestFor: "1-2 persons",
    },
    {
      id: "premium",
      name: "Premium Package",
      price: "AED 149",
      originalPrice: "AED 199",
      duration: "4-5 hours",
      includes: ["1 Luxury Sheesha", "2 Premium Flavors", "Coconut Charcoal", "Setup & Pickup", "Free Delivery", "Extra Mouth Tips"],
      popular: true,
      bestFor: "2-3 persons",
    },
    {
      id: "double",
      name: "Double Delight",
      price: "AED 249",
      originalPrice: "AED 299",
      duration: "4-5 hours",
      includes: ["2 Premium Sheeshas", "3 Flavors", "Coconut Charcoal", "Setup & Pickup", "Free Delivery", "10% Off Next Order"],
      popular: false,
      bestFor: "3-5 persons, parties",
    },
    {
      id: "party",
      name: "Party Package",
      price: "AED 399",
      originalPrice: "AED 499",
      duration: "5-6 hours",
      includes: ["4 Premium Sheeshas", "5 Flavors Mix", "Unlimited Charcoal", "Professional Attendant 2hrs", "Free Delivery", "Setup & Full Service"],
      popular: false,
      bestFor: "6-10 persons",
    },
    {
      id: "vip",
      name: "VIP Luxury",
      price: "AED 599",
      originalPrice: "AED 750",
      duration: "6+ hours",
      includes: ["3 Luxury Designer Sheeshas", "Unlimited Premium Flavors", "Unlimited Charcoal", "Dedicated Attendant 4hrs", "Free Delivery", "Luxury Setup", "Complimentary Drinks"],
      popular: false,
      bestFor: "VIP events, Yacht, Villa",
    },
  ];

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "971501234567";

  return (
    <section id="packages" className="py-20 bg-gradient-to-b from-black to-zinc-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-4 py-1.5 text-xs text-gold-300 mb-4">
            <Crown className="w-4 h-4" /> PREMIUM PACKAGES
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Choose Your <span className="gold-text">Perfect</span> Experience
          </h2>
          <p className="text-white/60 text-lg">
            From intimate solo sessions to luxury yacht parties. All packages include delivery, setup & pickup.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {packages.map((pkg) => {
            const Icon = iconMap[pkg.id] || Flame;
            return (
              <div
                key={pkg.id}
                className={`relative rounded-[2rem] border p-8 flex flex-col ${
                  pkg.popular
                    ? "bg-gradient-to-b from-zinc-900 to-black border-gold-500/50 shadow-[0_0_50px_rgba(212,175,20,0.15)] lg:scale-105 lg:-mt-4"
                    : "bg-zinc-900/50 border-white/10 hover:border-white/20"
                } transition-all duration-300`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 gold-gradient text-black text-xs font-bold px-4 py-1.5 rounded-full tracking-widest">
                    ⭐ MOST POPULAR
                  </div>
                )}

                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${pkg.popular ? "gold-gradient text-black" : "bg-white/5 text-white/70"}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{pkg.price}</div>
                    <div className="text-sm line-through text-white/30">{pkg.originalPrice}</div>
                  </div>
                </div>

                <h3 className="font-display text-2xl font-bold mb-1">{pkg.name}</h3>
                <div className="flex items-center gap-2 text-sm text-white/50 mb-6">
                  <span className="bg-white/5 rounded-full px-3 py-1">{pkg.duration}</span>
                  <span className="bg-white/5 rounded-full px-3 py-1">{pkg.bestFor}</span>
                </div>

                <div className="space-y-3 mb-8 flex-1">
                  {pkg.includes.map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm text-white/70">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${pkg.popular ? "bg-gold-500/20" : "bg-white/5"}`}>
                        <Check className={`w-3 h-3 ${pkg.popular ? "text-gold-400" : "text-white/50"}`} />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>

                <a
                  href={formatWhatsAppLink(waNumber, `Hi! I want to order ${pkg.name} - ${pkg.price}. Can you help?`)}
                  target="_blank"
                  className={`w-full text-center py-4 rounded-full font-bold transition-all ${
                    pkg.popular
                      ? "gold-gradient text-black hover:opacity-90 shadow-[0_0_20px_rgba(212,175,20,0.3)]"
                      : "bg-white text-black hover:bg-white/90"
                  }`}
                >
                  Order {pkg.name.split(" ")[0]} →
                </a>

                <div className="text-center text-[11px] text-white/30 mt-3">✓ No advance payment • Cash/Card on delivery</div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-gradient-to-r from-zinc-900 to-black border border-white/10 rounded-[1.5rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full gold-gradient flex items-center justify-center text-black text-2xl">🎉</div>
            <div>
              <div className="font-bold text-lg">Need custom package for 10+ people?</div>
              <div className="text-white/50 text-sm">Yacht, villa, corporate events - we handle everything</div>
            </div>
          </div>
          <a
            href={formatWhatsAppLink(waNumber, "Hi! I need a custom package for a large event. Can we discuss?")}
            target="_blank"
            className="bg-white text-black px-8 py-3 rounded-full font-bold whitespace-nowrap hover:bg-white/90"
          >
            Get Custom Quote
          </a>
        </div>
      </div>
    </section>
  );
}
