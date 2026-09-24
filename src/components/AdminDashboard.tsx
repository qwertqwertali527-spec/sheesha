'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Check, CircleAlert, Clock3, Copy,
  Inbox, LayoutDashboard, LogOut, MessageSquareText, RefreshCw, Search,
  Send, Settings2, Sparkles, Trash2, UserRound,
} from 'lucide-react';
import { ContentEditor } from './ContentEditor';
import type { ChatMessage, Inquiry, SiteSettings } from '@/lib/types';

type Tab = 'overview' | 'inquiries' | 'content';
const statuses: Inquiry['status'][] = ['collecting', 'needs_human', 'in_progress', 'closed'];
const labels: Record<Inquiry['status'], string> = {
  collecting: 'Collecting', needs_human: 'Needs a person', in_progress: 'In progress', closed: 'Closed',
};

function dateTime(value: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

interface Props { initialSettings: SiteSettings; initialInquiries: Inquiry[]; approved: boolean; whatsappEnabled: boolean }

export function AdminDashboard({ initialSettings, initialInquiries, approved, whatsappEnabled }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [selectedId, setSelectedId] = useState<string | null>(initialInquiries[0]?.id ?? null);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [note, setNote] = useState('');
  const [reply, setReply] = useState('');
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState('');

  const refreshList = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/inquiries', { cache: 'no-store' });
      if (response.status === 401) { window.location.reload(); return; }
      if (response.ok) {
        const data = await response.json() as { inquiries: Inquiry[] };
        setInquiries(data.inquiries);
      }
    } catch { /* keep the last known inbox */ }
  }, []);

  const refreshDetail = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/inquiries/${id}`, { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json() as { inquiry: Inquiry; messages: ChatMessage[] };
      setSelected(data.inquiry); setMessages(data.messages);
      setNote((previous) => previous === '' ? data.inquiry.staffNote : previous);
    } catch { /* retry on next refresh */ }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => { void refreshList(); if (selectedId) void refreshDetail(selectedId); }, 10000);
    return () => clearInterval(interval);
  }, [refreshList, refreshDetail, selectedId]);
  useEffect(() => {
    if (selectedId) { setNote(''); void refreshDetail(selectedId); }
    else { setSelected(null); setMessages([]); }
  }, [selectedId, refreshDetail]);

  const counts = useMemo(() => ({
    total: inquiries.length,
    needsHuman: inquiries.filter((item) => item.status === 'needs_human').length,
    active: inquiries.filter((item) => item.status === 'collecting' || item.status === 'in_progress').length,
    closed: inquiries.filter((item) => item.status === 'closed').length,
  }), [inquiries]);
  const filtered = inquiries.filter((item) => {
    if (filter !== 'all' && item.status !== filter) return false;
    const needle = search.toLowerCase();
    return !needle || [item.fields.name, item.fields.area, item.fields.contact, item.channelId, item.id]
      .some((value) => value?.toLowerCase().includes(needle));
  });

  async function update(patch: { status?: Inquiry['status']; staffNote?: string }) {
    if (!selectedId) return;
    setSaving(true); setFlash('');
    try {
      const response = await fetch(`/api/admin/inquiries/${selectedId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch),
      });
      if (!response.ok) throw new Error('Could not save the inquiry.');
      await Promise.all([refreshList(), refreshDetail(selectedId)]);
      setFlash('Changes saved');
    } catch (error) { setFlash(error instanceof Error ? error.message : 'Save failed'); }
    finally { setSaving(false); }
  }

  async function sendReply(event: FormEvent) {
    event.preventDefault();
    if (!selectedId || !reply.trim()) return;
    setSaving(true); setFlash('');
    try {
      const response = await fetch(`/api/admin/inquiries/${selectedId}/reply`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: reply.trim() }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || 'Could not send reply.');
      setReply('');
      await Promise.all([refreshList(), refreshDetail(selectedId)]);
      setFlash('Reply sent');
    } catch (error) { setFlash(error instanceof Error ? error.message : 'Reply failed'); }
    finally { setSaving(false); }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin';
  }

  async function deleteSelected() {
    if (!selectedId || !window.confirm('Permanently delete this inquiry and its messages? This cannot be undone.')) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/inquiries/${selectedId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Could not delete inquiry.');
      setSelectedId(null); setSelected(null); setMessages([]); setNote('');
      await refreshList();
      setFlash('Inquiry deleted');
    } catch (error) { setFlash(error instanceof Error ? error.message : 'Delete failed'); }
    finally { setSaving(false); }
  }

  async function copySummary() {
    if (!selected) return;
    const f = selected.fields;
    const lines = [
      `Inquiry ${selected.id.slice(0, 8)} · ${selected.channel} · ${selected.status}`,
      `Name: ${f.name ?? 'Not supplied'}`,
      `Requested date: ${f.date ?? 'Not supplied'}`,
      `Time (Dubai): ${f.time ?? 'Not supplied'}`,
      `Area: ${f.area ?? 'Not supplied'}`,
      `Exact location: ${f.address ?? 'Not supplied'}`,
      `Quantity: ${f.quantity ?? 'Not supplied'}`,
      `Service/package: ${f.service ?? 'Not specified'}`,
      `Options: ${f.options ?? 'Not specified'}`,
      `Special requirements: ${f.specialRequirements ?? 'None supplied'}`,
      `Contact: ${f.contact ?? 'Not supplied'}`,
      `Handover reason: ${selected.handoffReason ?? 'None'}`,
      'No booking, price or availability has been confirmed.',
    ];
    try { await navigator.clipboard.writeText(lines.join('\n')); setFlash('Summary copied'); }
    catch { setFlash('Clipboard unavailable in this browser'); }
  }

  const nav: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'inquiries', label: 'Inquiries', icon: Inbox },
    { id: 'content', label: 'Website content', icon: Settings2 },
  ];

  return <div className="adminApp">
    <aside className="adminSidebar"><Link href="/" className="adminBrand"><span>✳</span> LAYALI<span className="brandPeriod">.</span></Link><p className="adminSidebarLabel">WORKSPACE</p><nav aria-label="Staff portal sections">{nav.map((item) => <button key={item.id} className={tab === item.id ? 'sideActive' : ''} onClick={() => setTab(item.id)}><item.icon size={18} /> {item.label}{item.id === 'inquiries' && counts.needsHuman > 0 && <span className="sidebarCount">{counts.needsHuman}</span>}</button>)}</nav><div className="sidebarBottom"><div className="sidebarPreview"><Sparkles size={17} /><div><strong>{approved ? 'Approved site' : 'Concept mode'}</strong><span>{whatsappEnabled ? 'Approved WhatsApp channel' : 'WhatsApp not connected'}</span></div></div><Link href="/" target="_blank"><ArrowUpRight size={18} /> View website</Link><button onClick={logout}><LogOut size={18} /> Sign out</button></div></aside>

    <div className="adminMain"><header className="adminTopbar"><div className="adminMobileBrand">✳ LAYALI.</div><div className="adminTopbarRight"><span className="adminDemoDot" /> Staff workspace <div className="adminUser"><UserRound size={17} /></div><button className="adminMobileLogout" onClick={logout} aria-label="Sign out"><LogOut size={17} /></button></div></header><nav className="adminMobileTabs">{nav.map((item) => <button key={item.id} onClick={() => setTab(item.id)} className={tab === item.id ? 'tabActive' : ''}>{item.label}</button>)}</nav>
      <div className="adminContent">
        {tab === 'overview' && <>
          <div className="adminPageHeading"><div><p className="eyebrow darkEyebrow">A BETTER VIEW OF EVERY CONVERSATION</p><h1>Good to have you here.</h1><p>One place for every inquiry, every follow-up and every detail that matters.</p></div><button className="adminOutlineButton" onClick={() => { void refreshList(); if (selectedId) void refreshDetail(selectedId); }}><RefreshCw size={16} /> Refresh</button></div>
          <div className="adminMetricGrid"><Metric label="Total inquiries" value={counts.total} icon={<MessageSquareText size={21} />} tone="cream" /><Metric label="Needs a person" value={counts.needsHuman} icon={<CircleAlert size={21} />} tone="gold" /><Metric label="In conversation" value={counts.active} icon={<Clock3 size={21} />} tone="sage" /><Metric label="Closed" value={counts.closed} icon={<Check size={21} />} tone="neutral" /></div>
          <div className="adminOverviewGrid"><section className="adminCard"><div className="adminCardHeader"><div><p className="eyebrow darkEyebrow">COMING IN</p><h2>Recent inquiries</h2></div><button className="adminTextLink" onClick={() => setTab('inquiries')}>View all <ArrowRight size={16} /></button></div>{inquiries.length ? inquiries.slice(0, 5).map((item) => <button className="recentRow" key={item.id} onClick={() => { setSelectedId(item.id); setTab('inquiries'); }}><span className="recentAvatar">{(item.fields.name || '?').slice(0, 1).toUpperCase()}</span><span className="recentMain"><strong>{item.fields.name || 'Name not yet provided'}</strong><small>{item.fields.area || 'Area pending'} · {dateTime(item.updatedAt)}</small></span><span className={`statusPill status-${item.status}`}>{labels[item.status]}</span><ArrowUpRight size={16} /></button>) : <div className="adminEmpty"><Inbox size={25} /><h3>No inquiries yet</h3><p>Open the website and test the assistant with fictional details to see the flow here.</p><Link href="/" target="_blank">Test the website <ArrowUpRight size={15} /></Link></div>}</section><aside className="adminTipCard"><span className="tipDecoration">✳</span><p className="eyebrow">HOW IT WORKS</p><h2>The assistant gathers.<br /><em>You decide.</em></h2><p>Every price, availability check, confirmation and unusual request is handed to a person. An inquiry is never an automatic booking.</p><button onClick={() => setTab('content')}>Review the knowledge <ArrowUpRight size={17} /></button></aside></div>
        </>}

        {tab === 'inquiries' && <><div className="adminPageHeading"><div><p className="eyebrow darkEyebrow">EVERY CONVERSATION IN ONE PLACE</p><h1>Inquiries.</h1><p>Review, take over and respond. The assistant stops when a human is needed.</p></div><button className="adminOutlineButton" onClick={() => { void refreshList(); if (selectedId) void refreshDetail(selectedId); }}><RefreshCw size={16} /> Refresh</button></div><div className="inboxLayout"><section className="inboxList"><div className="inboxTools"><div className="adminSearch"><Search size={17} /><input placeholder="Search by name, area, contact…" value={search} onChange={(event) => setSearch(event.target.value)} /></div><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter by status"><option value="all">All statuses</option>{statuses.map((status) => <option value={status} key={status}>{labels[status]}</option>)}</select></div><div className="inboxListInner">{filtered.length ? filtered.map((item) => <button key={item.id} className={`inboxItem ${selectedId === item.id ? 'inboxItemActive' : ''}`} onClick={() => setSelectedId(item.id)}><span className="inboxItemTop"><strong>{item.fields.name || 'New conversation'}</strong><small>{dateTime(item.updatedAt)}</small></span><span className="inboxItemDetail">{item.fields.area || 'Location pending'} · {item.channel === 'web' ? 'Website inquiry' : 'WhatsApp'}</span><span className={`statusPill status-${item.status}`}>{labels[item.status]}</span></button>) : <div className="adminEmpty compactEmpty"><Inbox size={22} /><p>No inquiries match your search.</p></div>}</div></section>
          <section className="inboxDetail">{selected ? <><div className="detailHeader"><div><p className="eyebrow darkEyebrow">INQUIRY #{selected.id.slice(0, 8).toUpperCase()}</p><h2>{selected.fields.name || 'New conversation'}</h2><p>{selected.channel === 'web' ? 'Website inquiry' : 'WhatsApp'} · Received {dateTime(selected.createdAt)}</p></div><span className={`statusPill status-${selected.status}`}>{labels[selected.status]}</span></div>
            {selected.handoffReason && <div className="handoffBanner"><CircleAlert size={17} /><span><strong>Human review:</strong> {selected.handoffReason}</span></div>}
            <div className="detailSectionHeader"><div className="detailSectionTitle">WHAT WE KNOW</div><button className="copySummary" onClick={() => void copySummary()}><Copy size={14} /> Copy summary</button></div><div className="detailFields">{[
              ['Name', selected.fields.name], ['Contact', selected.fields.contact],
              ['Date', selected.fields.date], ['Time (Dubai)', selected.fields.time],
              ['Area', selected.fields.area], ['Exact address', selected.fields.address],
              ['Quantity', selected.fields.quantity?.toString()], ['Service', selected.fields.service],
              ['Options', selected.fields.options], ['Special requests', selected.fields.specialRequirements],
            ].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value || 'Not supplied'}</strong></div>)}</div>
            <div className="detailSectionTitle">CONVERSATION</div><div className="adminThread">{messages.map((entry) => <div className={`adminThreadMessage ${entry.role === 'customer' ? 'threadCustomer' : 'threadAgent'}`} key={entry.id}><span>{entry.role === 'customer' ? 'Customer' : entry.role === 'human' ? 'Staff' : 'Assistant'} · {dateTime(entry.createdAt)}</span><p>{entry.text}</p></div>)}</div>
            <form onSubmit={sendReply} className="adminReply"><textarea value={reply} onChange={(event) => setReply(event.target.value)} maxLength={1200} placeholder="Reply as a human agent…" rows={2} aria-label="Human reply" /><button disabled={!reply.trim() || saving} title="Send a human reply"><Send size={18} /></button></form>
            <div className="detailManage"><label>Status<select value={selected.status} onChange={(event) => void update({ status: event.target.value as Inquiry['status'] })}>{statuses.map((status) => <option value={status} key={status}>{labels[status]}</option>)}</select></label><label>Internal note<textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} maxLength={2000} placeholder="Only visible to the team" /></label><div className="detailManageActions"><button className="adminOutlineButton" onClick={() => void update({ staffNote: note })} disabled={saving}>Save note <Check size={16} /></button><button className="deleteInquiry" onClick={() => void deleteSelected()} disabled={saving}><Trash2 size={14} /> Delete inquiry</button></div>{flash && <p className="adminFlash" role="status">{flash}</p>}</div>
          </> : <div className="adminEmpty"><MessageSquareText size={28} /><h3>Select an inquiry</h3><p>Conversation details and human handover will appear here.</p></div>}</section></div></>}

        {tab === 'content' && <><div className="adminPageHeading"><div><p className="eyebrow darkEyebrow">KEEP EVERY ANSWER ACCURATE</p><h1>Website content.</h1><p>Update the visible copy and the assistant’s approved answers in one place.</p></div><Link className="adminOutlineButton" href="/" target="_blank">View site <ArrowUpRight size={16} /></Link></div><ContentEditor initialSettings={initialSettings} approved={approved} /></>}
      </div>
    </div>
  </div>;
}

function Metric({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: string }) {
  return <div className={`metricCard metric-${tone}`}><div className="metricTop"><span>{label}</span>{icon}</div><strong>{String(value).padStart(2, '0')}</strong><span className="metricFoot">As of now <ArrowDownRight size={15} /></span></div>;
}
