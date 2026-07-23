import { NextResponse } from "next/server";
import { readAchievements } from "@/lib/achievements";
import { readProfile, getDefaultProfile } from "@/lib/profile";
import { getCurrentUserId } from "@/lib/user-helpers";
import { computeMilestones } from "@/lib/milestones";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // If no userId provided, use current authenticated user
    const finalUserId = userId || await getCurrentUserId();
    
    if (!finalUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    const achievements = readAchievements(finalUserId);
    const profile = readProfile(finalUserId) || getDefaultProfile();
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
