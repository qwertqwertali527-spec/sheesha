'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronDown,
  Clock3, MapPin, Menu, MessageCircle, MoveUpRight, Sparkles, X,
} from 'lucide-react';
import { ChatWidget } from './ChatWidget';
import type { SiteSettings } from '@/lib/types';

interface Props {
  settings: SiteSettings;
  approved: boolean;
  whatsappEnabled: boolean;
  whatsappNumber: string;
  mode: 'ai-assisted' | 'guided-demo';
  privacyUrl: string;
}

const serviceImages = ['/detail-layali.jpg', '/experience-layali.jpg', '/hero-layali.jpg'];

export function HomePage({ settings, approved, whatsappEnabled, whatsappNumber, mode, privacyUrl }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [openFAQ, setOpenFAQ] = useState<string | null>(settings.faqs[0]?.id ?? null);
  const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello, I would like to make an inquiry.')}`;

  function openInquiry(service = '') {
    setSelectedService(service);
    setChatOpen(true);
    setMenuOpen(false);
  }

  return <>
    {!approved && <div className="previewNotice" role="status">
      <span className="previewPulse" /> <strong>CONCEPT PREVIEW</strong>
      <span className="previewSeparator" /> Not accepting live bookings · Use fictional details to test
      <span className="previewNoticeRight">WhatsApp connection pending policy clearance</span>
    </div>}

    <div className="heroShell" id="top">
      <div className="heroBackdrop" aria-hidden="true" />
      <div className="heroShade" aria-hidden="true" />
      <header className="siteHeader container">
        <a href="#top" className="brand" aria-label={`${settings.brandName} home`} onClick={() => setMenuOpen(false)}>
          <span className="brandGlyph" aria-hidden="true">✳</span>
          <span className="brandWord">{settings.brandName}</span><span className="brandPeriod">.</span>
        </a>
        <nav className="desktopNav" aria-label="Main navigation">
          <a href="#story">Our story</a>
          <a href="#experiences">Experiences</a>
          <a href="#how-it-works">How it works</a>
          <a href="#areas">Locations</a>
          <a href="#faq">FAQs</a>
        </nav>
        <div className="headerActions">
          {whatsappEnabled ? <a href={waLink} target="_blank" rel="noopener noreferrer" className="headerCta">WhatsApp inquiry <ArrowUpRight size={16} /></a> :
            <button className="headerCta" onClick={() => openInquiry()}>Start an inquiry <ArrowUpRight size={16} /></button>}
          <button className="mobileMenuButton" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </header>
      {menuOpen && <nav className="mobileNav" aria-label="Mobile navigation">
        {[
          ['Our story', '#story'], ['Experiences', '#experiences'], ['How it works', '#how-it-works'],
          ['Locations', '#areas'], ['FAQs', '#faq'],
        ].map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label} <ArrowUpRight size={16} /></a>)}
        <button onClick={() => openInquiry()}>Start an inquiry <ArrowRight size={18} /></button>
      </nav>}

      <section className="heroContent container" aria-labelledby="hero-title">
        <div className="heroText">
          <div className="eyebrow heroEyebrow"><span className="eyebrowLine" />{settings.heroEyebrow}</div>
          <h1 id="hero-title">{settings.heroTitle}<br /><em>{settings.heroAccent}</em></h1>
          <p>{settings.heroDescription}</p>
          <div className="heroButtons">
            {whatsappEnabled ? <a className="button buttonGold" href={waLink} target="_blank" rel="noopener noreferrer">Begin on WhatsApp <ArrowUpRight size={19} /></a> :
              <button className="button buttonGold" onClick={() => openInquiry()}>Start an inquiry <ArrowUpRight size={19} /></button>}
            <a className="textButton lightTextButton" href="#experiences">Explore the experience <ArrowDownRight size={17} /></a>
          </div>
          <div className="heroSmallPrint"><span className="smallLine" /> For adults 18+ · Every request reviewed by a person</div>
        </div>
        <div className="heroSideNote"><span>01 / 03</span><div /> <span>DUBAI · AFTER DARK</span></div>
      </section>
      <div className="heroBottom container">
        <span>THE ART OF MAKING TIME TOGETHER</span>
        <a href="#story" aria-label="Scroll to our story"><span>SCROLL TO EXPLORE</span><ArrowDownRight size={20} /></a>
      </div>
    </div>

    <div className="valueStrip" aria-label="Our approach">
      <div className="container valueStripInner">
        <div><span>01</span> A thoughtful starting point</div>
        <div><span>02</span> Made around your plans</div>
        <div><span>03</span> Always confirmed by a person</div>
      </div>
    </div>

    <main>
      <section id="story" className="storySection sectionSpacing">
        <div className="container storyGrid">
          <div className="storyPhotoWrap">
            <div className="storyPhoto" role="img" aria-label="A softly lit Dubai terrace prepared for an evening gathering" />
            <div className="photoCaption"><span className="captionStar">✳</span><span>MADE FOR THE MOMENTS<br />THAT MATTER</span></div>
          </div>
          <div className="storyCopy">
            <p className="eyebrow darkEyebrow"><span className="eyebrowLine" /> THE LAYALI FEELING</p>
            <h2>{settings.aboutTitle}</h2>
            <div className="storyDivider"><span>✦</span></div>
            <p className="storyDescription">{settings.aboutDescription}</p>
            <a href="#how-it-works" className="textButton darkTextButton">Discover how it works <MoveUpRight size={18} /></a>
            <div className="storyQuote">“The best evenings aren’t hurried.<br /><em>They’re simply well considered.”</em></div>
          </div>
        </div>
      </section>

      <section id="experiences" className="experiencesSection sectionSpacing">
        <div className="container">
          <div className="sectionHeadingRow">
            <div>
              <p className="eyebrow darkEyebrow"><span className="eyebrowLine" /> TAILORED TO THE OCCASION</p>
              <h2>Every gathering has<br /><em>its own rhythm.</em></h2>
            </div>
            <div className="sectionHeadingAside"><p>These are starting points, not fixed bookings. Share the details and a person will confirm what is possible.</p><span>EXPLORE THE CONCEPT <ArrowDownRight size={18} /></span></div>
          </div>
          <div className="serviceGrid">
            {settings.services.map((service, index) => <article className="serviceCard" key={service.id}>
              <div className="serviceImage" style={{ backgroundImage: `linear-gradient(180deg, rgba(10, 30, 27, .02) 10%, rgba(10, 28, 25, .28) 48%, rgba(7, 23, 21, .96) 100%), url('${serviceImages[index % serviceImages.length]}')` }} />
              <div className="serviceTop"><span>{String(index + 1).padStart(2, '0')}</span><Sparkles size={18} strokeWidth={1.4} /></div>
              <div className="serviceBody"><p className="serviceEyebrow">{service.eyebrow}</p><h3>{service.title}</h3><p className="serviceDescription">{service.description}</p>
                <div className="serviceFeatures">{service.features.map((feature) => <span key={feature}><Check size={12} /> {feature}</span>)}</div>
                <button className="serviceLink" onClick={() => openInquiry(service.title)}>Enquire about this <ArrowUpRight size={17} /></button>
              </div>
            </article>)}
          </div>
          <p className="serviceFootnote">{approved ? 'All requests are subject to staff confirmation. Prices and availability are not guaranteed by this website.' : 'Illustrative service formats only. Actual offerings, prices and availability require business and legal approval.'}</p>
        </div>
      </section>

      <section className="quoteBand" aria-label="Our philosophy"><div className="container quoteBandInner"><span className="quoteBandStar">✳</span><p>Less organising.<br /><em>More being there.</em></p><span className="quoteBandIndex">LAYALI / 2026</span></div></section>

      <section id="how-it-works" className="howSection sectionSpacing">
        <div className="container">
          <div className="howHeader"><div><p className="eyebrow darkEyebrow"><span className="eyebrowLine" /> SIMPLE BY DESIGN</p><h2>From an idea to<br /><em>a lovely evening.</em></h2></div><p>No complicated checkout. Just a considered conversation and a real person to confirm the details.</p></div>
          <div className="stepsGrid">
            <article className="step"><span className="stepNumber">01 <span>✦</span></span><div className="stepIcon"><MessageCircle size={25} strokeWidth={1.4} /></div><h3>Tell us your plans</h3><p>Share your preferred date, time, location and what you have in mind through the inquiry assistant.</p></article>
            <article className="step"><span className="stepNumber">02 <span>✦</span></span><div className="stepIcon"><Sparkles size={25} strokeWidth={1.4} /></div><h3>We listen carefully</h3><p>The assistant records your details and asks only for what’s missing. Anything uncertain goes straight to the team.</p></article>
            <article className="step"><span className="stepNumber">03 <span>✦</span></span><div className="stepIcon"><Check size={25} strokeWidth={1.4} /></div><h3>A person confirms</h3><p>The team reviews your request and confirms any service, timing and quote. An inquiry is never an automatic booking.</p></article>
          </div>
        </div>
      </section>

      <section id="areas" className="areasSection">
        <div className="container areasGrid">
          <div className="areasCopy">
            <p className="eyebrow lightEyebrow"><span className="eyebrowLine" /> YOUR CITY, YOUR SETTING</p>
            <h2>Where the evening<br /><em>takes you.</em></h2>
            <p>Tell us your location. Our team will confirm whether it can be accommodated—never assumed by an automated assistant.</p>
            <div className="areaChips">{settings.areas.map((area) => <span key={area}><MapPin size={14} /> {area}</span>)}</div>
            <p className="areasDisclaimer">{approved ? 'Location and timing are subject to staff confirmation.' : 'Illustrative neighbourhoods only · Coverage not confirmed in this concept preview.'}</p>
            <button className="textButton lightTextButton" onClick={() => openInquiry()}>Ask about your area <ArrowUpRight size={18} /></button>
          </div>
          <div className="areasVisual" aria-hidden="true"><div className="mapRing ringOne" /><div className="mapRing ringTwo" /><div className="mapRing ringThree" /><div className="mapCenter"><span>✳</span><strong>DUBAI</strong><small>AN EVENING AWAITS</small></div><span className="mapCoord coordOne">25°12′ N</span><span className="mapCoord coordTwo">55°16′ E</span><span className="mapPin pinOne" /><span className="mapPin pinTwo" /><span className="mapPin pinThree" /></div>
        </div>
      </section>

      <section id="faq" className="faqSection sectionSpacing">
        <div className="container faqGrid">
          <div className="faqIntro"><p className="eyebrow darkEyebrow"><span className="eyebrowLine" /> GOOD TO KNOW</p><h2>A few things<br /><em>worth knowing.</em></h2><p>Still have a question? Ask the assistant. If it doesn’t have an approved answer, your question goes to a person.</p><button className="textButton darkTextButton" onClick={() => openInquiry()}>Ask a question <ArrowUpRight size={18} /></button></div>
          <div className="faqList">{settings.faqs.map((faq, index) => <div className={`faqItem ${openFAQ === faq.id ? 'faqOpen' : ''}`} key={faq.id}>
            <button aria-expanded={openFAQ === faq.id} onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}><span className="faqIndex">{String(index + 1).padStart(2, '0')}</span><span>{faq.question}</span><ChevronDown className="faqChevron" size={20} /></button>
            {openFAQ === faq.id && <p>{faq.answer}</p>}
          </div>)}</div>
        </div>
      </section>

      <section className="closingSection" id="contact"><div className="closingBackground" /><div className="container closingInner"><p className="eyebrow lightEyebrow"><span className="eyebrowLine" /> WHENEVER YOU'RE READY</p><h2>Let’s make space<br /><em>for a good evening.</em></h2><p>It starts with a conversation. Tell us the essentials and a person will take it from there.</p>
        {whatsappEnabled ? <a className="button buttonGold" href={waLink} target="_blank" rel="noopener noreferrer">Start on WhatsApp <ArrowUpRight size={19} /></a> : <button className="button buttonGold" onClick={() => openInquiry()}>Start your inquiry <ArrowUpRight size={19} /></button>}
        <div className="closingContact"><span><Clock3 size={15} /> {settings.hours}</span>{settings.contactEmail && <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail} <ArrowUpRight size={15} /></a>}{settings.contactPhone && <a href={`tel:${settings.contactPhone}`}>{settings.contactPhone} <ArrowUpRight size={15} /></a>}</div>
      </div></section>
    </main>

    <footer className="footer"><div className="container"><div className="footerTop"><div><a href="#top" className="brand footerBrand"><span className="brandGlyph">✳</span><span className="brandWord">{settings.brandName}</span><span className="brandPeriod">.</span></a><p>For the moments that bring us together.</p></div><div className="footerLinks"><a href="#story">Our story</a><a href="#experiences">Experiences</a><a href="#how-it-works">How it works</a><a href="#faq">FAQs</a></div><div className="footerRight"><span>DUBAI, UAE</span><span>Adults 18+ only</span><span>Inquiries subject to human confirmation</span></div></div><div className="footerBottom"><span>© {new Date().getFullYear()} {settings.brandName}. {approved ? 'All rights reserved.' : 'Concept preview — not a live service.'}</span><div><Link href={privacyUrl} target={privacyUrl.startsWith('http') ? '_blank' : undefined}>Privacy notice</Link><Link href="/admin">Staff portal</Link><a href="#top">Back to top ↑</a></div></div></div></footer>

    <ChatWidget open={chatOpen} onOpen={() => openInquiry()} onClose={() => setChatOpen(false)} selectedService={selectedService} mode={mode} approved={approved} privacyUrl={privacyUrl} />
  </>;
}
