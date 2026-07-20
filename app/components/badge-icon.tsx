"use client";

import { getBadgeById } from "@/lib/badges";
import { Badge as BadgeType } from "@/lib/types";
import { useEffect, useState } from "react";

interface BadgeIconProps {
  badgeId: string;
  showLabel?: boolean;
}

export function BadgeIcon({ badgeId, showLabel = false }: BadgeIconProps) {
  const [badge, setBadge] = useState<BadgeType | null>(null);

  useEffect(() => {
    // Fetch badge data client-side
    fetch("/api/badges")
      .then((res) => res.json())
      .then((data) => {
        const foundBadge = data.badges.find((b: BadgeType) => b.id === badgeId);
        setBadge(foundBadge || null);
      })
      .catch((error) => {
        console.error("Failed to load badge:", error);
      });
  }, [badgeId]);

  if (!badge) return null;

  return (
    <span
      className="inline-flex items-center gap-1 text-sm"
      title={`${badge.name}: ${badge.description}`}
    >
      <span className="text-base" role="img" aria-label={badge.name}>
        {badge.icon}
      </span>
      {showLabel && <span className="text-xs text-muted-foreground">{badge.name}</span>}
    </span>
  );
}
