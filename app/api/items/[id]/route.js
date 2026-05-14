import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Item from "@/app/models/items";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import {
  findAndNotifyMatches,
  tryCreateItemEmbedding,
} from "@/app/lib/aiMatcher";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function DELETE(req, context) {
  await connectDB();

  const { id } = await context.params; 

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const item = await Item.findById(id);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (item.user.toString() !== decoded.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await Item.findByIdAndDelete(id);

  return NextResponse.json({ message: "Item deleted successfully" });
}


export async function PUT(req, context) {
  await connectDB();

  const { id } = await context.params; 

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const item = await Item.findById(id);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (item.user.toString() !== decoded.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const itemData = {
    title: body.title,
    description: body.description,
    category: body.category?.toLowerCase(),
    type: body.type?.toLowerCase(),
    location: body.location,
    imageUrl: body.imageUrl,
  };

  const updated = await Item.findByIdAndUpdate(
    id,
    {
      ...itemData,
      embedding: await tryCreateItemEmbedding(itemData),
    },
    { new: true }
  );

  await findAndNotifyMatches(updated);

  const responseItem = await Item.findById(id)
    .select("-embedding")
    .populate("user", "name email phone")
    .lean();

  return NextResponse.json(responseItem || updated);
}
