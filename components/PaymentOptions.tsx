"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import { getPaymentMethods, calculateTotal, formatPrice, PaymentMethod } from "@/lib/payment";

export default function PaymentOptions({ packageId, numberOfSheeshas, onSelect, initialCoupon }: { packageId: string, numberOfSheeshas: number, onSelect?: (method: PaymentMethod, total: number, coupon?: string) => void, initialCoupon?: string }) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("cash");
  const [coupon, setCoupon] = useState(initialCoupon || "");
  const [couponApplied, setCouponApplied] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const paymentMethods = getPaymentMethods();
  const [pricing, setPricing] = useState(() => calculateTotal(packageId, numberOfSheeshas, coupon));
  const handleApplyCoupon = async () => {
    setCouponError("");
    try {
      const res = await fetch(`/api/promotions?code=${coupon}`);
      const data = await res.json();
      if (data.valid) {
        const result = calculateTotal(packageId, numberOfSheeshas, coupon, [data.promotion]);
        if (result.discount > 0) { setPricing(result); setCouponApplied(result.appliedCoupon); }
        else setCouponError("Coupon not applicable");
      } else setCouponError(data.error || "Invalid coupon");
    } catch (e) {
      const localPromos = [{ code: "WELCOME20", discountType: "percentage", discountValue: 20, isActive: true, minOrderAmount: 99 }, { code: "RAMADAN25", discountType: "fixed", discountValue: 25, isActive: true, minOrderAmount: 200 }, { code: "PARTY50", discountType: "fixed", discountValue: 50, isActive: true, minOrderAmount: 300 }];
      const promo = localPromos.find(p => p.code.toLowerCase() === coupon.toLowerCase());
      if (promo) { const result = calculateTotal(packageId, numberOfSheeshas, coupon, [promo]); setPricing(result); setCouponApplied(result.appliedCoupon); }
      else setCouponError("Invalid coupon. Try WELCOME20, RAMADAN25, PARTY50");
    }
  };
  const handleMethodSelect = (method: PaymentMethod) => { setSelectedMethod(method); onSelect?.(method, pricing.total, coupon); };
  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5">
        <div className="font-bold mb-3">🎟️ Have a coupon?</div>
        <div className="flex gap-2">
          <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="WELCOME20" className="flex-1 bg-black border border-white/10 rounded-full px-5 py-2.5 text-sm outline-none focus:border-gold-500/50 uppercase" />
          <button onClick={handleApplyCoupon} className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold">Apply</button>
        </div>
        {couponApplied && <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 text-sm text-green-400 flex items-center gap-2"><Check className="w-4 h-4" /> {couponApplied.title} applied!</div>}
        {couponError && <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2 text-sm text-red-400">{couponError}</div>}
        <div className="mt-3 text-xs text-white/30">Try: WELCOME20, RAMADAN25, PARTY50</div>
      </div>
      <div className="bg-black border border-white/10 rounded-2xl p-5">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-white/50">Subtotal</span><span>{formatPrice(pricing.subtotal)}</span></div>
          {pricing.discount > 0 && <div className="flex justify-between text-green-400"><span>Discount ({coupon})</span><span>-{formatPrice(pricing.discount)}</span></div>}
          <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-lg"><span>Total</span><span className="gold-text">{formatPrice(pricing.total)}</span></div>
        </div>
      </div>
      <div>
        <div className="font-bold mb-3">Choose Payment Method</div>
        <div className="grid gap-3">
          {paymentMethods.map((method) => (
            <button key={method.id} onClick={() => method.enabled && handleMethodSelect(method.id)} disabled={!method.enabled} className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${selectedMethod === method.id ? "bg-gold-500/10 border-gold-500/50" : method.enabled ? "bg-zinc-900 border-white/10 hover:border-white/20" : "bg-zinc-900/50 border-white/5 opacity-50 cursor-not-allowed"}`}>
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg">{method.icon}</div><div><div className="font-bold text-sm">{method.name}</div><div className="text-xs text-white/50">{method.description}</div></div></div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === method.id ? "bg-gold-500 border-gold-500" : "border-white/20"}`}>{selectedMethod === method.id && <Check className="w-4 h-4 text-black" />}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
