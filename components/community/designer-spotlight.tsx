'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown, MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getTopDesigns, toggleVote, Design } from '@/lib/community-service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DesignerSpotlightProps {
  className?: string;
}

export function DesignerSpotlight({ className }: DesignerSpotlightProps) {
  const t = useTranslations('community');
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votingId, setVotingId] = useState<string | null>(null);

  useEffect(() => {
    loadDesigns();
  }, []);

  const loadDesigns = async () => {
    try {
      setLoading(true);
      const response = await getTopDesigns(10);
      setDesigns(response.data);
    } catch (error) {
      console.error('Failed to load designs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (designId: string, voteType: 'upvote' | 'downvote') => {
    try {
      setVotingId(designId);
      await toggleVote({
        targetType: 'design',
        targetId: designId,
        voteType,
      });
      await loadDesigns();
      toast.success(t('spotlight.voteSuccess'));
    } catch (error) {
      console.error('Failed to vote:', error);
      toast.error(t('spotlight.voteFailed'));
    } finally {
      setVotingId(null);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, designs.length - 3));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, designs.length - 3)) % Math.max(1, designs.length - 3));
  };

  if (loading) {
    return (
      <section className={cn('py-8', className)}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">{t('spotlight.title')}</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (designs.length === 0) {
    return (
      <section className={cn('py-8', className)}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">{t('spotlight.title')}</h2>
            </div>
          </div>
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">{t('spotlight.noDesigns')}</p>
            <Button className="mt-4" asChild>
              <Link href="/community/designs/create">{t('spotlight.shareDesign')}</Link>
            </Button>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className={cn('py-8 bg-gradient-to-r from-primary/5 via-transparent to-primary/5', className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            <h2 className="text-2xl font-bold">{t('spotlight.title')}</h2>
            <Badge variant="secondary" className="ml-2">
              🔥 {t('spotlight.trending')}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevSlide} disabled={currentIndex === 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              disabled={currentIndex >= designs.length - 4}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="link" asChild>
              <Link href="/community?tab=designs">{t('spotlight.viewAll')}</Link>
            </Button>
          </div>
        </div>

        {/* Designs Carousel */}
        <div className="relative overflow-hidden">
          <div
            className="flex gap-4 transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 25}%)` }}
          >
            {designs.map((design) => (
              <Card
                key={design._id}
                className="flex-shrink-0 w-full md:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] overflow-hidden group hover:shadow-lg transition-shadow"
              >
                <Link href={`/community/designs/${design._id}`}>
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={design.images[0] || '/placeholder.svg'}
                      alt={design.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge
                      className="absolute top-2 right-2"
                      variant={design.status === 'in_production' ? 'default' : 'secondary'}
                    >
                      {t(`designCategories.${design.category}`)}
                    </Badge>
                    {design.status === 'in_production' && (
                      <Badge className="absolute top-2 left-2 bg-green-500">
                        🏭 {t('designStatus.inProduction')}
                      </Badge>
                    )}
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link href={`/community/designs/${design._id}`}>
                    <h3 className="font-semibold truncate hover:text-primary transition-colors">
                      {design.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={design.designer.profileImage} />
                      <AvatarFallback>{design.designer.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground truncate">
                      {design.designer.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'gap-1 px-2',
                          design.userVote === 'upvote' && 'text-green-500'
                        )}
                        onClick={() => handleVote(design._id, 'upvote')}
                        disabled={votingId === design._id}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{design.upvotesCount}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'gap-1 px-2',
                          design.userVote === 'downvote' && 'text-red-500'
                        )}
                        onClick={() => handleVote(design._id, 'downvote')}
                        disabled={votingId === design._id}
                      >
                        <ThumbsDown className="h-4 w-4" />
                        <span>{design.downvotesCount}</span>
                      </Button>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{design.commentsCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
