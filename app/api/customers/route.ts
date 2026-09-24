import { NextRequest, NextResponse } from "next/server";
import { getCustomers, saveCustomers, getBookings } from "@/lib/db";
import { getInquiries } from "@/lib/storage";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const phone = searchParams.get("phone");

  const customers = getCustomers();
  const inquiries = getInquiries();
  const bookings = getBookings();

  if (phone) {
    const customer = customers.find(c => c.phone === phone);
    if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    const customerInquiries = inquiries.filter((i: any) => i.phoneNumber === phone || i.phone === phone);
    const customerBookings = bookings.filter((b: any) => b.phone === phone);
    
    return NextResponse.json({
      ...customer,
      inquiries: customerInquiries,
      bookings: customerBookings,
      totalOrders: customerInquiries.length + customerBookings.length
    });
  }

  if (customers.length === 0 && inquiries.length > 0) {
    const customerMap: Record<string, any> = {};
    inquiries.forEach((inq: any) => {
      const ph = inq.phoneNumber || inq.phone;
      if (!ph) return;
      if (!customerMap[ph]) {
        customerMap[ph] = {
          id: `CUST-${ph.slice(-6)}`,
          phone: ph,
          name: inq.name || "Customer",
          totalOrders: 0,
          totalSpent: 0,
          lastOrderAt: inq.createdAt,
          tags: "regular",
          createdAt: inq.createdAt,
          updatedAt: inq.updatedAt
        };
      }
      customerMap[ph].totalOrders += 1;
      customerMap[ph].lastOrderAt = inq.createdAt > customerMap[ph].lastOrderAt ? inq.createdAt : customerMap[ph].lastOrderAt;
    });
    return NextResponse.json(Object.values(customerMap));
  }

  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password, customer } = body;

    if (password !== (process.env.ADMIN_PASSWORD || "admin123")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customers = getCustomers();
    const idx = customers.findIndex(c => c.id === customer.id || c.phone === customer.phone);
    
    if (idx >= 0) {
      customers[idx] = { ...customers[idx], ...customer, updatedAt: new Date().toISOString() };
    } else {
      customers.unshift({
        id: customer.id || `CUST-${Date.now()}`,
        phone: customer.phone,
        name: customer.name,
        email: customer.email || "",
        totalOrders: customer.totalOrders || 0,
        totalSpent: customer.totalSpent || 0,
        lastOrderAt: customer.lastOrderAt || new Date().toISOString(),
        tags: customer.tags || "regular",
        notes: customer.notes || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    saveCustomers(customers);
    return NextResponse.json({ success: true, customers });
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
