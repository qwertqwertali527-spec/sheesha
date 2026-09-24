"use client";
import { useState } from "react";
import { ChevronDown, MessageCircle, MapPin, Truck, PartyPopper } from "lucide-react";
import { formatWhatsAppLink } from "@/lib/utils";

export default function HowItWorksFAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const steps = [
    { n: 1, title: "Choose Package", desc: "Browse packages on website", icon: PartyPopper },
    { n: 2, title: "WhatsApp Us", desc: "Click WhatsApp & share details. AI helps instantly", icon: MessageCircle },
    { n: 3, title: "We Deliver", desc: "Fresh sheesha prepared & delivered in 30-60 mins", icon: Truck },
    { n: 4, title: "Enjoy & Pickup", desc: "Smoke, relax, we collect equipment later", icon: MapPin },
  ];

  const faqs = [
    { q: "How quickly can you deliver?", a: "We deliver within 30-60 minutes across most Dubai areas. Marina, JLT, JBR, Downtown, Business Bay usually 30-45 mins. Other areas up to 60 mins." },
    { q: "What's included in the delivery?", a: "Fully prepared sheesha ready to smoke, natural charcoal, tongs, mouth tips, setup by our driver, and pickup later. You just enjoy!" },
    { q: "Do you have a minimum order?", a: "No minimum, but free delivery for orders above AED 150. Otherwise AED 25 delivery fee." },
    { q: "How long does one sheesha last?", a: "Classic lasts 3-4 hours, Premium 4-5 hours with charcoal refills included. We provide extra charcoal." },
    { q: "Is it legal and hygienic?", a: "Yes, we are fully licensed for tobacco delivery in Dubai. All sheeshas are sanitized, with disposable hoses and mouth tips. We follow Dubai Municipality hygiene standards." },
    { q: "Can I order for a yacht or villa party?", a: "Absolutely! We specialize in yacht, villa, and event deliveries. Our Party and VIP packages include attendant service." },
    { q: "What payment methods?", a: "Cash on delivery, card on delivery, bank transfer, and coming soon online payment. No advance needed for regular orders." },
    { q: "Can I request a specific time?", a: "Yes, you can schedule delivery for later today or future date. Just let us know date and time in WhatsApp." },
  ];

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "971501234567";

  return (
    <>
      <section id="how-it-works" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">How It <span className="gold-text">Works</span></h2>
            <p className="text-white/50 max-w-2xl mx-auto">4 simple steps to get premium sheesha at your door. Our AI assistant makes ordering super easy on WhatsApp.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute top-16 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.n} className="relative text-center group">
                  <div className="w-20 h-20 mx-auto bg-zinc-900 border border-white/10 group-hover:border-gold-500/30 rounded-full flex items-center justify-center mb-6 relative z-10 transition-colors">
                    <Icon className="w-8 h-8 text-gold-400" />
                    <div className="absolute -top-2 -right-2 w-7 h-7 gold-gradient rounded-full flex items-center justify-center text-black font-bold text-sm">{step.n}</div>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-white/50">{step.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-16 bg-gradient-to-r from-gold-500/10 via-amber-500/10 to-gold-500/10 border border-gold-500/20 rounded-[1.5rem] p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center text-2xl flex-shrink-0">🤖</div>
            <div className="flex-1">
              <div className="font-bold text-lg">Meet Our AI Assistant - Order in 30 seconds!</div>
              <div className="text-white/60 text-sm mt-1">Our AI on WhatsApp collects your details automatically: name, location, time, package, flavors. No forms, no waiting. Just chat like a human! Plus instant human handover when needed.</div>
            </div>
            <a href={formatWhatsAppLink(waNumber, "Hi! I need sheesha delivery tonight")} target="_blank" className="bg-[#25D366] text-white px-8 py-3 rounded-full font-bold whitespace-nowrap flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> Try AI Assistant
            </a>
          </div>
        </div>
      </section>

      <section id="faqs" className="py-20 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Got <span className="gold-text">Questions?</span></h2>
            <p className="text-white/50">Everything you need to know about our delivery service</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-black border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-semibold pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-white/40 flex-shrink-0 transition-transform ${openFaq === idx ? "rotate-180" : ""}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-white/60 text-sm leading-relaxed animate-fade-in">{faq.a}</div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-white/40 text-sm mb-4">Still have questions? Our team is available 4PM - 3AM</p>
            <a href={formatWhatsAppLink(waNumber, "Hi! I have a question about your service")} target="_blank" className="inline-flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-bold">
              <MessageCircle className="w-5 h-5" /> Ask on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
