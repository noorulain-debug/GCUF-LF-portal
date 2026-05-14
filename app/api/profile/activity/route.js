import { connectDB } from "@/app/lib/mongodb";
import Item from "@/app/models/items";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const items = await Item.find({ user: decoded.id })
      .select("title description type location date createdAt")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const activity = items.map((item) => ({
      title: item.title,
      description: item.description,
      type: item.type,
      location: item.location,
      date: item.createdAt || item.date,
    }));

    return NextResponse.json(activity);
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
