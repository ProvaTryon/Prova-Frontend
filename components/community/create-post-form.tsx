'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AlertCircle, Star, Lightbulb, HelpCircle, ImagePlus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createPost, PostType } from '@/lib/community-service';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface CreatePostFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function CreatePostForm({ onSuccess, className }: CreatePostFormProps) {
  const router = useRouter();
  const t = useTranslations('community');
  const [type, setType] = useState<PostType>('question');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postTypes: { value: PostType; labelKey: string; icon: typeof AlertCircle; descriptionKey: string }[] = [
    { value: 'issue', labelKey: 'postTypes.issue', icon: AlertCircle, descriptionKey: 'postTypeDescriptions.issue' },
    { value: 'review', labelKey: 'postTypes.review', icon: Star, descriptionKey: 'postTypeDescriptions.review' },
    { value: 'tip', labelKey: 'postTypes.tip', icon: Lightbulb, descriptionKey: 'postTypeDescriptions.tip' },
    { value: 'question', labelKey: 'postTypes.question', icon: HelpCircle, descriptionKey: 'postTypeDescriptions.question' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [...prev, reader.result as string].slice(0, 5));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError(t('form.validation.titleRequired'));
      return;
    }
    if (!content.trim()) {
      setError(t('form.validation.contentRequired'));
      return;
    }
    if (type === 'review' && rating === 0) {
      setError(t('form.validation.ratingRequired'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createPost({
        type,
        title: title.trim(),
        content: content.trim(),
        rating: type === 'review' ? rating : undefined,
        images: images.length > 0 ? images : undefined,
      });

      setTitle('');
      setContent('');
      setRating(0);
      setImages([]);

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/community');
      }
    } catch (err) {
      console.error('Failed to create post:', err);
      setError(t('form.errors.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('createNewPost')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Type Selection */}
          <div className="space-y-3">
            <Label>{t('form.postType')}</Label>
            <RadioGroup
              value={type}
              onValueChange={(v) => setType(v as PostType)}
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {postTypes.map((pt) => {
                const Icon = pt.icon;
                return (
                  <Label
                    key={pt.value}
                    htmlFor={pt.value}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all',
                      type === pt.value
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground/50'
                    )}
                  >
                    <RadioGroupItem value={pt.value} id={pt.value} className="sr-only" />
                    <Icon className={cn('h-6 w-6', type === pt.value && 'text-primary')} />
                    <span className="font-medium">{t(pt.labelKey)}</span>
                    <span className="text-xs text-muted-foreground text-center">
                      {t(pt.descriptionKey)}
                    </span>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t('form.title')}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('form.placeholders.title')}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-left">{title.length}/200</p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">{t('form.content')}</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('form.placeholders.content')}
              rows={5}
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground text-left">{content.length}/5000</p>
          </div>

          {/* Rating (for reviews) */}
          {type === 'review' && (
            <div className="space-y-2">
              <Label>{t('form.rating')}</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={cn(
                        'h-8 w-8',
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-200'
                      )}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="mr-2 text-sm text-muted-foreground">
                    ({rating}/5)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Images */}
          <div className="space-y-2">
            <Label>{t('form.imagesOptional')}</Label>
            <div className="flex flex-wrap gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden">
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
                </div>
              ))}
              {images.length < 5 && (
                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <ImagePlus className="h-6 w-6 text-muted-foreground" />
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
              {t('form.imageLimit5', { count: images.length })}
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t('form.publishing')}
              </>
            ) : (
              t('form.publish')
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
