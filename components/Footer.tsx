"use client";
import { MessageCircle, Phone, Mail, MapPin, Clock, Shield } from "lucide-react";
import { formatWhatsAppLink, DEFAULT_WA_MESSAGE } from "@/lib/utils";

export default function Footer() {
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "971501234567";

  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center font-bold text-black text-xl">S</div>
              <div>
                <div className="font-display font-bold text-lg leading-none">SHEESHA DELIVERY DUBAI</div>
                <div className="text-[10px] tracking-[0.2em] text-gold-400">PREMIUM • LICENSED • 24/7 AI</div>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-md mb-6">
              Dubai&apos;s most trusted premium sheesha home delivery service. Licensed, hygienic, and 5-star rated. Delivering happiness to your door in 45 minutes since 2020.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={formatWhatsAppLink(waNumber, DEFAULT_WA_MESSAGE)} target="_blank" className="flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-full text-sm font-bold">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
              <a href={`tel:+${waNumber}`} className="flex items-center gap-2 bg-white/10 border border-white/10 text-white px-5 py-2.5 rounded-full text-sm">
                <Phone className="w-4 h-4" /> Call Us
              </a>
            </div>
          </div>

          <div>
            <div className="font-bold mb-4">Quick Links</div>
            <div className="space-y-2.5 text-sm text-white/50">
              <a href="#packages" className="block hover:text-white">Packages & Pricing</a>
              <a href="#flavors" className="block hover:text-white">Flavors</a>
              <a href="#areas" className="block hover:text-white">Delivery Areas</a>
              <a href="#how-it-works" className="block hover:text-white">How It Works</a>
              <a href="#faqs" className="block hover:text-white">FAQs</a>
              <a href="/admin" className="block hover:text-white">Admin Login</a>
            </div>
          </div>

          <div>
            <div className="font-bold mb-4">Contact</div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-white/60"><Phone className="w-4 h-4 text-gold-400" /> +971 50 123 4567</div>
              <div className="flex items-center gap-3 text-white/60"><Mail className="w-4 h-4 text-gold-400" /> orders@sheeshadelivery.ae</div>
              <div className="flex items-center gap-3 text-white/60"><MapPin className="w-4 h-4 text-gold-400" /> Dubai, UAE - All Areas</div>
              <div className="flex items-center gap-3 text-white/60"><Clock className="w-4 h-4 text-gold-400" /> Daily 4PM - 3AM</div>
              <div className="flex items-center gap-3 text-white/60"><Shield className="w-4 h-4 text-gold-400" /> 18+ Only • Licensed Service</div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between gap-4 text-xs text-white/30">
          <div>
            © {new Date().getFullYear()} Dubai Sheesha Delivery. All rights reserved. | Licensed tobacco delivery service compliant with UAE regulations.
            <br />
            <span className="mt-1 block">This service is for 18+ only. Please enjoy responsibly. Not for sale to minors.</span>
          </div>
          <div className="flex gap-4">
            <span>Privacy Policy</span>
            <span>Terms</span>
            <span>Refund Policy</span>
          </div>
        </div>

        <div className="mt-6 bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 text-[11px] text-amber-200/60 leading-relaxed">
          <strong className="text-amber-300">Compliance Notice:</strong> We comply with UAE Federal Law on tobacco control and Dubai Municipality regulations. Sheesha delivery is available only to private residences, hotel rooms, and licensed venues. Age verification (18+) may be required on delivery. We promote responsible enjoyment and do not encourage excessive use. WhatsApp communication complies with Meta WhatsApp Business Policy.
        </div>
      </div>
    </footer>
  );
}
