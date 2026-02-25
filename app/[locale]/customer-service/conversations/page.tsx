"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import * as supportService from "@/lib/support-service"
import type { SupportTicket } from "@/lib/support-service"
import { Search, Loader2, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { motion } from "framer-motion"

type StatusFilter = "all" | "open" | "assigned" | "resolved" | "closed"

export default function ConversationsPage() {
  const t = useTranslations("customerService.conversations")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTickets = useCallback(async () => {
    try {
      const status = statusFilter === "all" ? undefined : statusFilter
      const data = await supportService.getAllTickets(status)
      setTickets(data)
    } catch (err) {
      console.error("Failed to load tickets:", err)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    setLoading(true)
    fetchTickets()
  }, [fetchTickets])

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(fetchTickets, 15000)
    return () => clearInterval(interval)
  }, [fetchTickets])

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const statusConfig: Record<string, string> = {
    open: "bg-yellow-100 text-yellow-700",
    assigned: "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-700",
  }

  const priorityConfig: Record<string, string> = {
    high: "bg-red-100 text-red-700",
    medium: "bg-orange-100 text-orange-700",
    low: "bg-gray-100 text-gray-700",
  }

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-serif mb-2">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchTickets() }}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </motion.div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "open", "assigned", "resolved", "closed"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {t(s)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card rounded-xl border shadow-sm overflow-hidden"
        >
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4 font-medium">{t("customer")}</th>
                <th className="text-left p-4 font-medium">{t("subject")}</th>
                <th className="text-left p-4 font-medium">{t("status")}</th>
                <th className="text-left p-4 font-medium">{t("priority")}</th>
                <th className="text-left p-4 font-medium">{t("lastMessage")}</th>
                <th className="text-left p-4 font-medium">{t("unread")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket._id} className="border-t hover:bg-muted/50 cursor-pointer">
                  <td className="p-4">
                    <Link href={`/customer-service/conversations/${ticket._id}`} className="hover:underline">
                      <div className="font-medium">{ticket.userName}</div>
                      <div className="text-sm text-muted-foreground">{ticket.userEmail}</div>
                    </Link>
                  </td>
                  <td className="p-4">
                    <Link href={`/customer-service/conversations/${ticket._id}`}>
                      {ticket.subject}
                    </Link>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[ticket.status] || ""}`}>
                      {t(ticket.status)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[ticket.priority] || ""}`}>
                      {t(ticket.priority)}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {ticket.lastMessageAt ? new Date(ticket.lastMessageAt).toLocaleString() : "—"}
                  </td>
                  <td className="p-4">
                    {ticket.unreadByAgent > 0 && (
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full">
                        {ticket.unreadByAgent}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {!loading && filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("noConversationsFound")}</p>
        </div>
      )}
    </div>
  )
}
