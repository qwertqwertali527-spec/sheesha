"use client";
import { useState } from "react";
import { Globe } from "lucide-react";

export default function LanguageToggle() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const toggle = () => {
    const newLang = lang === "en" ? "ar" : "en";
    setLang(newLang);
    alert(newLang === "ar" ? "دعم اللغة العربية قادم قريباً في المرحلة الثانية!" : "Switched to English");
  };
  return (
    <button onClick={toggle} className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white px-4 py-2 rounded-full text-sm transition-colors">
      <Globe className="w-4 h-4" />
      {lang === "en" ? "العربية" : "English"}
      <span className="bg-gold-500/20 text-gold-300 text-[10px] px-1.5 py-0.5 rounded-full ml-1">PH2</span>
    </button>
  );
}
