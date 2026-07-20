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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2 } from 'lucide-react';

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        theme: profile?.theme || { primaryColor: 'oklch(0.65 0.24 45)' },
        socialLinks: {
          strava: formData.stravaUrl || undefined,
          instagram: formData.instagram || undefined,
          website: formData.website || undefined,
        },
        customMilestones: profile?.customMilestones,
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
