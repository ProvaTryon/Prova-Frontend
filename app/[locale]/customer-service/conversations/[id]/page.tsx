"use client"

import { use, useState, useRef, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import * as supportService from "@/lib/support-service"
import type { SupportTicket } from "@/lib/support-service"
import { useAuth } from "@/lib/auth-context"
import { Send, ArrowLeft, Loader2, UserPlus, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function ConversationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations("customerService.conversationDetail")
  const { id } = use(params)
  const { user } = useAuth()
  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchTicket = useCallback(async () => {
    try {
      const data = await supportService.getTicket(id)
      setTicket(data)
    } catch (err) {
      console.error("Failed to load ticket:", err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchTicket()
  }, [fetchTicket])

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchTicket, 5000)
    return () => clearInterval(interval)
  }, [fetchTicket])

  useEffect(() => {
    scrollToBottom()
  }, [ticket?.messages])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="p-8">
        <p>{t("conversationNotFound")}</p>
      </div>
    )
  }

  const handleSend = async () => {
    if (!message.trim() || sending) return
    setSending(true)
    try {
      const updated = await supportService.sendMessage(id, message)
      setTicket(updated)
      setMessage("")
    } catch (err) {
      console.error("Failed to send message:", err)
    } finally {
      setSending(false)
    }
  }

  const handleAssignToMe = async () => {
    try {
      const updated = await supportService.assignTicket(id)
      setTicket(updated)
    } catch (err) {
      console.error("Failed to assign:", err)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const updated = await supportService.updateTicketStatus(id, newStatus)
      setTicket(updated)
    } catch (err) {
      console.error("Failed to update status:", err)
    }
  }

  const statusConfig: Record<string, string> = {
    open: "bg-yellow-100 text-yellow-700",
    assigned: "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-700",
  }

  const isAssignedToMe = ticket.agentId === user?.id
  const isClosed = ticket.status === "closed"

  return (
    <div className="h-screen flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 border-b bg-card"
      >
        <div className="flex items-center gap-4 mb-4">
          <Link href="/customer-service/conversations">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("back")}
            </Button>
          </Link>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-serif mb-1">{ticket.userName}</h1>
            <p className="text-sm text-muted-foreground">{ticket.userEmail}</p>
            <p className="text-sm font-medium mt-2">{ticket.subject}</p>
            {ticket.agentName && (
              <p className="text-xs text-muted-foreground mt-1">
                {t("assignedTo")}: {ticket.agentName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Assign to me button */}
            {!ticket.agentId && (
              <Button variant="outline" size="sm" onClick={handleAssignToMe}>
                <UserPlus className="w-4 h-4 mr-1" />
                {t("assignToMe")}
              </Button>
            )}

            {/* Status controls */}
            {isAssignedToMe && !isClosed && (
              <>
                {ticket.status !== "resolved" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange("resolved")}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    {t("resolve")}
                  </Button>
                )}
                {ticket.status === "resolved" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange("closed")}
                  >
                    {t("close")}
                  </Button>
                )}
              </>
            )}

            <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusConfig[ticket.status] || ""}`}>
              {t(ticket.status)}
            </span>
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                ticket.priority === "high"
                  ? "bg-red-100 text-red-700"
                  : ticket.priority === "medium"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-gray-100 text-gray-700"
              }`}
            >
              {t(ticket.priority)}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {ticket.messages.map((msg) => (
          <div key={msg._id} className={`flex ${msg.senderRole === "cs" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] rounded-lg p-4 ${
                msg.senderRole === "cs"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{msg.senderName}</span>
                <span className="text-xs opacity-70">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input — only show if assigned to the current agent and not closed */}
      {isAssignedToMe && !isClosed ? (
        <div className="p-6 border-t bg-card">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={t("typeMessage")}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={sending}
            />
            <Button onClick={handleSend} disabled={!message.trim() || sending}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              {t("send")}
            </Button>
          </div>
        </div>
      ) : !isAssignedToMe && !isClosed ? (
        <div className="p-6 border-t bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">{t("assignFirst")}</p>
        </div>
      ) : null}
    </div>
  )
}
