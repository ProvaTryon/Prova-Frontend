"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { MessageSquare, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import * as supportService from "@/lib/support-service"
import type { SupportTicket, DashboardStats } from "@/lib/support-service"

export default function CustomerServiceDashboard() {
  const t = useTranslations('customerService.dashboard')
  const tStats = useTranslations('customerService.dashboard.stats')
  const params = useParams()
  const locale = params.locale as string

  const [dashStats, setDashStats] = useState<DashboardStats | null>(null)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [stats, allTickets] = await Promise.all([
          supportService.getDashboardStats(),
          supportService.getAllTickets(),
        ])
        setDashStats(stats)
        setTickets(allTickets)
      } catch (err) {
        console.error("Failed to load dashboard:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const stats = [
    {
      label: tStats('waiting'),
      value: dashStats?.open ?? 0,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      label: tStats('active'),
      value: dashStats?.assigned ?? 0,
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: tStats('resolvedToday'),
      value: dashStats?.resolved ?? 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: tStats('unreadMessages'),
      value: dashStats?.totalUnread ?? 0,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ]

  const recentTickets = tickets.slice(0, 5)
  const highPriority = tickets.filter((t) => t.priority === "high" && t.status !== "resolved" && t.status !== "closed")

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-serif mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ y: -2 }}
              className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-3xl font-bold">{stat.value}</div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-card p-6 rounded-xl border shadow-sm"
        >
          <h2 className="text-xl font-serif mb-4">{t('recentConversations')}</h2>
          <div className="space-y-3">
            {recentTickets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t('noConversations')}</p>
            ) : (
              recentTickets.map((ticket) => {
                const getStatusColor = (status: string) => {
                  if (status === "open") return "bg-yellow-100 text-yellow-700";
                  if (status === "assigned") return "bg-blue-100 text-blue-700";
                  if (status === "resolved") return "bg-green-100 text-green-700";
                  return "bg-gray-100 text-gray-700";
                };

                const getStatusText = (status: string) => {
                  if (status === "open") return t('statusWaiting');
                  if (status === "assigned") return t('statusActive');
                  return t('statusResolved');
                };

                return (
                  <Link
                    key={ticket._id}
                    href={`/${locale}/customer-service/conversations/${ticket._id}`}
                    className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{ticket.userName}</h3>
                        <p className="text-sm text-muted-foreground">{ticket.subject}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}
                      >
                        {getStatusText(ticket.status)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{ticket.lastMessage}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(ticket.lastMessageAt).toLocaleString()}
                      </span>
                      {ticket.unreadByAgent > 0 && (
                        <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
                          {ticket.unreadByAgent} {t('new')}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })
            )}
          </div>
          <Link
            href={`/${locale}/customer-service/conversations`}
            className="text-sm text-primary hover:underline mt-4 inline-block"
          >
            {t('viewAll')} →
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-card p-6 rounded-xl border shadow-sm"
        >
          <h2 className="text-xl font-serif mb-4">{t('priorityQueue')}</h2>
          <div className="space-y-3">
            {highPriority.map((ticket) => (
              <Link
                key={ticket._id}
                href={`/${locale}/customer-service/conversations/${ticket._id}`}
                className="block p-4 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{ticket.userName}</h3>
                    <p className="text-sm text-muted-foreground">{ticket.subject}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-600 text-white">{t('high')}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{ticket.lastMessage}</p>
              </Link>
            ))}
            {highPriority.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">{t('noPriorityConversations')}</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
