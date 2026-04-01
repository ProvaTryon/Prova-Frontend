'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  AlertCircle,
  Star,
  Lightbulb,
  HelpCircle,
  Bookmark,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Post, toggleVote, PostType } from '@/lib/community-service';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: Post;
  onUpdate?: () => void;
}

export function PostCard({ post, onUpdate }: PostCardProps) {
  const t = useTranslations('community');
  const locale = useLocale();
  const [liked, setLiked] = useState(post.userVote === 'like');
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isLiking, setIsLiking] = useState(false);
  const [saved, setSaved] = useState(false);

  const postTypeConfig: Record<PostType, { icon: typeof AlertCircle; labelKey: string; color: string }> = {
    issue: { icon: AlertCircle, labelKey: 'postTypes.issue', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    review: { icon: Star, labelKey: 'postTypes.review', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    tip: { icon: Lightbulb, labelKey: 'postTypes.tip', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    question: { icon: HelpCircle, labelKey: 'postTypes.question', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  };

  const typeConfig = postTypeConfig[post.type];
  const TypeIcon = typeConfig.icon;

  const handleLike = async () => {
    try {
      setIsLiking(true);
      const result = await toggleVote({
        targetType: 'post',
        targetId: post._id,
        voteType: 'like',
      });

      if (result.data.action === 'created') {
        setLiked(true);
        setLikesCount((prev) => prev + 1);
      } else if (result.data.action === 'removed') {
        setLiked(false);
        setLikesCount((prev) => prev - 1);
      }
    } catch (error) {
      console.error('Failed to like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: post.title,
        text: post.content.substring(0, 100),
        url: `${window.location.origin}/community/posts/${post._id}`,
      });
    } catch {
      await navigator.clipboard.writeText(`${window.location.origin}/community/posts/${post._id}`);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: locale === 'ar' ? ar : enUS,
  });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.author.profileImage} />
              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${post.author._id}`}
                  className="font-semibold hover:underline"
                >
                  {post.author.name}
                </Link>
                <Badge variant="outline" className={cn('text-xs', typeConfig.color)}>
                  <TypeIcon className="h-3 w-3 mr-1" />
                  {t(typeConfig.labelKey)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSaved(!saved)}>
                <Bookmark className="h-4 w-4 mr-2" />
                {saved ? t('card.unsave') : t('card.save')}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <AlertCircle className="h-4 w-4 mr-2" />
                {t('card.report')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <Link href={`/community/posts/${post._id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
            {post.title}
          </h3>
        </Link>
        <p className="text-muted-foreground line-clamp-3">{post.content}</p>

        {/* Rating for reviews */}
        {post.type === 'review' && post.rating && (
          <div className="flex items-center gap-1 mt-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'h-5 w-5',
                  star <= post.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                )}
              />
            ))}
            <span className="text-sm text-muted-foreground mr-2">
              ({post.rating}/5)
            </span>
          </div>
        )}

        {/* Store info for reviews */}
        {post.store && (
          <Link
            href={`/store/${post.store._id}`}
            className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.store.profileImage} />
              <AvatarFallback>{post.store.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{post.store.name}</span>
          </Link>
        )}

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {post.images.slice(0, 4).map((image, index) => (
              <div
                key={index}
                className={cn(
                  'relative aspect-video rounded-lg overflow-hidden',
                  post.images!.length === 1 && 'col-span-2',
                  index === 3 && post.images!.length > 4 && 'relative'
                )}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  className="object-cover"
                />
                {index === 3 && post.images!.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      +{post.images!.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex items-center gap-4 w-full">
          <Button
            variant="ghost"
            size="sm"
            className={cn('gap-2', liked && 'text-red-500')}
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
            <span>{likesCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" asChild>
            <Link href={`/community/posts/${post._id}`}>
              <MessageCircle className="h-4 w-4" />
              <span>{post.commentsCount}</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            <span>{t('card.share')}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
