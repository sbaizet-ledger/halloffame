'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/lib/types';
import { AvatarUpload } from '@/components/avatar-upload';
import { AuthDialog } from '@/components/auth-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, Palette } from 'lucide-react';

// Color conversion utilities
function hexToOklch(hex: string): string {
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  // Convert RGB to linear RGB
  const toLinear = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const rl = toLinear(r);
  const gl = toLinear(g);
  const bl = toLinear(b);

  // Convert to XYZ (D65 illuminant)
  const x = 0.4124564 * rl + 0.3575761 * gl + 0.1804375 * bl;
  const y = 0.2126729 * rl + 0.7151522 * gl + 0.0721750 * bl;
  const z = 0.0193339 * rl + 0.1191920 * gl + 0.9503041 * bl;

  // Convert XYZ to OKLab
  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  // Convert to LCH
  const C = Math.sqrt(a * a + b_ * b_);
  const H = Math.atan2(b_, a) * 180 / Math.PI;

  return `oklch(${L.toFixed(2)} ${C.toFixed(2)} ${H >= 0 ? H.toFixed(0) : (H + 360).toFixed(0)})`;
}

function oklchToHex(oklch: string): string {
  // Parse oklch string
  const match = oklch.match(/oklch\(([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\)/);
  if (!match) return '#f97316'; // Default orange

  const L = parseFloat(match[1]);
  const C = parseFloat(match[2]);
  const H = parseFloat(match[3]) * Math.PI / 180;

  // Convert to OKLab
  const a = C * Math.cos(H);
  const b_ = C * Math.sin(H);

  // Convert OKLab to XYZ
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b_;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b_;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b_;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const x = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const y = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const z = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  // Convert XYZ to linear RGB
  let rl = +3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
  let gl = -0.9692660 * x + 1.8760108 * y + 0.0415560 * z;
  let bl = +0.0556434 * x - 0.2040259 * y + 1.0572252 * z;

  // Convert linear RGB to sRGB
  const toSrgb = (c: number) => {
    c = Math.max(0, Math.min(1, c));
    return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  };

  const r = Math.round(toSrgb(rl) * 255);
  const g = Math.round(toSrgb(gl) * 255);
  const b = Math.round(toSrgb(bl) * 255);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nickname: '',
    bio: '',
    location: '',
    joinedYear: '',
    stravaUrl: '',
    instagram: '',
    website: '',
    primaryColor: '#f97316', // Default orange
    showQuoteOfTheDay: true,
    showJourneyMilestones: true,
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      setProfile(data);

      setFormData({
        nickname: data.nickname || '',
        bio: data.bio || '',
        location: data.location || '',
        joinedYear: data.joinedYear ? String(data.joinedYear) : '',
        stravaUrl: data.socialLinks?.strava || '',
        instagram: data.socialLinks?.instagram || '',
        website: data.socialLinks?.website || '',
        primaryColor: oklchToHex(data.theme?.primaryColor || 'oklch(0.65 0.24 45)'),
        showQuoteOfTheDay: data.showQuoteOfTheDay !== false,
        showJourneyMilestones: data.showJourneyMilestones !== false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setAvatarFile(file);
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field === 'showQuoteOfTheDay' || field === 'showJourneyMilestones') {
      setFormData(prev => ({ ...prev, [field]: value === 'true' || value === true }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value as string }));
    }
  };

  const handleSave = () => {
    setShowAuth(true);
  };

  const handleAuthSubmit = async (password: string) => {
    try {
      setSaving(true);
      setError('');

      let avatarPath = profile?.avatarPath;

      // Upload avatar if file selected
      if (avatarFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', avatarFile);
        uploadFormData.append('password', password);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const uploadError = await uploadRes.json();
          throw new Error(uploadError.error || 'Avatar upload failed');
        }

        const uploadData = await uploadRes.json();
        avatarPath = uploadData.avatarPath;
      }

      // Update profile
      const updatedProfile: UserProfile = {
        nickname: formData.nickname || 'Runner',
        bio: formData.bio || undefined,
        location: formData.location || undefined,
        joinedYear: formData.joinedYear ? parseInt(formData.joinedYear) : undefined,
        avatarPath,
        theme: {
          primaryColor: hexToOklch(formData.primaryColor),
        },
        socialLinks: {
          strava: formData.stravaUrl || undefined,
          instagram: formData.instagram || undefined,
          website: formData.website || undefined,
        },
        customMilestones: profile?.customMilestones,
        showQuoteOfTheDay: formData.showQuoteOfTheDay,
        showJourneyMilestones: formData.showJourneyMilestones,
      };

      const profileRes = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, profile: updatedProfile }),
      });

      if (!profileRes.ok) {
        const profileError = await profileRes.json();
        throw new Error(profileError.error || 'Profile update failed');
      }

      setSuccess(true);
      setShowAuth(false);
      
      // Redirect to home after 1 second
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
      throw err; // Let AuthDialog show error
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
            <AlertDescription className="text-green-700 dark:text-green-300">
              Profile saved successfully! Redirecting...
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <div className="bg-card rounded-lg border p-6 space-y-8">
          {/* Avatar Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Avatar</h2>
            <AvatarUpload
              currentAvatar={profile?.avatarPath}
              onFileSelect={handleFileSelect}
              previewUrl={avatarPreview}
            />
          </div>

          {/* Profile Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nickname">Nickname *</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => handleInputChange('nickname', e.target.value)}
                  placeholder="Runner"
                  required
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about your running journey..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., French Alps"
                />
              </div>

              <div>
                <Label htmlFor="joinedYear">Started Running (Year)</Label>
                <Input
                  id="joinedYear"
                  type="number"
                  value={formData.joinedYear}
                  onChange={(e) => handleInputChange('joinedYear', e.target.value)}
                  placeholder="e.g., 2020"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          </div>

          {/* Theme Customization */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Theme</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="color"
                      id="primaryColor"
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      className="w-16 h-10 rounded border border-input cursor-pointer"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      placeholder="#f97316"
                      className="flex-1 font-mono"
                    />
                  </div>
                  <div 
                    className="w-24 h-10 rounded border flex items-center justify-center text-sm font-medium text-white"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    <Palette className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  This color will be used for buttons, accents, and highlights throughout the app.
                </p>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showQuote">Show Quote of the Day</Label>
                  <p className="text-xs text-muted-foreground">
                    Display an inspirational quote on the homepage
                  </p>
                </div>
                <Switch
                  id="showQuote"
                  checked={formData.showQuoteOfTheDay}
                  onCheckedChange={(checked) => handleInputChange('showQuoteOfTheDay', String(checked))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showMilestones">Show Journey Milestones</Label>
                  <p className="text-xs text-muted-foreground">
                    Display milestone timeline on the homepage
                  </p>
                </div>
                <Switch
                  id="showMilestones"
                  checked={formData.showJourneyMilestones}
                  onCheckedChange={(checked) => handleInputChange('showJourneyMilestones', String(checked))}
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Social Links</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="strava">Strava Profile URL</Label>
                <Input
                  id="strava"
                  value={formData.stravaUrl}
                  onChange={(e) => handleInputChange('stravaUrl', e.target.value)}
                  placeholder="https://strava.com/athletes/..."
                  type="url"
                />
              </div>

              <div>
                <Label htmlFor="instagram">Instagram Handle</Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  placeholder="@username or username"
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://..."
                  type="url"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => router.push('/')}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.nickname}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>

        {/* Auth Dialog */}
        <AuthDialog
          open={showAuth}
          onClose={() => setShowAuth(false)}
          onSubmit={handleAuthSubmit}
        />
      </div>
    </div>
  );
}
