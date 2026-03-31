'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { PostCard } from './post-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPosts, Post, PostType } from '@/lib/community-service';

interface PostFeedProps {
  type?: PostType;
  author?: string;
  sortBy?: 'newest' | 'popular' | 'most_commented';
}

export function PostFeed({ type, author, sortBy = 'newest' }: PostFeedProps) {
  const t = useTranslations('community');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async (skip = 0, append = false) => {
    try {
      if (skip === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const response = await getPosts({
        type,
        author,
        sortBy,
        limit: 10,
        skip,
      });

      if (append) {
        setPosts((prev) => [...prev, ...response.data]);
      } else {
        setPosts(response.data);
      }
      setHasMore(response.meta.hasMore);
    } catch (err) {
      console.error('Failed to load posts:', err);
      setError(t('feed.loadFailed'));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [type, author, sortBy, t]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadPosts(posts.length, true);
    }
  };

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 500
      ) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [posts.length, loadingMore, hasMore]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3 mt-1" />
            <div className="flex gap-4 mt-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => loadPosts()}>{t('feed.retry')}</Button>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">{t('feed.noPosts')}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {t('feed.beFirst')}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} onUpdate={() => loadPosts()} />
      ))}

      {loadingMore && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="text-center text-muted-foreground py-4">
          {t('feed.endOfPosts')}
        </p>
      )}
    </div>
  );
}
