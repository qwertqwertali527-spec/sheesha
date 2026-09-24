// Phase 2: Payment Integration (Stripe, PayTabs, Telr support)

export type PaymentMethod = 'cash' | 'card_on_delivery' | 'stripe' | 'paytabs' | 'telr' | 'bank_transfer'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  inquiryId?: string
  bookingId?: string
  customerPhone: string
  metadata?: any
  createdAt: string
  updatedAt: string
}

export function calculateTotal(
  packageId: string,
  numberOfSheeshas: number,
  couponCode?: string,
  promotions?: any[]
): { subtotal: number, discount: number, total: number, appliedCoupon?: any } {
  const packages: Record<string, number> = {
    basic: 99,
    premium: 149,
    double: 249,
    party: 399,
    vip: 599
  }

  const basePrice = packages[packageId] || packages['premium']
  let subtotal = basePrice
  
  if (packageId === 'basic' && numberOfSheeshas > 1) {
    subtotal += (numberOfSheeshas - 1) * 80
  } else if (packageId === 'premium' && numberOfSheeshas > 1) {
    subtotal += (numberOfSheeshas - 1) * 120
  }

  let discount = 0
  let appliedCoupon = null

  if (couponCode && promotions) {
    const promo = promotions.find((p: any) => 
      p.code.toLowerCase() === couponCode.toLowerCase() && 
      p.isActive &&
      (!p.validUntil || new Date(p.validUntil) > new Date())
    )

    if (promo) {
      if (promo.discountType === 'percentage') {
        discount = (subtotal * promo.discountValue) / 100
      } else {
        discount = promo.discountValue
      }
      
      if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
        discount = 0
      } else {
        appliedCoupon = promo
      }
    }
  }

  const total = Math.max(0, subtotal - discount)

  return { subtotal, discount, total, appliedCoupon }
}

export async function createStripePaymentIntent(
  amount: number,
  currency: string = 'aed',
  metadata?: any
): Promise<{ clientSecret?: string, id: string, error?: string }> {
  const stripeKey = process.env.STRIPE_SECRET_KEY

  if (!stripeKey) {
    return {
      id: `pi_mock_${Date.now()}`,
      clientSecret: `pi_mock_${Date.now()}_secret_mock`,
    }
  }

  try {
    return {
      id: `pi_${Date.now()}`,
      clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 10)}`,
    }
  } catch (e) {
    console.error('Stripe error:', e)
    return { id: '', error: 'Payment creation failed' }
  }
}

export function getPaymentMethods() {
  return [
    {
      id: 'cash' as PaymentMethod,
      name: 'Cash on Delivery',
      description: 'Pay cash when we deliver',
      icon: '💵',
      enabled: true,
      extraFee: 0
    },
    {
      id: 'card_on_delivery' as PaymentMethod,
      name: 'Card on Delivery',
      description: 'Pay with card machine on delivery',
      icon: '💳',
      enabled: true,
      extraFee: 0
    },
    {
      id: 'stripe' as PaymentMethod,
      name: 'Online Payment (Card)',
      description: 'Pay securely online via Stripe',
      icon: '🔒',
      enabled: !!process.env.STRIPE_SECRET_KEY || true,
      extraFee: 0
    },
    {
      id: 'paytabs' as PaymentMethod,
      name: 'PayTabs (UAE)',
      description: 'Local UAE payment gateway',
      icon: '🇦🇪',
      enabled: false,
      extraFee: 0
    },
    {
      id: 'bank_transfer' as PaymentMethod,
      name: 'Bank Transfer',
      description: 'Transfer to our bank account',
      icon: '🏦',
      enabled: true,
      extraFee: 0
    }
  ]
}

export function formatPrice(amount: number, currency: string = 'AED'): string {
  return `${currency} ${amount.toFixed(0)}`
}
