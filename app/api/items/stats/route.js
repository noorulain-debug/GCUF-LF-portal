import { connectDB } from "@/app/lib/mongodb";
import Item from "@/app/models/items";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  await connectDB();

  const [total, lost, found] = await Promise.all([
    Item.countDocuments({ type: { $ne: "resolved" } }),
    Item.countDocuments({ type: "lost" }),
    Item.countDocuments({ type: "found" }),
  ]);

  return NextResponse.json({ total, lost, found });
}
