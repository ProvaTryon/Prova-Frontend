'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Calendar,
  Palette,
  Award,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { getDesigns, Design, toggleVote } from '@/lib/community-service';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface DesignerStats {
  totalDesigns: number;
  totalUpvotes: number;
  totalComments: number;
  approvedDesigns: number;
  inProductionDesigns: number;
}

export default function DesignerProfilePage() {
  const params = useParams();
  const designerId = params.id as string;

  const [designer, setDesigner] = useState<Design['designer'] | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [stats, setStats] = useState<DesignerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [votingId, setVotingId] = useState<string | null>(null);

  useEffect(() => {
    loadDesignerData();
  }, [designerId]);

  const loadDesignerData = async () => {
    try {
      setLoading(true);
      const response = await getDesigns({ designer: designerId, limit: 50 });
      
      if (response.data.length > 0) {
        setDesigner(response.data[0].designer);
        setDesigns(response.data);
        
        const totalUpvotes = response.data.reduce((sum, d) => sum + d.upvotesCount, 0);
        const totalComments = response.data.reduce((sum, d) => sum + d.commentsCount, 0);
        const approvedDesigns = response.data.filter(d => d.status === 'approved' || d.status === 'published').length;
        const inProductionDesigns = response.data.filter(d => d.status === 'in_production').length;
        
        setStats({
          totalDesigns: response.data.length,
          totalUpvotes,
          totalComments,
          approvedDesigns,
          inProductionDesigns,
        });
      }
    } catch (error) {
      console.error('Failed to load designer data:', error);
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
      await loadDesignerData();
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setVotingId(null);
    }
  };

  const filteredDesigns = designs.filter(design => {
    if (activeTab === 'all') return true;
    if (activeTab === 'approved') return design.status === 'approved' || design.status === 'published';
    if (activeTab === 'in_production') return design.status === 'in_production';
    if (activeTab === 'pending') return design.status === 'pending';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <Card className="p-6">
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-6 w-32 mt-4" />
                    <Skeleton className="h-4 w-24 mt-2" />
                  </div>
                </Card>
              </div>
              <div className="md:w-2/3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!designer) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">المصمم غير موجود</h1>
            <Button asChild>
              <Link href="/community">العودة للكوميونتي</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Designer Info Sidebar */}
            <div className="md:w-1/3">
              <Card className="p-6 sticky top-24">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={designer.profileImage} />
                    <AvatarFallback className="text-2xl">{designer.name[0]}</AvatarFallback>
                  </Avatar>
                  <h1 className="text-2xl font-bold mt-4">{designer.name}</h1>
                  <Badge variant="secondary" className="mt-2">
                    <Palette className="h-3 w-3 mr-1" />
                    مصمم
                  </Badge>
                </div>

                {stats && (
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{stats.totalDesigns}</p>
                      <p className="text-xs text-muted-foreground">تصميم</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-green-500">{stats.totalUpvotes}</p>
                      <p className="text-xs text-muted-foreground">تصويت</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-500">{stats.totalComments}</p>
                      <p className="text-xs text-muted-foreground">تعليق</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-500">{stats.inProductionDesigns}</p>
                      <p className="text-xs text-muted-foreground">قيد الإنتاج</p>
                    </div>
                  </div>
                )}

                {stats && stats.inProductionDesigns > 0 && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-500" />
                      <span className="font-semibold">مصمم متميز</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {stats.inProductionDesigns} من تصاميمه قيد الإنتاج
                    </p>
                  </div>
                )}
              </Card>
            </div>

            {/* Designs Grid */}
            <div className="md:w-2/3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="all">
                    الكل ({designs.length})
                  </TabsTrigger>
                  <TabsTrigger value="approved">
                    معتمد
                  </TabsTrigger>
                  <TabsTrigger value="in_production">
                    قيد الإنتاج
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    قيد المراجعة
                  </TabsTrigger>
                </TabsList>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDesigns.map((design) => (
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
                            {design.category}
                          </Badge>
                          {design.status === 'in_production' && (
                            <Badge className="absolute top-2 left-2 bg-purple-500">
                              🏭 قيد الإنتاج
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
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(design.createdAt), {
                            addSuffix: true,
                            locale: ar,
                          })}
                        </div>
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

                {filteredDesigns.length === 0 && (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">لا توجد تصاميم في هذا التصنيف</p>
                  </Card>
                )}
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
