"use client";
import { useState } from "react";
import { Calendar, Clock, MapPin, Users, Package } from "lucide-react";
import { formatWhatsAppLink } from "@/lib/utils";

export default function BookingCalendar() {
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState<any>({ numberOfSheeshas: 1, package: "premium" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "971501234567";
  const packages = [
    { id: "basic", name: "Classic", price: "AED 99" },
    { id: "premium", name: "Premium", price: "AED 149" },
    { id: "double", name: "Double", price: "AED 249" },
    { id: "party", name: "Party", price: "AED 399" },
    { id: "vip", name: "VIP", price: "AED 599" },
  ];
  const timeSlots = ["4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM","8:30 PM","9:00 PM","9:30 PM","10:00 PM","10:30 PM","11:00 PM","11:30 PM","12:00 AM","12:30 AM","1:00 AM","1:30 AM","2:00 AM"];
  const areas = ["Dubai Marina","JLT","JBR","Downtown","Business Bay","DIFC","Palm Jumeirah","Jumeirah","Al Barsha","Dubai Hills","Other"];
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(booking) });
      if (res.ok) { setIsSuccess(true); fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventType: "booking_completed", metadata: booking }) }); }
    } catch (e) { console.error(e); }
    setIsSubmitting(false);
  };
  if (isSuccess) {
    return (
      <div className="bg-zinc-900 border border-white/10 rounded-[2rem] p-8 md:p-12 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6"><span className="text-4xl">✅</span></div>
        <h3 className="text-3xl font-bold mb-4">Booking Confirmed! 🎉</h3>
        <p className="text-white/60 mb-2">Your sheesha delivery is scheduled for</p>
        <p className="text-xl font-bold gold-text mb-6">{booking.date} at {booking.time} in {booking.area}</p>
        <div className="bg-black rounded-2xl p-6 text-left mb-8">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-white/40">Package:</span> <span className="font-bold">{packages.find(p=>p.id===booking.package)?.name}</span></div>
            <div><span className="text-white/40">Sheeshas:</span> <span className="font-bold">{booking.numberOfSheeshas}</span></div>
            <div><span className="text-white/40">Location:</span> <span className="font-bold">{booking.location}</span></div>
            <div><span className="text-white/40">Name:</span> <span className="font-bold">{booking.name}</span></div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={formatWhatsAppLink(waNumber, `Hi! I just booked ${booking.package} for ${booking.date} at ${booking.time} in ${booking.area}. Booking confirmed?`)} target="_blank" className="bg-[#25D366] text-white px-8 py-3 rounded-full font-bold">Confirm on WhatsApp</a>
          <button onClick={() => { setIsSuccess(false); setStep(1); setBooking({ numberOfSheeshas: 1, package: "premium" }); }} className="bg-white/10 border border-white/20 text-white px-8 py-3 rounded-full font-bold">New Booking</button>
        </div>
      </div>
    );
  }
  return (
    <section id="booking" className="py-20 bg-gradient-to-b from-black to-zinc-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-4 py-1.5 text-xs text-gold-300 mb-4"><Calendar className="w-4 h-4" /> ONLINE BOOKING - NEW IN PHASE 2</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Book Your <span className="gold-text">Sheesha</span> in Advance</h2>
          <p className="text-white/50 max-w-2xl mx-auto">Schedule delivery for later today, tomorrow, or any future date. Choose exact time, package, and location. Instant confirmation via WhatsApp.</p>
        </div>
        <div className="bg-zinc-900 border border-white/10 rounded-[2rem] p-6 md:p-10">
          <div className="flex items-center justify-between mb-10">
            {[1,2,3].map((s) => (<div key={s} className="flex items-center flex-1"><div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? "gold-gradient text-black" : "bg-white/10 text-white/40"}`}>{s}</div><div className={`flex-1 h-[2px] mx-2 ${step > s ? "bg-gold-500/50" : "bg-white/10"}`} /></div>))}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? "gold-gradient text-black" : "bg-white/10 text-white/40"}`}>✓</div>
          </div>
          {step === 1 && (
            <div className="space-y-8 animate-fade-in">
              <h3 className="text-2xl font-bold flex items-center gap-3"><Package className="w-6 h-6 text-gold-400" /> Choose Package & Details</h3>
              <div>
                <label className="text-sm text-white/60 mb-3 block">Select Package</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {packages.map((pkg) => (<button key={pkg.id} onClick={() => setBooking({ ...booking, package: pkg.id })} className={`p-4 rounded-2xl border text-left transition-all ${booking.package === pkg.id ? "bg-gold-500/10 border-gold-500/50" : "bg-black border-white/10 hover:border-white/20"}`}><div className="font-bold">{pkg.name}</div><div className="text-gold-400 text-sm">{pkg.price}</div></button>))}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Number of Sheeshas</label>
                  <div className="flex items-center gap-3 bg-black border border-white/10 rounded-full px-2 py-2 w-fit">
                    <button onClick={() => setBooking({ ...booking, numberOfSheeshas: Math.max(1, (booking.numberOfSheeshas||1)-1) })} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">-</button>
                    <span className="w-12 text-center font-bold">{booking.numberOfSheeshas}</span>
                    <button onClick={() => setBooking({ ...booking, numberOfSheeshas: (booking.numberOfSheeshas||1)+1 })} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">+</button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Flavors</label>
                  <input value={booking.flavors || ""} onChange={(e) => setBooking({ ...booking, flavors: e.target.value })} placeholder="Double Apple, Mint" className="w-full bg-black border border-white/10 rounded-full px-5 py-3 text-sm outline-none focus:border-gold-500/50" />
                </div>
              </div>
              <button onClick={() => setStep(2)} disabled={!booking.package} className="w-full gold-gradient text-black py-4 rounded-full font-bold disabled:opacity-50">Continue to Date & Time →</button>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-8 animate-fade-in">
              <h3 className="text-2xl font-bold flex items-center gap-3"><Clock className="w-6 h-6 text-gold-400" /> When & Where?</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div><label className="text-sm text-white/60 mb-2 block">Date</label><input type="date" value={booking.date || ""} onChange={(e) => setBooking({ ...booking, date: e.target.value })} min={new Date().toISOString().split('T')[0]} className="w-full bg-black border border-white/10 rounded-full px-5 py-3 text-sm outline-none focus:border-gold-500/50" /></div>
                <div><label className="text-sm text-white/60 mb-2 block">Area</label><select value={booking.area || ""} onChange={(e) => setBooking({ ...booking, area: e.target.value })} className="w-full bg-black border border-white/10 rounded-full px-5 py-3 text-sm outline-none focus:border-gold-500/50"><option value="">Select Area</option>{areas.map((area) => <option key={area} value={area}>{area}</option>)}</select></div>
              </div>
              <div><label className="text-sm text-white/60 mb-3 block">Time Slot</label><div className="grid grid-cols-3 md:grid-cols-5 gap-2">{timeSlots.map((time) => (<button key={time} onClick={() => setBooking({ ...booking, time })} className={`py-2.5 rounded-full text-sm border transition-all ${booking.time === time ? "bg-gold-500/20 border-gold-500/50 text-gold-300 font-bold" : "bg-black border-white/10 hover:border-white/20"}`}>{time}</button>))}</div></div>
              <div><label className="text-sm text-white/60 mb-2 block">Exact Location</label><input value={booking.location || ""} onChange={(e) => setBooking({ ...booking, location: e.target.value })} placeholder="Marina Gate Tower 1, Apt 1205" className="w-full bg-black border border-white/10 rounded-full px-5 py-3 text-sm outline-none focus:border-gold-500/50" /></div>
              <div className="flex gap-3"><button onClick={() => setStep(1)} className="flex-1 bg-white/10 border border-white/10 py-4 rounded-full font-bold">← Back</button><button onClick={() => setStep(3)} disabled={!booking.date || !booking.time || !booking.location || !booking.area} className="flex-[2] gold-gradient text-black py-4 rounded-full font-bold disabled:opacity-50">Continue to Contact →</button></div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-2xl font-bold flex items-center gap-3"><Users className="w-6 h-6 text-gold-400" /> Your Details</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div><label className="text-sm text-white/60 mb-2 block">Your Name</label><input value={booking.name || ""} onChange={(e) => setBooking({ ...booking, name: e.target.value })} placeholder="Ahmed" className="w-full bg-black border border-white/10 rounded-full px-5 py-3 text-sm outline-none focus:border-gold-500/50" /></div>
                <div><label className="text-sm text-white/60 mb-2 block">WhatsApp Number</label><input value={booking.phone || ""} onChange={(e) => setBooking({ ...booking, phone: e.target.value })} placeholder="+971 50 123 4567" className="w-full bg-black border border-white/10 rounded-full px-5 py-3 text-sm outline-none focus:border-gold-500/50" /></div>
              </div>
              <div><label className="text-sm text-white/60 mb-2 block">Special Requirements</label><textarea value={booking.specialRequirements || ""} onChange={(e) => setBooking({ ...booking, specialRequirements: e.target.value })} placeholder="Extra charcoal, etc." className="w-full bg-black border border-white/10 rounded-2xl px-5 py-3 text-sm outline-none focus:border-gold-500/50 h-20 resize-none" /></div>
              <div className="bg-black rounded-2xl p-5 border border-gold-500/20"><div className="font-bold mb-3">Booking Summary</div><div className="space-y-2 text-sm text-white/70"><div className="flex justify-between"><span>Package:</span><span className="font-bold text-white">{packages.find(p=>p.id===booking.package)?.name} - {packages.find(p=>p.id===booking.package)?.price}</span></div><div className="flex justify-between"><span>Sheeshas:</span><span className="font-bold text-white">{booking.numberOfSheeshas}</span></div><div className="flex justify-between"><span>Date/Time:</span><span className="font-bold text-white">{booking.date} at {booking.time}</span></div><div className="flex justify-between"><span>Location:</span><span className="font-bold text-white">{booking.area}, {booking.location}</span></div></div></div>
              <div className="flex gap-3"><button onClick={() => setStep(2)} className="flex-1 bg-white/10 border border-white/10 py-4 rounded-full font-bold">← Back</button><button onClick={handleSubmit} disabled={!booking.name || !booking.phone || isSubmitting} className="flex-[2] gold-gradient text-black py-4 rounded-full font-bold disabled:opacity-50">{isSubmitting ? "Booking..." : "Confirm Booking →"}</button></div>
              <div className="text-center text-xs text-white/30">✓ No advance payment • Cash/Card on delivery • Free cancellation 1hr before</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
