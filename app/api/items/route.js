import jwt from "jsonwebtoken";
import { connectDB } from "@/app/lib/mongodb";
import Item from "@/app/models/items";
import User from "@/app/models/user";
import { cookies } from "next/headers";
import {
  findAndNotifyMatches,
  tryCreateItemEmbedding,
} from "@/app/lib/aiMatcher";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req) {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const { searchParams } = new URL(req.url);

  const type = searchParams.get("type");
  const category = searchParams.get("category");
  const myItems = searchParams.get("myItems"); 

  let filter = {};


  if (type) filter.type = type.toLowerCase();
  if (category) filter.category = category.toLowerCase();


  if (myItems === "true" && token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      filter.user = decoded.id;
    } catch (err) {
      console.error("Invalid token in MyItems request");
    }
  }

  const items = await Item.find(filter)
    .select("-embedding")
    .populate("user", "name email phone")
    .lean();

  return new Response(JSON.stringify(items), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req) {
  await connectDB();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const data = await req.json();

    const itemData = {
      title: data.title,
      description: data.description,
      category: data.category?.toLowerCase(),
      type: data.type?.toLowerCase(),
      location: data.location,
      date: new Date(),
      imageUrl: data.imageUrl || "",
      user: userId,
    };

    const newItem = await Item.create({
      ...itemData,
      embedding: await tryCreateItemEmbedding(itemData),
    });

    findAndNotifyMatches(newItem).catch((error) => {
      console.error("Post-save AI matching failed:", error);
    });

    const responseItem = await Item.findById(newItem._id)
      .select("-embedding")
      .populate("user", "name email phone")
      .lean();

    return new Response(JSON.stringify(responseItem || newItem), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating item:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
