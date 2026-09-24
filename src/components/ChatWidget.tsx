'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Bot, Check, ChevronDown, MessageCircle, Send, ShieldCheck, Sparkles, X } from 'lucide-react';
import type { ChatMessage, Inquiry } from '@/lib/types';

type Mode = 'ai-assisted' | 'guided-demo';
type ChatData = { inquiry: Inquiry | null; messages: ChatMessage[]; mode: Mode; error?: string };

interface Props {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  selectedService: string;
  mode: Mode;
  approved: boolean;
  privacyUrl: string;
}

function timeLabel(value: string): string {
  return new Intl.DateTimeFormat('en', { timeZone: 'Asia/Dubai', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

export function ChatWidget({ open, onOpen, onClose, selectedService, mode, approved, privacyUrl }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [activeMode, setActiveMode] = useState<Mode>(mode);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [consent, setConsent] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoading(true);
    async function refresh() {
      try {
        const response = await fetch('/api/chat', { cache: 'no-store' });
        if (!response.ok) throw new Error('Could not load conversation.');
        const data = await response.json() as ChatData;
        if (alive) { setInquiry(data.inquiry); setMessages(data.messages); setActiveMode(data.mode); setError(''); }
      } catch {
        if (alive) setError('Could not load the conversation. Please try again.');
      } finally { if (alive) setLoading(false); }
    }
    void refresh();
    const interval = setInterval(() => { if (!sending) void refresh(); }, 6000);
    return () => { alive = false; clearInterval(interval); };
  }, [open, sending]);

  useEffect(() => { if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [open, messages, pending, loading]);
  useEffect(() => {
    if (open && selectedService) {
      setInput(`I'd like to ask about ${selectedService}.`);
      inputRef.current?.focus();
    }
  }, [selectedService, open]);
  useEffect(() => {
    if (!open) return;
    const onEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [open, onClose]);

  async function startFresh() {
    try {
      const response = await fetch('/api/chat/reset', { method: 'POST' });
      if (!response.ok) throw new Error('Could not start a new inquiry.');
      setInquiry(null); setMessages([]); setInput(''); setAgeConfirmed(false); setConsent(false); setError('');
    } catch { setError('Could not start a new inquiry. Please try again.'); }
  }

  async function send(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || sending || (!inquiry && (!ageConfirmed || !consent))) return;
    setSending(true); setPending(message); setInput(''); setError('');
    try {
      const response = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, consent, ageConfirmed }),
      });
      const data = await response.json() as ChatData;
      if (!response.ok) throw new Error(data.error || 'Could not send message.');
      setMessages(data.messages); setInquiry(data.inquiry); setActiveMode(data.mode);
    } catch (error) {
      setInput(message);
      setError(error instanceof Error ? error.message : 'Could not send message.');
    } finally { setSending(false); setPending(''); inputRef.current?.focus(); }
  }

  return <>
    {!open && <button className="chatLauncher" type="button" onClick={onOpen} aria-label="Open inquiry assistant"><span className="launcherSparkle">✳</span><span>Ask Layali</span><MessageCircle size={19} /></button>}
    {open && <>
      <div className="chatOverlay" onClick={onClose} aria-hidden="true" />
      <aside className="chatPanel" role="dialog" aria-modal="true" aria-label="Inquiry assistant">
        <div className="chatHeader"><div className="chatAvatar"><span>✳</span></div><div className="chatHeaderText"><strong>Layali concierge</strong><span><span className="onlineDot" /> {inquiry?.status === 'needs_human' || inquiry?.status === 'in_progress' ? 'With the team' : activeMode === 'ai-assisted' ? 'AI-assisted inquiry' : 'Guided demo assistant'}</span></div><button className="chatClose" onClick={onClose} aria-label="Close assistant"><X size={21} /></button></div>
        <div className="chatSubhead"><ShieldCheck size={14} /><span>18+ only · A person confirms every detail</span><ChevronDown size={14} /></div>
        <div className="chatMessages" aria-live="polite">
          <div className="chatDateDivider"><span>TODAY · DUBAI TIME</span></div>
          <div className="messageRow assistantRow"><div className="messageAvatar">✳</div><div className="messageBubble assistantBubble"><p>Hello, welcome to Layali. Tell me what you have in mind, and I’ll gather the essentials for the team. I can’t confirm a price, availability or booking.</p><small>Layali assistant</small></div></div>
          {messages.map((entry) => <div className={`messageRow ${entry.role === 'customer' ? 'customerRow' : 'assistantRow'}`} key={entry.id}>
            {entry.role !== 'customer' && <div className="messageAvatar">{entry.role === 'human' ? <span>H</span> : '✳'}</div>}
            <div className={`messageBubble ${entry.role === 'customer' ? 'customerBubble' : 'assistantBubble'}`}><p>{entry.text}</p><small>{entry.role === 'human' ? 'The team' : entry.role === 'customer' ? 'You' : 'Assistant'} · {timeLabel(entry.createdAt)}</small></div>
          </div>)}
          {pending && <div className="messageRow customerRow"><div className="messageBubble customerBubble"><p>{pending}</p><small>Sending…</small></div></div>}
          {sending && <div className="chatTyping"><span /><span /><span /></div>}
          {loading && <div className="chatLoading">Loading your conversation…</div>}
          {!messages.length && !loading && <div className="chatSuggestions"><span>TRY AN EXAMPLE</span><button onClick={() => { setInput('I need 2 equipment units tonight in Dubai Marina around 9 PM.'); inputRef.current?.focus(); }}>“2 units tonight in Dubai Marina at 9 PM” <ArrowUpRight size={14} /></button><button onClick={() => { setInput('I would like to speak to a person.'); inputRef.current?.focus(); }}>“I’d like to speak to a person” <ArrowUpRight size={14} /></button></div>}
          {inquiry?.status === 'needs_human' && <div className="handoffNote"><Check size={16} /><span>Your request is in the staff inbox. A person will review it; no booking is confirmed.</span></div>}
          {(inquiry?.status === 'needs_human' || inquiry?.status === 'in_progress' || inquiry?.status === 'closed') && <button className="freshInquiryButton" onClick={() => void startFresh()}>Start a separate inquiry <ArrowUpRight size={14} /></button>}
          <div ref={bottomRef} />
        </div>
        <div className="chatComposer">
          {!inquiry && <div className="chatConsent"><label><input type="checkbox" checked={ageConfirmed} onChange={(event) => setAgeConfirmed(event.target.checked)} /> I confirm I am 18 or older.</label><label><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /> I agree to the <Link href={privacyUrl} target="_blank">privacy notice</Link> and inquiry processing.</label></div>}
          {error && <p className="chatError" role="alert">{error}</p>}
          <form onSubmit={send} className="chatForm"><textarea ref={inputRef} value={input} maxLength={900} rows={1} placeholder={inquiry?.status === 'needs_human' || inquiry?.status === 'in_progress' ? 'Add a note for the team…' : 'Tell us about your plans…'} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} aria-label="Your message" /><button type="submit" disabled={!input.trim() || sending || (!inquiry && (!ageConfirmed || !consent))} aria-label="Send message"><Send size={18} /></button></form>
          <p className="chatDisclaimer">{approved ? 'No booking or price is confirmed in chat.' : 'Concept preview · Please use fictional details. No live bookings.'} <Sparkles size={11} /></p>
        </div>
      </aside>
    </>}
  </>;
}
