import { NextResponse } from "next/server";
import Household from "@/models/households";
import connectDB from "@/lib/db";

// POST /api/households
// Create a new household
export async function POST(req) {
  await connectDB();

  const body = await req.json();
  const { name, createdBy } = body;

  if (!name || !createdBy) {
    return NextResponse.json(
      { error: "Missing required fields: name, createdBy" },
      { status: 400 },
    );
  }

  const household = await Household.create({
    name,
    createdBy,
  });

  return NextResponse.json(household);
}

// GET /api/households/:id
// Fetch a household by ID
export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Missing household ID" },
      { status: 400 },
    );
  }

  const household = await Household.findById(id);

  if (!household) {
    return NextResponse.json({ error: "Household not found" }, { status: 404 });
  }

  return NextResponse.json(household);
}
