"use client"

import { useTranslations } from "next-intl"
import { mockConversations } from "@/lib/mock-data"
import { MessageSquare, Clock, CheckCircle, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

export default function CSAnalytics() {
  const t = useTranslations("customerService.analytics")
  const totalConversations = mockConversations.length
  const resolvedConversations = mockConversations.filter((c) => c.status === "resolved").length
  const avgResponseTime = "12 min"
  const satisfactionRate = "94%"

  const stats = [
    {
      label: t("totalConversations"),
      value: totalConversations,
      icon: MessageSquare,
      change: `+15% ${t("fromLastWeek")}`,
    },
    {
      label: t("resolved"),
      value: resolvedConversations,
      icon: CheckCircle,
      change: `+8% ${t("fromLastWeek")}`,
    },
    {
      label: t("avgResponseTime"),
      value: avgResponseTime,
      icon: Clock,
      change: `-2 ${t("minFromLastWeek")}`,
    },
    {
      label: t("satisfactionRate"),
      value: satisfactionRate,
      icon: TrendingUp,
      change: `+2% ${t("fromLastWeek")}`,
    },
  ]

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-serif mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <p className="text-sm text-green-600">{stat.change}</p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
