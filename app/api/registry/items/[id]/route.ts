import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import GiftItem from "@/lib/models/GiftItem";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function isAuthorized(req: NextRequest): boolean {
  const key = req.headers.get("x-admin-key");
  return key === ADMIN_PASSWORD;
}

type Params = { params: { id: string } };

// PATCH /api/registry/items/[id] — update any field (admin only)
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const body = await req.json();

  const allowed = ["name", "description", "price", "currency", "imageUrl", "giftedStatus", "order"];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const item = await GiftItem.findByIdAndUpdate(params.id, update, {
    new: true,
  });

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

// DELETE /api/registry/items/[id] — admin only
export async function DELETE(req: NextRequest, { params }: Params) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const item = await GiftItem.findByIdAndDelete(params.id);

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
