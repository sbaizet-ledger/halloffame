'use client';

import { useState, useEffect } from 'react';
import { Achievement } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, X } from 'lucide-react';

interface Props {
  open: boolean;
  achievement?: Achievement;
  onClose: () => void;
  onSubmit: (data: Omit<Achievement, 'id'>) => void;
}

const CATEGORY_OPTIONS = ['Trail', 'Run'] as const;

const RANKING_CATEGORIES = [
  'M0H (18-29)',
  'M1H (30-39)',
  'M2H (40-49)',
  'M3H (50-59)',
  'M4H (60-69)',
  'M5H (70+)',
  'M0F (18-29)',
  'M1F (30-39)',
  'M2F (40-49)',
  'M3F (50-59)',
  'M4F (60-69)',
  'M5F (70+)',
];

export function AchievementForm({ open, achievement, onClose, onSubmit }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    category: 'Trail' as 'Trail' | 'Run',
    distance: '',
    rankingScratch: '',
    rankingCategory: '',
    rankingCategoryPosition: '',
    eventWebsite: '',
  });

  const [photoLinks, setPhotoLinks] = useState<string[]>(['']);
  const [videoLinks, setVideoLinks] = useState<string[]>(['']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (achievement) {
      setFormData({
        name: achievement.name,
        date: achievement.date,
        category: achievement.category,
        distance: String(achievement.distance),
        rankingScratch: String(achievement.rankingScratch),
        rankingCategory: achievement.rankingCategory,
        rankingCategoryPosition: String(achievement.rankingCategoryPosition),
        eventWebsite: achievement.eventWebsite,
      });
      setPhotoLinks(achievement.photoLinks.length > 0 ? achievement.photoLinks : ['']);
      setVideoLinks(achievement.videoLinks.length > 0 ? achievement.videoLinks : ['']);
    } else {
      resetForm();
    }
  }, [achievement, open]);

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      category: 'Trail',
      distance: '',
      rankingScratch: '',
      rankingCategory: '',
      rankingCategoryPosition: '',
      eventWebsite: '',
    });
    setPhotoLinks(['']);
    setVideoLinks(['']);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.distance || parseFloat(formData.distance) <= 0) {
      newErrors.distance = 'Distance must be greater than 0';
    }
    if (!formData.rankingScratch || parseInt(formData.rankingScratch) <= 0) {
      newErrors.rankingScratch = 'Ranking must be greater than 0';
    }
    if (!formData.rankingCategory) newErrors.rankingCategory = 'Category is required';
    if (!formData.rankingCategoryPosition || parseInt(formData.rankingCategoryPosition) <= 0) {
      newErrors.rankingCategoryPosition = 'Category position must be greater than 0';
    }

    // Validate URLs
    const urlPattern = /^https?:\/\/.+/;
    if (formData.eventWebsite && !urlPattern.test(formData.eventWebsite)) {
      newErrors.eventWebsite = 'Must be a valid URL starting with http:// or https://';
    }

    photoLinks.forEach((link, index) => {
      if (link && !urlPattern.test(link)) {
        newErrors[`photoLink${index}`] = 'Must be a valid URL';
      }
    });

    videoLinks.forEach((link, index) => {
      if (link && !urlPattern.test(link)) {
        newErrors[`videoLink${index}`] = 'Must be a valid URL';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data: Omit<Achievement, 'id'> = {
      name: formData.name.trim(),
      date: formData.date,
      category: formData.category,
      distance: parseFloat(formData.distance),
      rankingScratch: parseInt(formData.rankingScratch),
      rankingCategory: formData.rankingCategory,
      rankingCategoryPosition: parseInt(formData.rankingCategoryPosition),
      eventWebsite: formData.eventWebsite.trim(),
      photoLinks: photoLinks.filter(link => link.trim().length > 0),
      videoLinks: videoLinks.filter(link => link.trim().length > 0),
    };

    onSubmit(data);
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addLinkField = (type: 'photo' | 'video') => {
    if (type === 'photo') {
      setPhotoLinks([...photoLinks, '']);
    } else {
      setVideoLinks([...videoLinks, '']);
    }
  };

  const removeLinkField = (type: 'photo' | 'video', index: number) => {
    if (type === 'photo') {
      setPhotoLinks(photoLinks.filter((_, i) => i !== index));
    } else {
      setVideoLinks(videoLinks.filter((_, i) => i !== index));
    }
  };

  const updateLinkField = (type: 'photo' | 'video', index: number, value: string) => {
    if (type === 'photo') {
      const newLinks = [...photoLinks];
      newLinks[index] = value;
      setPhotoLinks(newLinks);
    } else {
      const newLinks = [...videoLinks];
      newLinks[index] = value;
      setVideoLinks(newLinks);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{achievement ? 'Edit Achievement' : 'Add Achievement'}</DialogTitle>
          <DialogDescription>
            {achievement ? 'Update achievement details' : 'Add a new running or trail achievement'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Event Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Marathon du Mont Blanc"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            {/* Date and Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
                {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as 'Trail' | 'Run' })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Distance */}
            <div className="space-y-2">
              <Label htmlFor="distance">Distance (km) *</Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                min="0"
                value={formData.distance}
                onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                placeholder="42.2"
              />
              {errors.distance && <p className="text-sm text-destructive">{errors.distance}</p>}
            </div>

            {/* Rankings */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rankingScratch">Scratch Rank *</Label>
                <Input
                  id="rankingScratch"
                  type="number"
                  min="1"
                  value={formData.rankingScratch}
                  onChange={(e) => setFormData({ ...formData, rankingScratch: e.target.value })}
                  placeholder="42"
                />
                {errors.rankingScratch && <p className="text-sm text-destructive">{errors.rankingScratch}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="rankingCategory">Age Category *</Label>
                <Select
                  value={formData.rankingCategory}
                  onValueChange={(value) => setFormData({ ...formData, rankingCategory: value || '' })}
                >
                  <SelectTrigger id="rankingCategory">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {RANKING_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.rankingCategory && <p className="text-sm text-destructive">{errors.rankingCategory}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="rankingCategoryPosition">Category Rank *</Label>
                <Input
                  id="rankingCategoryPosition"
                  type="number"
                  min="1"
                  value={formData.rankingCategoryPosition}
                  onChange={(e) => setFormData({ ...formData, rankingCategoryPosition: e.target.value })}
                  placeholder="5"
                />
                {errors.rankingCategoryPosition && <p className="text-sm text-destructive">{errors.rankingCategoryPosition}</p>}
              </div>
            </div>

            {/* Event Website */}
            <div className="space-y-2">
              <Label htmlFor="eventWebsite">Event Website</Label>
              <Input
                id="eventWebsite"
                type="url"
                value={formData.eventWebsite}
                onChange={(e) => setFormData({ ...formData, eventWebsite: e.target.value })}
                placeholder="https://example.com"
              />
              {errors.eventWebsite && <p className="text-sm text-destructive">{errors.eventWebsite}</p>}
            </div>

            {/* Photo Links */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Photo Links</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addLinkField('photo')}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Photo
                </Button>
              </div>
              {photoLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={link}
                    onChange={(e) => updateLinkField('photo', index, e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                  />
                  {photoLinks.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLinkField('photo', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {errors[`photoLink0`] && <p className="text-sm text-destructive">{errors[`photoLink0`]}</p>}
            </div>

            {/* Video Links */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Video Links</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addLinkField('video')}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Video
                </Button>
              </div>
              {videoLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={link}
                    onChange={(e) => updateLinkField('video', index, e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  {videoLinks.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLinkField('video', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {errors[`videoLink0`] && <p className="text-sm text-destructive">{errors[`videoLink0`]}</p>}
            </div>

            {Object.keys(errors).length > 0 && !Object.keys(errors).some(k => k.startsWith('photoLink') || k.startsWith('videoLink') || ['name', 'date', 'distance', 'rankingScratch', 'rankingCategory', 'rankingCategoryPosition', 'eventWebsite'].includes(k)) && (
              <Alert variant="destructive">
                <AlertDescription>Please fix validation errors before submitting</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {achievement ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
