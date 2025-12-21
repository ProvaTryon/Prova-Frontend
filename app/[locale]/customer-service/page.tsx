"use client"

import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { mockConversations } from "@/lib/mock-data"
import { MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function CustomerServiceDashboard() {
  const t = useTranslations('customerService.dashboard')
  const tStats = useTranslations('customerService.dashboard.stats')
  const params = useParams()
  const locale = params.locale as string

  const waitingConversations = mockConversations.filter((c) => c.status === "waiting")
  const activeConversations = mockConversations.filter((c) => c.status === "active")
  const resolvedToday = mockConversations.filter((c) => c.status === "resolved")
  const totalUnread = mockConversations.reduce((sum, c) => sum + c.unreadCount, 0)

  const stats = [
    {
      label: tStats('waiting'),
      value: waitingConversations.length,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      label: tStats('active'),
      value: activeConversations.length,
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: tStats('resolvedToday'),
      value: resolvedToday.length,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: tStats('unreadMessages'),
      value: totalUnread,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ]

  const recentConversations = mockConversations.slice(0, 5)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-card p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-3xl font-bold">{stat.value}</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-serif mb-4">{t('recentConversations')}</h2>
          <div className="space-y-3">
            {recentConversations.map((conv) => {
              const getStatusColor = (status: string) => {
                if (status === "waiting") return "bg-yellow-100 text-yellow-700";
                if (status === "active") return "bg-blue-100 text-blue-700";
                return "bg-green-100 text-green-700";
              };

              const getStatusText = (status: string) => {
                if (status === "waiting") return t('statusWaiting');
                if (status === "active") return t('statusActive');
                return t('statusResolved');
              };

              return (
                <Link
                  key={conv.id}
                  href={`/customer-service/conversations/${conv.id}`}
                  className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{conv.customerName}</h3>
                      <p className="text-sm text-muted-foreground">{conv.subject}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(conv.status)}`}
                    >
                      {getStatusText(conv.status)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{conv.lastMessage}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(conv.lastMessageTime).toLocaleString()}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
                        {conv.unreadCount} {t('new')}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
          <Link
            href={`/${locale}/customer-service/conversations`}
            className="text-sm text-primary hover:underline mt-4 inline-block"
          >
            {t('viewAll')} →
          </Link>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-serif mb-4">{t('priorityQueue')}</h2>
          <div className="space-y-3">
            {mockConversations
              .filter((c) => c.priority === "high" && c.status !== "resolved")
              .map((conv) => (
                <Link
                  key={conv.id}
                  href={`/${locale}/customer-service/conversations/${conv.id}`}
                  className="block p-4 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{conv.customerName}</h3>
                      <p className="text-sm text-muted-foreground">{conv.subject}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-red-600 text-white">{t('high')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{conv.lastMessage}</p>
                </Link>
              ))}
            {mockConversations.filter((c) => c.priority === "high" && c.status !== "resolved").length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">{t('noPriorityConversations')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
