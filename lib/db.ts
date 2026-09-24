// Phase 2: Database layer with Prisma + JSON fallback
import fs from 'fs'
import path from 'path'

let prisma: any = null

try {
  if (process.env.DATABASE_URL) {
    const { PrismaClient } = require('@prisma/client')
    prisma = new PrismaClient()
    console.log('Prisma client initialized')
  }
} catch (e) {
  console.log('Prisma not available, using JSON fallback:', (e as Error).message)
  prisma = null
}

export function getPrisma() {
  return prisma
}

export function isPrismaAvailable() {
  return !!prisma
}

export interface CustomerData {
  id: string
  phone: string
  name?: string
  email?: string
  totalOrders: number
  totalSpent: number
  lastOrderAt?: string
  tags?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PromotionData {
  id: string
  code: string
  title: string
  description?: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount?: number
  maxUses?: number
  usedCount: number
  validFrom: string
  validUntil?: string
  isActive: boolean
  applicablePackages?: string
  createdAt: string
  updatedAt: string
}

const customersPath = path.join(process.cwd(), 'data', 'customers.json')
const promotionsPath = path.join(process.cwd(), 'data', 'promotions.json')
const bookingsPath = path.join(process.cwd(), 'data', 'bookings.json')
const analyticsPath = path.join(process.cwd(), 'data', 'analytics.json')

function ensureFile(filePath: string, defaultData: any) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2))
    }
  } catch {}
}

ensureFile(customersPath, [])
ensureFile(promotionsPath, [
  {
    id: 'promo_welcome',
    code: 'WELCOME20',
    title: 'Welcome Discount - 20% Off First Order',
    description: 'Get 20% off your first order, valid for all packages',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 99,
    maxUses: 100,
    usedCount: 12,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
    isActive: true,
    applicablePackages: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'promo_ramadan',
    code: 'RAMADAN25',
    title: 'Ramadan Special - AED 25 Off',
    description: 'Special Ramadan offer, AED 25 off orders above AED 200',
    discountType: 'fixed',
    discountValue: 25,
    minOrderAmount: 200,
    maxUses: 50,
    usedCount: 8,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 60*24*60*60*1000).toISOString(),
    isActive: true,
    applicablePackages: 'all',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'promo_party',
    code: 'PARTY50',
    title: 'Party Package - AED 50 Off',
    description: 'Get AED 50 off Party and VIP packages',
    discountType: 'fixed',
    discountValue: 50,
    minOrderAmount: 300,
    maxUses: 20,
    usedCount: 3,
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 15*24*60*60*1000).toISOString(),
    isActive: true,
    applicablePackages: '["party","vip"]',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
])
ensureFile(bookingsPath, [])
ensureFile(analyticsPath, [])

export function getCustomers(): CustomerData[] {
  try {
    const raw = fs.readFileSync(customersPath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveCustomers(customers: CustomerData[]) {
  fs.writeFileSync(customersPath, JSON.stringify(customers, null, 2))
}

export function getPromotions(): PromotionData[] {
  try {
    const raw = fs.readFileSync(promotionsPath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function savePromotions(promos: PromotionData[]) {
  fs.writeFileSync(promotionsPath, JSON.stringify(promos, null, 2))
}

export function getBookings(): any[] {
  try {
    const raw = fs.readFileSync(bookingsPath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveBookings(bookings: any[]) {
  fs.writeFileSync(bookingsPath, JSON.stringify(bookings, null, 2))
}

export function getAnalytics(): any[] {
  try {
    const raw = fs.readFileSync(analyticsPath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveAnalytics(events: any[]) {
  fs.writeFileSync(analyticsPath, JSON.stringify(events, null, 2))
}

export function trackEvent(eventType: string, metadata?: any) {
  const events = getAnalytics()
  events.unshift({
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    eventType,
    metadata: metadata ? JSON.stringify(metadata) : null,
    createdAt: new Date().toISOString()
  })
  saveAnalytics(events.slice(0, 1000))
}
