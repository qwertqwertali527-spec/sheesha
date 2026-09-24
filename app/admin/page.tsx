"use client";
import { useState, useEffect } from "react";
import { Lock, Save, Package, MessageSquare, Settings, LogOut, Eye, Trash2, Phone, BarChart3, Users, Gift, Calendar, CreditCard, Send } from "lucide-react";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("analytics");
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [knowledge, setKnowledge] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [followups, setFollowups] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [newPromo, setNewPromo] = useState({ code: "", title: "", discountType: "percentage", discountValue: "", minOrderAmount: "", maxUses: "", validUntil: "" });

  useEffect(() => {
    const saved = localStorage.getItem("admin_auth");
    if (saved === "true") { setIsAuth(true); loadData(); }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resInq, resKb, resCust, resBook, resPromo, resFollow] = await Promise.all([
        fetch("/api/inquiries"), fetch("/api/inquiries?type=knowledge"), fetch("/api/customers"), fetch("/api/bookings"), fetch("/api/promotions"), fetch("/api/followups?action=pending")
      ]);
      setInquiries(await resInq.json()); setKnowledge(await resKb.json());
      const cust = await resCust.json(); setCustomers(Array.isArray(cust) ? cust : []);
      const book = await resBook.json(); setBookings(Array.isArray(book) ? book : []);
      const promo = await resPromo.json(); setPromotions(Array.isArray(promo) ? promo : []);
      setFollowups(await resFollow.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password, action: "getKnowledge" }) });
      if (res.ok) { setKnowledge(await res.json()); setIsAuth(true); localStorage.setItem("admin_auth", "true"); localStorage.setItem("admin_pass", password); loadData(); }
      else alert("Invalid password");
    } catch { alert("Login failed"); }
    setLoading(false);
  };

  const handleSaveKnowledge = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: localStorage.getItem("admin_pass"), action: "saveKnowledge", data: knowledge }) });
      alert(res.ok ? "Saved!" : "Save failed");
    } catch { alert("Save failed"); }
    setLoading(false);
  };

  const handleLogout = () => { localStorage.removeItem("admin_auth"); localStorage.removeItem("admin_pass"); setIsAuth(false); };
  const deleteInquiry = async (id: string) => { if (!confirm("Delete?")) return; await fetch(`/api/inquiries?id=${id}`, { method: "DELETE" }); loadData(); };
  const createPromotion = async () => {
    if (!newPromo.code || !newPromo.title || !newPromo.discountValue) { alert("Fill code, title, discount"); return; }
    const res = await fetch("/api/promotions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: localStorage.getItem("admin_pass"), promotion: newPromo }) });
    if (res.ok) { setNewPromo({ code: "", title: "", discountType: "percentage", discountValue: "", minOrderAmount: "", maxUses: "", validUntil: "" }); loadData(); }
  };
  const deletePromotion = async (id: string) => { if (!confirm("Delete?")) return; await fetch(`/api/promotions?id=${id}&password=${localStorage.getItem("admin_pass")}`, { method: "DELETE" }); loadData(); };
  const sendFollowUp = async (inquiryId: string) => {
    if (!confirm("Send follow-up?")) return;
    const res = await fetch("/api/followups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: localStorage.getItem("admin_pass"), inquiryId }) });
    const data = await res.json(); alert(data.success ? `Sent! ${data.sent ? "Via WhatsApp" : "Mock"}` : "Failed"); loadData();
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[1.5rem] p-8">
          <div className="w-14 h-14 rounded-full gold-gradient flex items-center justify-center mx-auto mb-6"><Lock className="w-7 h-7 text-black" /></div>
          <h1 className="text-2xl font-bold text-center mb-2">Admin Login - Phase 2</h1>
          <p className="text-white/50 text-center text-sm mb-2">Advanced Management</p>
          <p className="text-gold-400 text-center text-xs mb-8">✨ Phase 2: Analytics, CRM, Bookings, Promotions, AI</p>
          <div className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="Enter admin password" className="w-full bg-black border border-white/10 rounded-full px-5 py-3.5 text-white placeholder-white/30 outline-none focus:border-gold-500/50" />
            <button onClick={handleLogin} disabled={loading} className="w-full gold-gradient text-black font-bold py-3.5 rounded-full hover:opacity-90 disabled:opacity-50">{loading ? "Checking..." : "Login to Dashboard"}</button>
            <div className="text-xs text-white/30 text-center">Default: admin123</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-zinc-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center font-bold text-black">S</div><div><div className="font-bold flex items-center gap-2">Sheesha Admin <span className="bg-gold-500 text-black text-[10px] px-2 py-0.5 rounded-full">PHASE 2</span></div><div className="text-xs text-white/50">Analytics • CRM • Bookings • Promotions • AI</div></div></div>
          <div className="flex items-center gap-3"><a href="/" className="text-sm bg-white/10 px-4 py-2 rounded-full">View Website</a><button onClick={handleLogout} className="flex items-center gap-2 text-sm bg-red-500/10 text-red-400 px-4 py-2 rounded-full"><LogOut className="w-4 h-4" /> Logout</button></div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2">
          {[
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "inquiries", label: "Orders", icon: MessageSquare, count: inquiries.length },
            { id: "bookings", label: "Bookings", icon: Calendar, count: bookings.length },
            { id: "customers", label: "CRM", icon: Users, count: customers.length },
            { id: "promotions", label: "Promotions", icon: Gift, count: promotions.length },
            { id: "followups", label: "Follow-ups", icon: Send, count: followups?.count || 0 },
            { id: "packages", label: "Packages", icon: Package },
            { id: "business", label: "Business", icon: Settings },
            { id: "faqs", label: "FAQs", icon: Eye },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? "gold-gradient text-black" : "bg-zinc-900 border border-white/10 text-white/70 hover:text-white"}`}>
              <tab.icon className="w-4 h-4" />{tab.label} {tab.count !== undefined ? `(${tab.count})` : ""}
            </button>
          ))}
        </div>

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Analytics Dashboard - Phase 2</h2><button onClick={loadData} className="bg-white/10 px-4 py-2 rounded-full text-sm">Refresh</button></div>
            <AnalyticsDashboard />
          </div>
        )}

        {activeTab === "inquiries" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Orders & Inquiries ({inquiries.length})</h2><button onClick={loadData} className="bg-white/10 px-4 py-2 rounded-full text-sm">Refresh</button></div>
            {inquiries.length === 0 ? (
              <div className="bg-zinc-900 border border-white/10 rounded-2xl p-12 text-center"><MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-4" /><div className="text-white/60">No orders yet</div></div>
            ) : (
              <div className="grid gap-4">
                {inquiries.map((inq) => (
                  <div key={inq.id} className="bg-zinc-900 border border-white/10 rounded-2xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div><div className="flex items-center gap-3 flex-wrap"><span className="font-bold text-gold-400">{inq.id}</span><span className={`text-xs px-2.5 py-1 rounded-full ${inq.status === "completed" ? "bg-green-500/20 text-green-400" : inq.status === "handover" ? "bg-amber-500/20 text-amber-400" : "bg-white/10 text-white/60"}`}>{inq.status}</span>{inq.needsHuman && <span className="text-xs bg-red-500/20 text-red-400 px-2.5 py-1 rounded-full">Needs Human</span>}</div><div className="text-sm text-white/50 mt-1">{new Date(inq.createdAt).toLocaleString()} • {inq.source} • {inq.phoneNumber}</div></div>
                      <div className="flex gap-2"><button onClick={() => sendFollowUp(inq.id)} className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center hover:bg-blue-500/30"><Send className="w-4 h-4 text-blue-400" /></button><button onClick={() => deleteInquiry(inq.id)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20"><Trash2 className="w-4 h-4" /></button></div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div><span className="text-white/40">Name:</span> <span className="text-white font-medium">{inq.name || "-"}</span></div>
                      <div><span className="text-white/40">Date/Time:</span> <span className="text-white">{inq.date || "-"} {inq.time || ""}</span></div>
                      <div><span className="text-white/40">Location:</span> <span className="text-white">{inq.location || inq.area || "-"}</span></div>
                      <div><span className="text-white/40">Package:</span> <span className="text-white">{inq.package || "-"} x{inq.numberOfSheeshas || 1}</span></div>
                    </div>
                    <div className="mt-4 flex gap-2"><a href={`https://wa.me/${inq.phoneNumber?.replace(/[^0-9]/g, "")}`} target="_blank" className="bg-[#25D366] text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2"><Phone className="w-3 h-3" /> Reply on WhatsApp</a></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Online Bookings ({bookings.length}) - Phase 2</h2>
            {bookings.length === 0 ? <div className="bg-zinc-900 border border-white/10 rounded-2xl p-12 text-center"><Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" /><div className="text-white/60">No bookings yet</div></div> : (
              <div className="grid gap-4">{bookings.map((b) => (<div key={b.id} className="bg-zinc-900 border border-white/10 rounded-2xl p-6"><div className="flex justify-between"><div><div className="font-bold text-gold-400">{b.id} - {b.package} x{b.numberOfSheeshas}</div><div className="text-sm text-white/50">{b.date} at {b.time} • {b.area}, {b.location}</div><div className="text-sm mt-2"><span className="text-white/40">Customer:</span> {b.name} - {b.phone}</div></div><span className={`text-xs px-2.5 py-1 rounded-full ${b.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60'}`}>{b.status}</span></div></div>))}</div>
            )}
          </div>
        )}

        {activeTab === "customers" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Customer CRM ({customers.length}) - Phase 2</h2>
            {customers.length === 0 ? <div className="bg-zinc-900 border border-white/10 rounded-2xl p-12 text-center"><Users className="w-12 h-12 text-white/20 mx-auto mb-4" /><div className="text-white/60">No customers yet</div></div> : (
              <div className="grid gap-4">{customers.map((c) => (<div key={c.id} className="bg-zinc-900 border border-white/10 rounded-2xl p-6 flex justify-between items-center"><div><div className="font-bold">{c.name || "Customer"} - {c.phone}</div><div className="text-sm text-white/50">Orders: {c.totalOrders} • Spent: AED {c.totalSpent} • Last: {c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString() : "-"}</div></div><a href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`} target="_blank" className="bg-[#25D366] text-white px-4 py-2 rounded-full text-xs font-bold">WhatsApp</a></div>))}</div>
            )}
          </div>
        )}

        {activeTab === "promotions" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Promotions & Coupons - Phase 2</h2>
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6">
              <div className="font-bold mb-4">Create New Promotion</div>
              <div className="grid md:grid-cols-3 gap-4">
                <input value={newPromo.code} onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})} placeholder="Code (WELCOME20)" className="bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm" />
                <input value={newPromo.title} onChange={e => setNewPromo({...newPromo, title: e.target.value})} placeholder="Title" className="bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm md:col-span-2" />
                <select value={newPromo.discountType} onChange={e => setNewPromo({...newPromo, discountType: e.target.value})} className="bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm"><option value="percentage">Percentage %</option><option value="fixed">Fixed AED</option></select>
                <input value={newPromo.discountValue} onChange={e => setNewPromo({...newPromo, discountValue: e.target.value})} placeholder="Discount Value (20)" type="number" className="bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm" />
                <input value={newPromo.minOrderAmount} onChange={e => setNewPromo({...newPromo, minOrderAmount: e.target.value})} placeholder="Min Order (99)" type="number" className="bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm" />
                <button onClick={createPromotion} className="gold-gradient text-black px-6 py-2.5 rounded-full font-bold">Create Promotion</button>
              </div>
            </div>
            <div className="grid gap-4">{promotions.map((promo) => (<div key={promo.id} className="bg-zinc-900 border border-white/10 rounded-2xl p-6 flex justify-between items-center"><div><div className="font-bold flex items-center gap-2">{promo.code} - {promo.title} <span className={`text-xs px-2 py-0.5 rounded-full ${promo.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{promo.isActive ? 'Active' : 'Inactive'}</span></div><div className="text-sm text-white/50">{promo.description} • {promo.discountType === 'percentage' ? `${promo.discountValue}% off` : `AED ${promo.discountValue} off`} • Used: {promo.usedCount}/{promo.maxUses || '∞'}</div></div><button onClick={() => deletePromotion(promo.id)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500/20"><Trash2 className="w-4 h-4" /></button></div>))}</div>
          </div>
        )}

        {activeTab === "followups" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Automated Follow-ups - Phase 2</h2>
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6"><div className="font-bold mb-2">Pending Follow-ups (24h after delivery)</div><div className="text-sm text-white/50">System automatically detects completed orders older than 24h without follow-up</div><div className="mt-4 text-2xl font-bold">{followups?.count || 0} pending</div></div>
            {followups?.inquiries?.length > 0 && (<div className="grid gap-4">{followups.inquiries.map((inq: any) => (<div key={inq.id} className="bg-zinc-900 border border-white/10 rounded-2xl p-6 flex justify-between items-center"><div><div className="font-bold">{inq.name} - {inq.phoneNumber}</div><div className="text-sm text-white/50">{inq.package} • {new Date(inq.createdAt).toLocaleString()}</div></div><button onClick={() => sendFollowUp(inq.id)} className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2"><Send className="w-4 h-4" /> Send Follow-up</button></div>))}</div>)}
          </div>
        )}

        {activeTab === "packages" && knowledge && (
          <div className="space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Packages & Pricing</h2><button onClick={handleSaveKnowledge} disabled={loading} className="gold-gradient text-black px-6 py-2.5 rounded-full font-bold flex items-center gap-2"><Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Changes"}</button></div>
            <div className="grid gap-4">{knowledge.packages?.map((pkg: any, idx: number) => (<div key={pkg.id} className="bg-zinc-900 border border-white/10 rounded-2xl p-6"><div className="grid md:grid-cols-4 gap-4"><div><label className="text-xs text-white/40">Name</label><input value={pkg.name} onChange={(e) => { const newPkgs = [...knowledge.packages]; newPkgs[idx].name = e.target.value; setKnowledge({ ...knowledge, packages: newPkgs }); }} className="w-full mt-1 bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm" /></div><div><label className="text-xs text-white/40">Price</label><input value={pkg.price} onChange={(e) => { const newPkgs = [...knowledge.packages]; newPkgs[idx].price = e.target.value; setKnowledge({ ...knowledge, packages: newPkgs }); }} className="w-full mt-1 bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm" /></div><div><label className="text-xs text-white/40">Original Price</label><input value={pkg.originalPrice} onChange={(e) => { const newPkgs = [...knowledge.packages]; newPkgs[idx].originalPrice = e.target.value; setKnowledge({ ...knowledge, packages: newPkgs }); }} className="w-full mt-1 bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm" /></div><div><label className="text-xs text-white/40">Duration</label><input value={pkg.duration} onChange={(e) => { const newPkgs = [...knowledge.packages]; newPkgs[idx].duration = e.target.value; setKnowledge({ ...knowledge, packages: newPkgs }); }} className="w-full mt-1 bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm" /></div></div><div className="mt-4"><label className="text-xs text-white/40">Includes (comma separated)</label><input value={pkg.includes?.join(", ")} onChange={(e) => { const newPkgs = [...knowledge.packages]; newPkgs[idx].includes = e.target.value.split(",").map((s) => s.trim()); setKnowledge({ ...knowledge, packages: newPkgs }); }} className="w-full mt-1 bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm" /></div></div>))}</div>
          </div>
        )}

        {activeTab === "business" && knowledge && (
          <div className="space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Business Information</h2><button onClick={handleSaveKnowledge} disabled={loading} className="gold-gradient text-black px-6 py-2.5 rounded-full font-bold flex items-center gap-2"><Save className="w-4 h-4" /> Save</button></div>
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 grid md:grid-cols-2 gap-6">
              <div><label className="text-xs text-white/40">Business Name</label><input value={knowledge.business?.name || ""} onChange={(e) => setKnowledge({ ...knowledge, business: { ...knowledge.business, name: e.target.value } })} className="w-full mt-1 bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm" /></div>
              <div><label className="text-xs text-white/40">Phone</label><input value={knowledge.business?.phone || ""} onChange={(e) => setKnowledge({ ...knowledge, business: { ...knowledge.business, phone: e.target.value } })} className="w-full mt-1 bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm" /></div>
              <div><label className="text-xs text-white/40">WhatsApp Number</label><input value={knowledge.business?.whatsapp || ""} onChange={(e) => setKnowledge({ ...knowledge, business: { ...knowledge.business, whatsapp: e.target.value } })} className="w-full mt-1 bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm" /></div>
              <div><label className="text-xs text-white/40">Hours</label><input value={knowledge.business?.hours || ""} onChange={(e) => setKnowledge({ ...knowledge, business: { ...knowledge.business, hours: e.target.value } })} className="w-full mt-1 bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm" /></div>
              <div className="md:col-span-2"><label className="text-xs text-white/40">Description</label><textarea value={knowledge.business?.description || ""} onChange={(e) => setKnowledge({ ...knowledge, business: { ...knowledge.business, description: e.target.value } })} className="w-full mt-1 bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm h-24" /></div>
            </div>
          </div>
        )}

        {activeTab === "faqs" && knowledge && (
          <div className="space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">FAQs Management</h2><button onClick={handleSaveKnowledge} disabled={loading} className="gold-gradient text-black px-6 py-2.5 rounded-full font-bold flex items-center gap-2"><Save className="w-4 h-4" /> Save</button></div>
            <div className="space-y-4">{knowledge.faqs?.map((faq: any, idx: number) => (<div key={idx} className="bg-zinc-900 border border-white/10 rounded-2xl p-6"><div className="space-y-3"><div><label className="text-xs text-white/40">Question</label><input value={faq.question} onChange={(e) => { const newFaqs = [...knowledge.faqs]; newFaqs[idx].question = e.target.value; setKnowledge({ ...knowledge, faqs: newFaqs }); }} className="w-full mt-1 bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium" /></div><div><label className="text-xs text-white/40">Answer</label><textarea value={faq.answer} onChange={(e) => { const newFaqs = [...knowledge.faqs]; newFaqs[idx].answer = e.target.value; setKnowledge({ ...knowledge, faqs: newFaqs }); }} className="w-full mt-1 bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm h-20" /></div></div></div>))}</div>
          </div>
        )}
      </div>
    </div>
  );
}
