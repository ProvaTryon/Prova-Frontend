"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { mockConversations } from "@/lib/mock-data"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function ConversationsPage() {
  const t = useTranslations("customerService.conversations")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "waiting" | "active" | "resolved">("all")

  const filteredConversations = mockConversations.filter((conv) => {
    const matchesSearch =
      conv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.subject.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || conv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

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
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}
          >
            {t("all")}
          </button>
          <button
            onClick={() => setStatusFilter("waiting")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === "waiting" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}
          >
            {t("waiting")}
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === "active" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}
          >
            {t("active")}
          </button>
          <button
            onClick={() => setStatusFilter("resolved")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === "resolved" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}
          >
            {t("resolved")}
          </button>
        </div>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
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
            {filteredConversations.map((conv) => (
              <tr key={conv.id} className="border-t hover:bg-muted/50">
                <td className="p-4">
                  <Link href={`/customer-service/conversations/${conv.id}`} className="hover:underline">
                    <div className="font-medium">{conv.customerName}</div>
                    <div className="text-sm text-muted-foreground">{conv.customerEmail}</div>
                  </Link>
                </td>
                <td className="p-4">{conv.subject}</td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${conv.status === "waiting"
                        ? "bg-yellow-100 text-yellow-700"
                        : conv.status === "active"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                  >
                    {t(conv.status)}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${conv.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : conv.priority === "medium"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                  >
                    {t(conv.priority)}
                  </span>
                </td>
                <td className="p-4 text-sm text-muted-foreground">{new Date(conv.lastMessageTime).toLocaleString()}</td>
                <td className="p-4">
                  {conv.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredConversations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("noConversationsFound")}</p>
        </div>
      )}
    </div>
  )
}
