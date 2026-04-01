'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PenLine } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import {
  DesignerSpotlight,
  PostFeed,
  CommunityFilters,
  CreatePostForm,
  UploadDesignModal,
  DesignGrid,
} from '@/components/community';
import { PostType, DesignCategory } from '@/lib/community-service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function CommunityPage() {
  const searchParams = useSearchParams();
  const t = useTranslations('community');
  const initialTab = searchParams.get('tab') === 'designs' ? 'designs' : 'posts';

  const [activeTab, setActiveTab] = useState<'posts' | 'designs'>(initialTab);
  const [postType, setPostType] = useState<PostType | undefined>();
  const [designCategory, setDesignCategory] = useState<DesignCategory | undefined>();
  const [sortBy, setSortBy] = useState('newest');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Designer Spotlight Section */}
        <DesignerSpotlight />

        {/* Community Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {/* Header with Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold">🏘️ {t('title')}</h1>
                <p className="text-muted-foreground mt-1">
                  {t('subtitle')}
                </p>
              </div>
              <div className="flex gap-3">
                <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <PenLine className="h-4 w-4" />
                      {t('newPost')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{t('createNewPost')}</DialogTitle>
                    </DialogHeader>
                    <CreatePostForm
                      onSuccess={() => {
                        setShowCreatePost(false);
                        handleRefresh();
                      }}
                    />
                  </DialogContent>
                </Dialog>
                <UploadDesignModal onSuccess={handleRefresh} />
              </div>
            </div>

            {/* Filters */}
            <CommunityFilters
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setSortBy('newest');
              }}
              postType={postType}
              onPostTypeChange={setPostType}
              designCategory={designCategory}
              onDesignCategoryChange={setDesignCategory}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              className="mb-6"
            />

            {/* Content */}
            <div className="max-w-3xl mx-auto" key={refreshKey}>
              {activeTab === 'posts' ? (
                <PostFeed
                  type={postType}
                  sortBy={sortBy as 'newest' | 'popular' | 'most_commented'}
                />
              ) : (
                <DesignGrid
                  category={designCategory}
                  sortBy={sortBy as 'newest' | 'popular' | 'trending'}
                />
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
