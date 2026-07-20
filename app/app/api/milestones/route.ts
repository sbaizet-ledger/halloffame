import { NextResponse } from "next/server";
import { readAchievements } from "@/lib/achievements";
import { readProfile, getDefaultProfile } from "@/lib/profile";
import { computeMilestones } from "@/lib/milestones";

export async function GET() {
  try {
    const achievements = readAchievements();
    const profile = readProfile() || getDefaultProfile();
    const milestones = computeMilestones(achievements, profile);

    return NextResponse.json({ milestones });
  } catch (error) {
    console.error("Error computing milestones:", error);
    return NextResponse.json(
      { error: "Failed to compute milestones" },
      { status: 500 }
    );
  }
}
