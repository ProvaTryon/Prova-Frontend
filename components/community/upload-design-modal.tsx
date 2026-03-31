'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ImagePlus, X, Loader2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { createDesign, DesignCategory } from '@/lib/community-service';
import Image from 'next/image';

interface UploadDesignModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function UploadDesignModal({ trigger, onSuccess }: UploadDesignModalProps) {
  const router = useRouter();
  const t = useTranslations('community');
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DesignCategory | ''>('');
  const [images, setImages] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories: { value: DesignCategory; labelKey: string }[] = [
    { value: 'tshirt', labelKey: 'designCategories.tshirt' },
    { value: 'hoodie', labelKey: 'designCategories.hoodie' },
    { value: 'pants', labelKey: 'designCategories.pants' },
    { value: 'jacket', labelKey: 'designCategories.jacket' },
    { value: 'dress', labelKey: 'designCategories.dress' },
    { value: 'accessories', labelKey: 'designCategories.accessories' },
    { value: 'other', labelKey: 'designCategories.other' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [...prev, reader.result as string].slice(0, 10));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags((prev) => [...prev, tag]);
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setImages([]);
    setTags([]);
    setTagInput('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError(t('form.validation.titleRequired'));
      return;
    }
    if (!description.trim()) {
      setError(t('form.validation.descriptionRequired'));
      return;
    }
    if (!category) {
      setError(t('form.validation.categoryRequired'));
      return;
    }
    if (images.length === 0) {
      setError(t('form.validation.imageRequired'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createDesign({
        title: title.trim(),
        description: description.trim(),
        category,
        images,
        tags: tags.length > 0 ? tags : undefined,
      });

      resetForm();
      setOpen(false);

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to create design:', err);
      setError(t('form.errors.uploadFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Palette className="h-4 w-4" />
            {t('uploadDesign')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {t('uploadNewDesign')}
          </DialogTitle>
          <DialogDescription>
            {t('uploadDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Images */}
          <div className="space-y-2">
            <Label>{t('form.designImages')} *</Label>
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative group aspect-square">
                  <div className="relative w-full h-full rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {index === 0 && (
                    <Badge className="absolute bottom-1 left-1 text-xs">
                      {t('form.mainImage')}
                    </Badge>
                  )}
                </div>
              ))}
              {images.length < 10 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">{t('form.add')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="sr-only"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('form.imageLimit', { count: images.length })}
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="design-title">{t('form.designName')} *</Label>
            <Input
              id="design-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('form.placeholders.designName')}
              maxLength={150}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="design-description">{t('form.designDescription')} *</Label>
            <Textarea
              id="design-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('form.placeholders.designDescription')}
              rows={4}
              maxLength={2000}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>{t('form.category')} *</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as DesignCategory)}>
              <SelectTrigger>
                <SelectValue placeholder={t('form.placeholders.selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {t(cat.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>{t('form.tags')}</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('form.placeholders.addTag')}
                maxLength={30}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                {t('form.add')}
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              {t('form.cancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t('form.uploading')}
                </>
              ) : (
                t('form.uploadDesign')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
