import { z } from 'zod';

const textField = (max: number) => z.string().trim().min(1).max(max);

export const settingsSchema = z.object({
  brandName: textField(40),
  heroEyebrow: textField(120),
  heroTitle: textField(90),
  heroAccent: textField(90),
  heroDescription: textField(400),
  aboutTitle: textField(120),
  aboutDescription: textField(800),
  hours: z.string().trim().max(200),
  contactEmail: z.union([z.email(), z.literal('')]),
  contactPhone: z.string().trim().max(40),
  areas: z.array(textField(80)).max(20),
  services: z.array(z.object({
    id: textField(80),
    eyebrow: textField(80),
    title: textField(100),
    description: textField(450),
    features: z.array(textField(100)).max(5),
  })).min(1).max(6),
  faqs: z.array(z.object({
    id: textField(80),
    question: textField(200),
    answer: textField(600),
  })).max(20),
});

export const chatInputSchema = z.object({
  message: z.string().trim().min(1).max(900),
  consent: z.boolean().optional(),
  ageConfirmed: z.boolean().optional(),
});

export const adminReplySchema = z.object({ text: z.string().trim().min(1).max(1200) });
export const adminUpdateSchema = z.object({
  status: z.enum(['collecting', 'needs_human', 'in_progress', 'closed']).optional(),
  staffNote: z.string().trim().max(2000).optional(),
}).refine((value) => value.status !== undefined || value.staffNote !== undefined);
