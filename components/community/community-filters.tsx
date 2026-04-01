'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PostType, DesignCategory } from '@/lib/community-service';
import { cn } from '@/lib/utils';

interface CommunityFiltersProps {
  activeTab: 'posts' | 'designs';
  onTabChange: (tab: 'posts' | 'designs') => void;
  postType?: PostType;
  onPostTypeChange: (type: PostType | undefined) => void;
  designCategory?: DesignCategory;
  onDesignCategoryChange: (category: DesignCategory | undefined) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  className?: string;
}

export function CommunityFilters({
  activeTab,
  onTabChange,
  postType,
  onPostTypeChange,
  designCategory,
  onDesignCategoryChange,
  sortBy,
  onSortByChange,
  className,
}: CommunityFiltersProps) {
  const t = useTranslations('community');
  
  const postTypes: { value: PostType | 'all'; labelKey: string }[] = [
    { value: 'all', labelKey: 'postTypes.all' },
    { value: 'issue', labelKey: 'postTypes.issue' },
    { value: 'review', labelKey: 'postTypes.review' },
    { value: 'tip', labelKey: 'postTypes.tip' },
    { value: 'question', labelKey: 'postTypes.question' },
  ];

  const designCategories: { value: DesignCategory | 'all'; labelKey: string }[] = [
    { value: 'all', labelKey: 'designCategories.all' },
    { value: 'tshirt', labelKey: 'designCategories.tshirt' },
    { value: 'hoodie', labelKey: 'designCategories.hoodie' },
    { value: 'pants', labelKey: 'designCategories.pants' },
    { value: 'jacket', labelKey: 'designCategories.jacket' },
    { value: 'dress', labelKey: 'designCategories.dress' },
    { value: 'accessories', labelKey: 'designCategories.accessories' },
    { value: 'other', labelKey: 'designCategories.other' },
  ];

  const postSortOptions = [
    { value: 'newest', labelKey: 'sort.newest' },
    { value: 'popular', labelKey: 'sort.popular' },
    { value: 'most_commented', labelKey: 'sort.mostCommented' },
  ];

  const designSortOptions = [
    { value: 'newest', labelKey: 'sort.newest' },
    { value: 'popular', labelKey: 'sort.mostVoted' },
    { value: 'trending', labelKey: 'sort.trending' },
  ];

  const sortOptions = activeTab === 'posts' ? postSortOptions : designSortOptions;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as 'posts' | 'designs')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="posts">📝 {t('tabs.posts')}</TabsTrigger>
          <TabsTrigger value="designs">🎨 {t('tabs.designs')}</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Type/Category Filter */}
        {activeTab === 'posts' ? (
          <div className="flex gap-2 flex-wrap">
            {postTypes.map((type) => (
              <Button
                key={type.value}
                variant={
                  (type.value === 'all' && !postType) || type.value === postType
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                onClick={() => onPostTypeChange(type.value === 'all' ? undefined : type.value)}
              >
                {t(type.labelKey)}
              </Button>
            ))}
          </div>
        ) : (
          <Select
            value={designCategory || 'all'}
            onValueChange={(v) =>
              onDesignCategoryChange(v === 'all' ? undefined : (v as DesignCategory))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('filters.category')} />
            </SelectTrigger>
            <SelectContent>
              {designCategories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {t(cat.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Sort */}
        <div className="mr-auto">
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={t('filters.sortBy')} />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
