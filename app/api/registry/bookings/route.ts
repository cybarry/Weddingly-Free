import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import GiftBooking from "@/lib/models/GiftBooking";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-admin-key") === process.env.ADMIN_PASSWORD;
}

// GET — admin only, returns all bookings newest first
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  const bookings = await GiftBooking.find().sort({ createdAt: -1 });
  return NextResponse.json(bookings);
}

// POST — public, guest submits a gift booking
export async function POST(req: NextRequest) {
  await connectToDatabase();
  const body = await req.json();

  const { itemId, itemName, itemPrice, itemCurrency, giftType, name, phone, email, message } = body;

  if (!itemId || !itemName || !giftType || !name || !phone) {
    return NextResponse.json(
      { error: "itemId, itemName, giftType, name and phone are required" },
      { status: 400 }
    );
  }

  const booking = await GiftBooking.create({
    itemId,
    itemName,
    itemPrice: itemPrice ?? 0,
    itemCurrency: itemCurrency ?? "USD",
    giftType,
    name,
    phone,
    email: email ?? "",
    message: message ?? "",
  });

  return NextResponse.json(booking, { status: 201 });
}
