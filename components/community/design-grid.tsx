'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { ThumbsUp, ThumbsDown, MessageCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getDesigns, toggleVote, Design, DesignCategory } from '@/lib/community-service';
import { cn } from '@/lib/utils';

interface DesignGridProps {
  category?: DesignCategory;
  designer?: string;
  sortBy?: 'newest' | 'popular' | 'trending';
}

export function DesignGrid({ category, designer, sortBy = 'newest' }: DesignGridProps) {
  const t = useTranslations('community');
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votingId, setVotingId] = useState<string | null>(null);

  const loadDesigns = useCallback(async (skip = 0, append = false) => {
    try {
      if (skip === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const response = await getDesigns({
        category,
        designer,
        sortBy,
        limit: 12,
        skip,
      });

      if (append) {
        setDesigns((prev) => [...prev, ...response.data]);
      } else {
        setDesigns(response.data);
      }
      setHasMore(response.meta.hasMore);
    } catch (err) {
      console.error('Failed to load designs:', err);
      setError(t('grid.loadFailed'));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category, designer, sortBy, t]);

  useEffect(() => {
    loadDesigns();
  }, [loadDesigns]);

  const handleVote = async (designId: string, voteType: 'upvote' | 'downvote') => {
    try {
      setVotingId(designId);
      await toggleVote({
        targetType: 'design',
        targetId: designId,
        voteType,
      });
      await loadDesigns();
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setVotingId(null);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadDesigns(designs.length, true);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => loadDesigns()}>{t('grid.retry')}</Button>
      </Card>
    );
  }

  if (designs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">{t('grid.noDesigns')}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {t('grid.beFirst')}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Masonry-like Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {designs.map((design) => (
          <Card
            key={design._id}
            className="overflow-hidden group hover:shadow-lg transition-shadow"
          >
            <Link href={`/community/designs/${design._id}`}>
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={design.images[0] || '/placeholder.svg'}
                  alt={design.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-2 right-2" variant="secondary">
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
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {design.description}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={design.designer.profileImage} />
                  <AvatarFallback>{design.designer.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground truncate">
                  {design.designer.name}
                </span>
              </div>
              {design.tags && design.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {design.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'gap-1 px-2',
                      design.userVote === 'upvote' && 'text-green-500'
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      handleVote(design._id, 'upvote');
                    }}
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
                    onClick={(e) => {
                      e.preventDefault();
                      handleVote(design._id, 'downvote');
                    }}
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

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t('grid.loading')}
              </>
            ) : (
              t('grid.loadMore')
            )}
          </Button>
        </div>
      )}

      {!hasMore && designs.length > 0 && (
        <p className="text-center text-muted-foreground">
          {t('grid.endOfDesigns')}
        </p>
      )}
    </div>
  );
}
