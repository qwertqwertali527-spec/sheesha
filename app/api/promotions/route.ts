import { NextRequest, NextResponse } from "next/server";
import { getPromotions, savePromotions } from "@/lib/db";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");

  const promotions = getPromotions();

  if (code) {
    const promo = promotions.find(p => p.code.toLowerCase() === code.toLowerCase());
    if (!promo) {
      return NextResponse.json({ valid: false, error: "Invalid coupon code" });
    }

    if (!promo.isActive) {
      return NextResponse.json({ valid: false, error: "Coupon is inactive" });
    }

    if (promo.validUntil && new Date(promo.validUntil) < new Date()) {
      return NextResponse.json({ valid: false, error: "Coupon expired" });
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ valid: false, error: "Coupon usage limit reached" });
    }

    return NextResponse.json({ valid: true, promotion: promo });
  }

  return NextResponse.json(promotions.filter(p => p.isActive));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, promotion } = body;

    if (password !== (process.env.ADMIN_PASSWORD || "admin123")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const promotions = getPromotions();
    
    if (promotion.id) {
      const idx = promotions.findIndex(p => p.id === promotion.id);
      if (idx >= 0) {
        promotions[idx] = { ...promotions[idx], ...promotion, updatedAt: new Date().toISOString() };
      }
    } else {
      promotions.unshift({
        id: `promo_${Date.now()}`,
        code: promotion.code.toUpperCase(),
        title: promotion.title,
        description: promotion.description,
        discountType: promotion.discountType,
        discountValue: parseFloat(promotion.discountValue),
        minOrderAmount: parseFloat(promotion.minOrderAmount) || 0,
        maxUses: promotion.maxUses ? parseInt(promotion.maxUses) : undefined,
        usedCount: 0,
        validFrom: new Date().toISOString(),
        validUntil: promotion.validUntil || undefined,
        isActive: true,
        applicablePackages: promotion.applicablePackages || "all",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as any);
    }

    savePromotions(promotions);
    return NextResponse.json({ success: true, promotions });
  } catch (e) {
    return NextResponse.json({ error: "Failed to save promotion" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get("id");
  const password = searchParams.get("password");

  if (password !== (process.env.ADMIN_PASSWORD || "admin123")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const promotions = getPromotions();
  const filtered = promotions.filter(p => p.id !== id);
  savePromotions(filtered);

  return NextResponse.json({ success: true });
}
