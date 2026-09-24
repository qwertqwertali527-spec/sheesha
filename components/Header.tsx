"use client";
import { useState, useEffect } from "react";
import { Menu, X, Phone, MessageCircle } from "lucide-react";
import { formatWhatsAppLink, DEFAULT_WA_MESSAGE } from "@/lib/utils";
import LanguageToggle from "./LanguageToggle";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "971501234567";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Packages", href: "#packages" },
    { name: "Flavors", href: "#flavors" },
    { name: "Areas", href: "#areas" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "FAQs", href: "#faqs" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/90 backdrop-blur-xl border-b border-white/10 py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center font-bold text-black text-xl">S</div>
            <div>
              <div className="font-display font-bold text-lg leading-none">SHEESHA</div>
              <div className="text-[10px] tracking-[0.2em] text-gold-400 -mt-0.5">DELIVERY DUBAI</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-sm text-white/70 hover:text-white transition-colors">
                {link.name}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <LanguageToggle />
            <a
              href={`tel:+${waNumber}`}
              className="flex items-center gap-2 text-sm text-white/80 hover:text-white px-4 py-2 rounded-full border border-white/20"
            >
              <Phone className="w-4 h-4" /> Call
            </a>
            <a
              href={formatWhatsAppLink(waNumber, DEFAULT_WA_MESSAGE)}
              target="_blank"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp Order
            </a>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-zinc-900 rounded-2xl p-5 border border-white/10 animate-fade-in">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-white/80 hover:text-white py-2">
                  {link.name}
                </a>
              ))}
              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                <a href={formatWhatsAppLink(waNumber, DEFAULT_WA_MESSAGE)} target="_blank" className="bg-[#25D366] text-white px-5 py-3 rounded-full text-center font-semibold flex items-center justify-center gap-2">
                  <MessageCircle className="w-5 h-5" /> Order on WhatsApp
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
