import { NextResponse } from "next/server";
import { readBadges } from "@/lib/badges";

export async function GET() {
  try {
    const badges = readBadges();
    return NextResponse.json({ badges });
  } catch (error) {
    console.error("Badges read error:", error);
    return NextResponse.json(
      { error: "Failed to read badges" },
      { status: 500 }
    );
  }
}
