import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatWhatsAppLink(phone: string, message?: string) {
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${cleanPhone}${encodedMessage}`
}

export const DEFAULT_WA_MESSAGE = `Hi! I need sheesha delivery in Dubai. Can you help me with an order?`

export function generateInquiryId() {
  return `INQ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
}
