import type { InquiryFields, SiteSettings } from './types';

/** Illustrative copy only. Do not publish as factual business claims. */
export const defaultSettings: SiteSettings = {
  brandName: 'LAYALI',
  heroEyebrow: 'AN EVENING, THOUGHTFULLY ARRANGED · DUBAI',
  heroTitle: 'Make room for',
  heroAccent: 'the moment.',
  heroDescription:
    'A more considered way to plan an evening at home. Share what you have in mind and let a real person take it from there.',
  aboutTitle: 'Good company. Beautifully considered.',
  aboutDescription:
    'From a quiet catch-up to a memorable celebration, the best evenings are the ones that feel effortless. This is a concept preview for a personalised equipment and event service; actual offerings, availability and delivery terms must be confirmed by the business.',
  hours: 'Hours to be confirmed',
  contactEmail: '',
  contactPhone: '',
  areas: ['Dubai Marina', 'Downtown Dubai', 'Jumeirah', 'Palm Jumeirah'],
  services: [
    {
      id: 'private-evening',
      eyebrow: '01 / AN INTIMATE SETTING',
      title: 'The Private Evening',
      description:
        'For smaller plans and unhurried conversations. Tell us the occasion; the team can discuss the right arrangement.',
      features: ['Personalised inquiry', 'Details confirmed by a person'],
    },
    {
      id: 'gathering',
      eyebrow: '02 / COME TOGETHER',
      title: 'The Gathering',
      description:
        'A thoughtful starting point for a night with friends. Share the group size, location and what matters most.',
      features: ['Flexible group requests', 'Quote on request'],
    },
    {
      id: 'occasion',
      eyebrow: '03 / SOMETHING SPECIAL',
      title: 'The Occasion',
      description:
        'For celebrations that deserve a little extra care. Our team reviews each request before any arrangement is confirmed.',
      features: ['Event inquiries', 'Human-led planning'],
    },
  ],
  faqs: [
    {
      id: 'booking',
      question: 'Is an inquiry a confirmed booking?',
      answer:
        'No. An inquiry only shares your preferences with the team. A person must confirm all details, availability and any final quote.',
    },
    {
      id: 'pricing',
      question: 'Where can I find pricing?',
      answer:
        'Pricing is not published in this concept preview. A team member can provide an approved quote after reviewing your request.',
    },
    {
      id: 'coverage',
      question: 'Which areas do you cover?',
      answer:
        'Coverage is not yet confirmed. The areas shown in this preview are illustrative; the team will confirm your location individually.',
    },
    {
      id: 'timing',
      question: 'Can I request a specific time?',
      answer:
        'Yes, you can share a preferred date and time in your inquiry. The team will check whether it can be accommodated; the assistant cannot confirm availability.',
    },
  ],
};

export const emptyFields = (): InquiryFields => ({
  name: null,
  contact: null,
  date: null,
  time: null,
  area: null,
  address: null,
  quantity: null,
  service: null,
  options: null,
  specialRequirements: null,
});
