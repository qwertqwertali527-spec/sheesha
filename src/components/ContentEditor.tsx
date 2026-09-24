'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronDown, CircleAlert, Plus, Save, Trash2 } from 'lucide-react';
import type { FAQ, Service, SiteSettings } from '@/lib/types';

interface Props { initialSettings: SiteSettings; approved: boolean }

export function ContentEditor({ initialSettings, approved }: Props) {
  const [settings, setSettings] = useState<SiteSettings>(structuredClone(initialSettings));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [openService, setOpenService] = useState<string | null>(initialSettings.services[0]?.id ?? null);
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/content', { cache: 'no-store' }).then((response) => response.json())
      .then((data: { settings?: SiteSettings }) => { if (data.settings) setSettings(data.settings); })
      .catch(() => { /* Keep server-rendered content. */ });
  }, []);

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value })); setMessage('');
  }
  function updateService(id: string, patch: Partial<Service>) {
    update('services', settings.services.map((service) => service.id === id ? { ...service, ...patch } : service));
  }
  function updateFAQ(id: string, patch: Partial<FAQ>) {
    update('faqs', settings.faqs.map((faq) => faq.id === id ? { ...faq, ...patch } : faq));
  }

  async function save() {
    setSaving(true); setMessage('');
    try {
      const response = await fetch('/api/admin/content', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await response.json() as { error?: string; settings?: SiteSettings };
      if (!response.ok) throw new Error(data.error || 'Unable to save.');
      if (data.settings) setSettings(data.settings);
      setMessage('Saved. The website and assistant now use this approved content.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save.'); }
    finally { setSaving(false); }
  }

  return <div className="editorLayout"><div className="editorMain">
    <section className="editorCard"><div className="editorCardHeader"><div><p className="eyebrow darkEyebrow">01 / THE FIRST IMPRESSION</p><h2>Brand & introduction</h2></div><span className="editorIcon">✳</span></div><div className="formGrid"><Field label="Brand name" value={settings.brandName} onChange={(value) => update('brandName', value)} maxLength={40} /><Field label="Hero eyebrow" value={settings.heroEyebrow} onChange={(value) => update('heroEyebrow', value)} maxLength={120} /><Field label="Hero headline" value={settings.heroTitle} onChange={(value) => update('heroTitle', value)} maxLength={90} /><Field label="Hero accent" value={settings.heroAccent} onChange={(value) => update('heroAccent', value)} maxLength={90} /><Field label="Hero description" value={settings.heroDescription} onChange={(value) => update('heroDescription', value)} multiline wide maxLength={400} /><Field label="About headline" value={settings.aboutTitle} onChange={(value) => update('aboutTitle', value)} wide maxLength={120} /><Field label="About description" value={settings.aboutDescription} onChange={(value) => update('aboutDescription', value)} multiline wide maxLength={800} /></div></section>

    <section className="editorCard"><div className="editorCardHeader"><div><p className="eyebrow darkEyebrow">02 / THE EXPERIENCE</p><h2>Services & packages</h2></div><span className="editorSmallCount">{settings.services.length} items</span></div><p className="editorHelper">Only include services actually offered and approved for publication. Prices are intentionally quote-only in this MVP.</p><div className="editorAccordion">{settings.services.map((service) => <div className="editorAccordionItem" key={service.id}><button className="editorAccordionTrigger" onClick={() => setOpenService(openService === service.id ? null : service.id)}><span>{service.title || 'Untitled service'}</span><ChevronDown className={openService === service.id ? 'rotated' : ''} size={18} /></button>{openService === service.id && <div className="editorAccordionBody"><Field label="Short label" value={service.eyebrow} onChange={(value) => updateService(service.id, { eyebrow: value })} maxLength={80} /><Field label="Service name" value={service.title} onChange={(value) => updateService(service.id, { title: value })} maxLength={100} /><Field label="Description" value={service.description} onChange={(value) => updateService(service.id, { description: value })} multiline maxLength={450} /><Field label="Highlights (one per line, maximum 5)" value={service.features.join('\n')} onChange={(value) => updateService(service.id, { features: value.split('\n').map((entry) => entry.trim()).filter(Boolean).slice(0, 5) })} multiline maxLength={500} />{settings.services.length > 1 && <button className="editorRemove" onClick={() => { update('services', settings.services.filter((item) => item.id !== service.id)); setOpenService(null); }}><Trash2 size={14} /> Remove service</button>}</div>}</div>)}</div>{settings.services.length < 6 && <button className="editorAdd" onClick={() => { const id = crypto.randomUUID(); update('services', [...settings.services, { id, eyebrow: 'NEW / SERVICE', title: 'New service', description: 'Describe the approved offering.', features: ['Details confirmed by the team'] }]); setOpenService(id); }}><Plus size={16} /> Add a service</button>}</section>

    <section className="editorCard"><div className="editorCardHeader"><div><p className="eyebrow darkEyebrow">03 / CLEAR ANSWERS</p><h2>Frequently asked questions</h2></div><span className="editorSmallCount">{settings.faqs.length} answers</span></div><p className="editorHelper">The assistant may repeat these answers verbatim. Do not save an unverified price, area, policy or availability claim.</p><div className="editorAccordion">{settings.faqs.map((faq) => <div className="editorAccordionItem" key={faq.id}><button className="editorAccordionTrigger" onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}><span>{faq.question || 'New question'}</span><ChevronDown className={openFAQ === faq.id ? 'rotated' : ''} size={18} /></button>{openFAQ === faq.id && <div className="editorAccordionBody"><Field label="Question" value={faq.question} onChange={(value) => updateFAQ(faq.id, { question: value })} maxLength={200} /><Field label="Approved answer" value={faq.answer} onChange={(value) => updateFAQ(faq.id, { answer: value })} multiline maxLength={600} /><button className="editorRemove" onClick={() => { update('faqs', settings.faqs.filter((item) => item.id !== faq.id)); setOpenFAQ(null); }}><Trash2 size={14} /> Remove question</button></div>}</div>)}</div>{settings.faqs.length < 20 && <button className="editorAdd" onClick={() => { const id = crypto.randomUUID(); update('faqs', [...settings.faqs, { id, question: 'New question?', answer: 'Add an approved answer.' }]); setOpenFAQ(id); }}><Plus size={16} /> Add a question</button>}</section>

    <section className="editorCard"><div className="editorCardHeader"><div><p className="eyebrow darkEyebrow">04 / BUSINESS DETAILS</p><h2>Locations & contact</h2></div><span className="editorIcon">◎</span></div><div className="formGrid"><Field label="Areas (one per line; only confirmed areas)" value={settings.areas.join('\n')} onChange={(value) => update('areas', value.split('\n').map((entry) => entry.trim()).filter(Boolean).slice(0, 20))} multiline wide maxLength={1200} /><Field label="Business hours" value={settings.hours} onChange={(value) => update('hours', value)} wide maxLength={200} /><Field label="Public email (optional)" value={settings.contactEmail} onChange={(value) => update('contactEmail', value)} maxLength={120} /><Field label="Public phone (optional)" value={settings.contactPhone} onChange={(value) => update('contactPhone', value)} maxLength={40} /></div></section>

    <div className="editorSaveBar"><span>{message && <span className="editorMessage" role="status"><Check size={15} /> {message}</span>}</span><button onClick={() => void save()} disabled={saving} className="button buttonDark"><Save size={17} /> {saving ? 'Saving…' : 'Save changes'}</button></div>
  </div><aside className="editorAside"><div className="editorAsideCard"><CircleAlert size={22} /><h3>A note on accuracy</h3><p>The assistant cannot invent your prices, availability, hours or policies. Keep this knowledge current and remove any claim you cannot confirm.</p><div><Check size={15} /> Changes appear on the website</div><div><Check size={15} /> Answers stay grounded in approved FAQs</div><div><Check size={15} /> A human confirms all inquiries</div></div><div className="editorAsideFoot">{approved ? 'Keep all published details current. WhatsApp remains a separate, policy-gated connection.' : 'Public launch and WhatsApp messaging remain off until the required legal and platform approvals are complete.'}</div></aside></div>;
}

function Field({ label, value, onChange, multiline, wide, maxLength }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; wide?: boolean; maxLength?: number }) {
  return <label className={`editorField ${wide ? 'fieldWide' : ''}`}><span>{label}</span>{multiline ? <textarea rows={3} value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} /> : <input value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} />}</label>;
}
