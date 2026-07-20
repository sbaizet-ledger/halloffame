import Link from "next/link";
import type { Milestone } from "@/lib/types";

interface MilestonesTimelineProps {
  milestones: Milestone[];
  compact?: boolean;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export function MilestonesTimeline({ 
  milestones, 
  compact = false 
}: MilestonesTimelineProps) {
  const displayMilestones = compact 
    ? milestones.slice(-5)
    : milestones;

  if (displayMilestones.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No milestones yet. Start adding achievements to build your journey!
      </div>
    );
  }

  return (
    <div className="timeline-container">
      <h2 className="text-2xl font-bold mb-6">Journey Milestones</h2>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        
        {displayMilestones.map((milestone, idx) => (
          <div key={idx} className="milestone-item relative pl-12 pb-8 last:pb-0">
            {/* Icon dot */}
            <div className="absolute left-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
              <span className="text-sm">{milestone.icon || "📍"}</span>
            </div>
            
            {/* Content */}
            <div className="milestone-content">
              <div className="text-sm text-muted-foreground mb-1">
                {formatDate(milestone.date)}
              </div>
              <div className="font-semibold text-lg mb-1">
                {milestone.title}
              </div>
              {milestone.description && (
                <div className="text-muted-foreground text-sm">
                  {milestone.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {compact && milestones.length > 5 && (
        <div className="mt-4 text-center">
          <Link 
            href="/statistics" 
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            View full timeline
            <span>→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
