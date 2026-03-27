import { NextRequest, NextResponse } from "next/server";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-admin-key") === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, WEBP, GIF and AVIF images are allowed" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64String = buffer.toString("base64");
  const dataUrl = `data:${file.type};base64,${base64String}`;

  return NextResponse.json({ url: dataUrl }, { status: 201 });
}
