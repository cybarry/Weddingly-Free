import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import GiftItem from "@/lib/models/GiftItem";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function isAuthorized(req: NextRequest): boolean {
  const key = req.headers.get("x-admin-key");
  return key === ADMIN_PASSWORD;
}

// GET /api/registry/items — public, returns all items sorted by order
export async function GET() {
  await connectToDatabase();
  const items = await GiftItem.find().sort({ order: 1, createdAt: 1 });
  return NextResponse.json(items);
}

// POST /api/registry/items — admin only, create new item
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const body = await req.json();

  const { name, description, price, currency, imageUrl, order } = body;

  if (!name || price === undefined) {
    return NextResponse.json(
      { error: "name and price are required" },
      { status: 400 }
    );
  }

  const item = await GiftItem.create({
    name,
    description: description ?? "",
    price,
    currency: currency ?? "USD",
    imageUrl: imageUrl ?? "",
    order: order ?? 0,
    giftedStatus: "none",
  });

  return NextResponse.json(item, { status: 201 });
}
