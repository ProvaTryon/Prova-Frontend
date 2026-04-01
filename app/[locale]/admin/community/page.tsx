'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle,
  XCircle,
  Factory,
  Eye,
  Clock,
  TrendingUp,
  Users,
  Palette,
  MessageSquare,
  Filter,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { getDesigns, Design, DesignStatus } from '@/lib/community-service';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Admin-specific API calls
const updateDesignStatus = async (
  designId: string,
  status: DesignStatus,
  adminNotes?: string
): Promise<{ success: boolean }> => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_URL}/api/community/designs/${designId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, adminNotes }),
  });

  if (!response.ok) {
    throw new Error('Failed to update status');
  }
  return response.json();
};

export default function AdminCommunityPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'produce' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    inProduction: 0,
    rejected: 0,
    total: 0,
  });

  useEffect(() => {
    loadDesigns();
  }, [activeTab]);

  const loadDesigns = async () => {
    try {
      setLoading(true);
      const statusMap: Record<string, DesignStatus | undefined> = {
        pending: 'pending',
        approved: 'approved',
        in_production: 'in_production',
        rejected: 'rejected',
        all: undefined,
      };

      const response = await getDesigns({
        status: statusMap[activeTab],
        limit: 50,
        sortBy: 'newest',
      });

      setDesigns(response.data);

      // Load stats
      const [pendingRes, approvedRes, productionRes, rejectedRes] = await Promise.all([
        getDesigns({ status: 'pending', limit: 1 }),
        getDesigns({ status: 'approved', limit: 1 }),
        getDesigns({ status: 'in_production', limit: 1 }),
        getDesigns({ status: 'rejected', limit: 1 }),
      ]);

      setStats({
        pending: pendingRes.meta.total,
        approved: approvedRes.meta.total,
        inProduction: productionRes.meta.total,
        rejected: rejectedRes.meta.total,
        total: pendingRes.meta.total + approvedRes.meta.total + productionRes.meta.total,
      });
    } catch (error) {
      console.error('Failed to load designs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (design: Design, action: 'approve' | 'reject' | 'produce') => {
    setSelectedDesign(design);
    setActionType(action);
    setAdminNotes('');
  };

  const confirmAction = async () => {
    if (!selectedDesign || !actionType) return;

    try {
      setProcessing(true);
      const statusMap: Record<string, DesignStatus> = {
        approve: 'approved',
        reject: 'rejected',
        produce: 'in_production',
      };

      await updateDesignStatus(selectedDesign._id, statusMap[actionType], adminNotes || undefined);

      setSelectedDesign(null);
      setActionType(null);
      setAdminNotes('');
      await loadDesigns();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getActionDialogContent = () => {
    if (!actionType) return { title: '', description: '', buttonText: '', buttonVariant: 'default' as const };

    const content = {
      approve: {
        title: 'قبول التصميم',
        description: 'هل أنت متأكد من قبول هذا التصميم؟ سيتم إخطار المصمم.',
        buttonText: 'قبول',
        buttonVariant: 'default' as const,
      },
      reject: {
        title: 'رفض التصميم',
        description: 'هل أنت متأكد من رفض هذا التصميم؟ سيتم إخطار المصمم بالسبب.',
        buttonText: 'رفض',
        buttonVariant: 'destructive' as const,
      },
      produce: {
        title: 'بدء الإنتاج',
        description: 'هل أنت متأكد من بدء إنتاج هذا التصميم؟ سيتم إخطار المصمم.',
        buttonText: 'بدء الإنتاج',
        buttonVariant: 'default' as const,
      },
    };

    return content[actionType];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">إدارة الكوميونتي</h1>
        <p className="text-muted-foreground">مراجعة التصاميم وإدارة المحتوى</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">قيد المراجعة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-sm text-muted-foreground">مقبول</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Factory className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProduction}</p>
                <p className="text-sm text-muted-foreground">قيد الإنتاج</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">إجمالي التصاميم</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            قيد المراجعة ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            مقبول ({stats.approved})
          </TabsTrigger>
          <TabsTrigger value="in_production" className="gap-2">
            <Factory className="h-4 w-4" />
            قيد الإنتاج ({stats.inProduction})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="h-4 w-4" />
            مرفوض ({stats.rejected})
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <Skeleton className="aspect-video w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : designs.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">لا توجد تصاميم في هذا التصنيف</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {designs.map((design) => (
                <Card key={design._id} className="overflow-hidden">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={design.images[0] || '/placeholder.svg'}
                      alt={design.title}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute top-2 right-2">{design.category}</Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate">{design.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {design.description}
                    </p>

                    {/* Designer info */}
                    <div className="flex items-center gap-2 mt-3">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={design.designer.profileImage} />
                        <AvatarFallback>{design.designer.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{design.designer.name}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span>👍 {design.upvotesCount}</span>
                      <span>👎 {design.downvotesCount}</span>
                      <span>💬 {design.commentsCount}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href={`/community/designs/${design._id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          عرض
                        </Link>
                      </Button>

                      {design.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleAction(design, 'approve')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            قبول
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleAction(design, 'reject')}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {design.status === 'approved' && (
                        <Button
                          size="sm"
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                          onClick={() => handleAction(design, 'produce')}
                        >
                          <Factory className="h-4 w-4 mr-1" />
                          بدء الإنتاج
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={!!selectedDesign && !!actionType} onOpenChange={() => setSelectedDesign(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getActionDialogContent().title}</DialogTitle>
            <DialogDescription>{getActionDialogContent().description}</DialogDescription>
          </DialogHeader>

          {selectedDesign && (
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="relative w-16 h-16 rounded overflow-hidden">
                <Image
                  src={selectedDesign.images[0] || '/placeholder.svg'}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-semibold">{selectedDesign.title}</p>
                <p className="text-sm text-muted-foreground">
                  بواسطة {selectedDesign.designer.name}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات (اختياري)</Label>
            <Textarea
              id="notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder={
                actionType === 'reject'
                  ? 'اشرح سبب الرفض للمصمم...'
                  : 'أضف ملاحظات إن وجدت...'
              }
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDesign(null)}>
              إلغاء
            </Button>
            <Button
              variant={getActionDialogContent().buttonVariant}
              onClick={confirmAction}
              disabled={processing}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {getActionDialogContent().buttonText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
