'use client';

import { UserProfile } from '@/lib/types';
import { User } from 'lucide-react';
import Link from 'next/link';

interface ProfileHeroProps {
  profile: UserProfile;
  stats: {
    totalRaces: number;
    totalDistance: number;
    yearsActive: number;
  };
  isAuthenticated?: boolean;
}

export function ProfileHero({ profile, stats, isAuthenticated }: ProfileHeroProps) {
  return (
    <div className="mb-8 text-center py-8">
      {/* Avatar */}
      <div className="flex justify-center mb-4">
        {isAuthenticated ? (
          <Link href="/profile" className="cursor-pointer group">
            {profile.avatarPath ? (
              <img
                src={profile.avatarPath}
                alt={`${profile.nickname}'s avatar`}
                className="w-32 h-32 rounded-full object-cover border-4 border-border transition-opacity group-hover:opacity-80"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-border transition-colors group-hover:bg-muted/80">
                <User className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </Link>
        ) : (
          <>
            {profile.avatarPath ? (
              <img
                src={profile.avatarPath}
                alt={`${profile.nickname}'s avatar`}
                className="w-32 h-32 rounded-full object-cover border-4 border-border"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-border">
                <User className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Nickname */}
      <h1 className="text-3xl font-bold mb-2">
        {profile.nickname}&apos;s Hall of Fame
      </h1>

      {/* Bio */}
      {profile.bio && (
        <p className="text-muted-foreground text-lg mb-4 max-w-2xl mx-auto">
          {profile.bio}
        </p>
      )}

      {/* Location */}
      {profile.location && (
        <p className="text-sm text-muted-foreground mb-4">
          📍 {profile.location}
        </p>
      )}

      {/* Stats */}
      <div className="flex justify-center gap-8 text-sm">
        <div className="text-center">
          <div className="text-2xl font-bold">{stats.totalRaces}</div>
          <div className="text-muted-foreground">races</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{stats.totalDistance.toFixed(0)}</div>
          <div className="text-muted-foreground">km</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{stats.yearsActive}</div>
          <div className="text-muted-foreground">years</div>
        </div>
      </div>

      {/* Social Links */}
      {(profile.socialLinks?.strava || profile.socialLinks?.instagram || profile.socialLinks?.website) && (
        <div className="flex justify-center gap-4 mt-6">
          {profile.socialLinks.strava && (
            <a
              href={profile.socialLinks.strava}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Strava
            </a>
          )}
          {profile.socialLinks.instagram && (
            <a
              href={`https://instagram.com/${profile.socialLinks.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Instagram
            </a>
          )}
          {profile.socialLinks.website && (
            <a
              href={profile.socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Website
            </a>
          )}
        </div>
      )}
    </div>
  );
}
