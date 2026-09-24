import { NextRequest, NextResponse } from "next/server";
import { getBookings, saveBookings, getCustomers, saveCustomers, trackEvent } from "@/lib/db";
import { getKnowledge } from "@/lib/knowledge";
import { calculateTotal } from "@/lib/payment";
import { sendBusinessNotification } from "@/lib/whatsapp";

export async function GET(req: NextRequest) {
  const bookings = getBookings();
  return NextResponse.json(bookings);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, time, location, area, package: pkg, numberOfSheeshas, flavors, name, phone, specialRequirements, couponCode } = body;

    if (!date || !time || !location || !pkg || !name || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bookings = getBookings();
    const customers = getCustomers();

    const promotions: any[] = [];
    const pricing = calculateTotal(pkg, numberOfSheeshas || 1, couponCode, promotions);

    const booking = {
      id: `BKG-${Date.now().toString(36).toUpperCase()}`,
      customerId: null,
      date,
      time,
      duration: 240,
      location,
      area,
      package: pkg,
      numberOfSheeshas: numberOfSheeshas || 1,
      flavors: flavors || "",
      name,
      phone,
      specialRequirements: specialRequirements || "",
      status: "pending",
      paymentMethod: "cash",
      totalAmount: pricing.total,
      couponCode: couponCode || null,
      discount: pricing.discount,
      notes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    bookings.unshift(booking);
    saveBookings(bookings.slice(0, 500));

    let customer = customers.find(c => c.phone === phone);
    if (!customer) {
      customer = {
        id: `CUST-${Date.now().toString(36).toUpperCase()}`,
        phone,
        name,
        email: "",
        totalOrders: 1,
        totalSpent: pricing.total,
        lastOrderAt: new Date().toISOString(),
        tags: "new",
        notes: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      customers.unshift(customer);
    } else {
      customer.totalOrders += 1;
      customer.totalSpent += pricing.total;
      customer.lastOrderAt = new Date().toISOString();
      customer.name = name || customer.name;
      customer.updatedAt = new Date().toISOString();
    }
    saveCustomers(customers);

    trackEvent("booking_completed", { package: pkg, area, total: pricing.total });

    const summary = `
📅 NEW BOOKING - ONLINE
ID: ${booking.id}
Name: ${name}
Phone: ${phone}
Date: ${date} at ${time}
Location: ${location}, ${area}
Package: ${pkg} x${numberOfSheeshas}
Flavors: ${flavors || "Not specified"}
Total: AED ${pricing.total} (Discount: AED ${pricing.discount})
Special: ${specialRequirements || "None"}
Status: Pending confirmation
`;

    await sendBusinessNotification(summary);

    return NextResponse.json({ success: true, booking, pricing });
  } catch (e) {
    console.error("Booking error:", e);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
