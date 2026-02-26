"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MessageCircle, X, Send, Sparkles, Headphones, ArrowLeft, Plus, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { productService, type Product } from "@/lib/product-service"
import * as supportService from "@/lib/support-service"
import type { SupportTicket, SupportMessage } from "@/lib/support-service"
import { useAuth } from "@/lib/auth-context"
import { usePathname } from "next/navigation"

// ==========================================
// Types
// ==========================================
interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  products?: Product[]
}

type Tab = "ai" | "support"
type SupportView = "list" | "chat" | "new"

const quickActions = [
  "Find a dress for a wedding",
  "Show me casual wear",
  "What's trending now?",
  "Help me with sizing",
]

// ==========================================
// Main Chat Widget
// ==========================================
export function ChatWidget() {
  const t = useTranslations("chatWidget")
  const { user } = useAuth()
  const pathname = usePathname()

  // Hide chat widget on auth, login, and signup pages
  const isAuthPage = /\/(auth|login|signup)(\/?$|\/)/.test(pathname)
  
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("ai")
  const [hasUnread, setHasUnread] = useState(false)

  // CS and admin should not use the support tab (they ARE support)
  const isStaff = user?.role === "customer_service" || user?.role === "admin"

  if (isAuthPage) return null

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center z-50"
        >
          <MessageCircle className="w-6 h-6" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
          )}
        </button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[400px] h-[620px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-4 rounded-t-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-base">{t("title")}</h3>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-primary-foreground/20 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs — hide support tab for CS/admin */}
              {!isStaff && (
              <div className="flex gap-1 bg-primary-foreground/10 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("ai")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${activeTab === "ai"
                    ? "bg-primary-foreground text-primary shadow-sm"
                    : "text-primary-foreground/70 hover:text-primary-foreground"
                    }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {t("aiTab")}
                </button>
                <button
                  onClick={() => setActiveTab("support")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${activeTab === "support"
                    ? "bg-primary-foreground text-primary shadow-sm"
                    : "text-primary-foreground/70 hover:text-primary-foreground"
                    }`}
                >
                  <Headphones className="w-3.5 h-3.5" />
                  {t("supportTab")}
                  {hasUnread && (
                    <span className="w-2 h-2 bg-red-400 rounded-full" />
                  )}
                </button>
              </div>
              )}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === "ai" || isStaff ? (
                <AIChat t={t} onEscalate={isStaff ? undefined : () => setActiveTab("support")} />
              ) : (
                <SupportChat t={t} setHasUnread={setHasUnread} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ==========================================
// AI Assistant Tab
// ==========================================
function AIChat({ t, onEscalate }: { t: ReturnType<typeof useTranslations>; onEscalate?: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: t("aiGreeting"),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [failCount, setFailCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (products.length === 0) {
      productService.getAllProducts().then(setProducts).catch(() => { })
    }
  }, [products.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const getResponse = (messageText: string): { text: string; products?: Product[]; understood: boolean } => {
    const lowerMessage = messageText.toLowerCase()

    if (lowerMessage.includes("dress") || lowerMessage.includes("wedding") || lowerMessage.includes("فستان")) {
      return {
        text: t("aiDressResponse"),
        products: products.filter((p) => p.name.toLowerCase().includes("dress")).slice(0, 2),
        understood: true,
      }
    } else if (lowerMessage.includes("casual") || lowerMessage.includes("كاجوال")) {
      return {
        text: t("aiCasualResponse"),
        products: products.filter((p) => p.category === "women" || p.category === "men").slice(0, 3),
        understood: true,
      }
    } else if (lowerMessage.includes("trend") || lowerMessage.includes("ترند")) {
      return {
        text: t("aiTrendResponse"),
        products: products.filter((p) => p.salePrice).slice(0, 3),
        understood: true,
      }
    } else if (lowerMessage.includes("size") || lowerMessage.includes("sizing") || lowerMessage.includes("مقاس")) {
      return {
        text: t("aiSizeResponse"),
        understood: true,
      }
    }

    return {
      text: t("aiDefaultResponse"),
      understood: false,
    }
  }

  const handleSend = async (message?: string) => {
    const messageText = message || input
    if (!messageText.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    await new Promise((resolve) => setTimeout(resolve, 800))

    const response = getResponse(messageText)

    if (!response.understood) {
      setFailCount((prev) => prev + 1)
    } else {
      setFailCount(0)
    }

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response.text,
      products: response.products,
    }

    setMessages((prev) => [...prev, assistantMessage])
    setIsTyping(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${message.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted text-foreground rounded-bl-md"
                }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              {message.products && message.products.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      className="flex gap-2 p-2 bg-background rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-muted">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                        <p className="text-sm font-medium truncate text-foreground">{product.name}</p>
                        <p className="text-sm font-semibold text-foreground">
                          ${product.salePrice || product.price}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.15s]" />
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Escalate Button - shows after 2 misunderstood messages (not for staff) */}
      {failCount >= 2 && onEscalate && (
        <div className="px-4 pb-2">
          <button
            onClick={onEscalate}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-xl text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors"
          >
            <Headphones className="w-4 h-4" />
            {t("talkToHuman")}
          </button>
        </div>
      )}

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2">{t("quickActions")}</p>
          <div className="flex flex-wrap gap-1.5">
            {quickActions.map((action) => (
              <button
                key={action}
                onClick={() => handleSend(action)}
                className="text-xs px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend() }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("aiPlaceholder")}
            className="flex-1 px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-muted/30"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

// ==========================================
// Support Tab
// ==========================================
function SupportChat({ t, setHasUnread }: { t: ReturnType<typeof useTranslations>; setHasUnread: (v: boolean) => void }) {
  const [view, setView] = useState<SupportView>("list")
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null)
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Check auth
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    setIsLoggedIn(!!token)
  }, [])

  // Load tickets
  const loadTickets = useCallback(async () => {
    if (!isLoggedIn) return
    try {
      const data = await supportService.getMyTickets()
      setTickets(data)
      const unread = data.some((ticket) => ticket.unreadByUser > 0)
      setHasUnread(unread)
    } catch {
      // silently fail
    }
  }, [isLoggedIn, setHasUnread])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  // Poll for updates every 10s when viewing tickets
  useEffect(() => {
    if (!isLoggedIn || view === "new") return
    const interval = setInterval(loadTickets, 10000)
    return () => clearInterval(interval)
  }, [isLoggedIn, view, loadTickets])

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Headphones className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <h3 className="font-medium text-lg mb-2">{t("loginRequired")}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t("loginRequiredDesc")}</p>
        <Link
          href="/auth"
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {t("signIn")}
        </Link>
      </div>
    )
  }

  if (view === "new") {
    return <NewTicketForm t={t} onBack={() => setView("list")} onCreated={(ticket) => {
      setTickets((prev) => [ticket, ...prev])
      setActiveTicket(ticket)
      setView("chat")
    }} />
  }

  if (view === "chat" && activeTicket) {
    return <TicketChat t={t} ticketId={activeTicket._id} onBack={() => { setView("list"); loadTickets() }} />
  }

  return <TicketList t={t} tickets={tickets} loading={loading} setLoading={setLoading} onSelect={(ticket) => { setActiveTicket(ticket); setView("chat") }} onNew={() => setView("new")} />
}

// ==========================================
// Ticket List View
// ==========================================
function TicketList({
  t,
  tickets,
  onSelect,
  onNew,
}: {
  t: ReturnType<typeof useTranslations>
  tickets: SupportTicket[]
  loading: boolean
  setLoading: (v: boolean) => void
  onSelect: (ticket: SupportTicket) => void
  onNew: () => void
}) {
  const statusIcon = (status: string) => {
    switch (status) {
      case "open": return <Clock className="w-3.5 h-3.5 text-yellow-500" />
      case "assigned": return <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
      case "resolved": return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
      default: return <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Headphones className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-medium mb-1">{t("noTickets")}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t("noTicketsDesc")}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {tickets.map((ticket) => (
              <button
                key={ticket._id}
                onClick={() => onSelect(ticket)}
                className="w-full text-left p-4 hover:bg-muted/50 transition-colors relative"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{statusIcon(ticket.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm truncate">{ticket.subject}</p>
                      {ticket.unreadByUser > 0 && (
                        <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center font-bold">
                          {ticket.unreadByUser}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{ticket.lastMessage}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {new Date(ticket.lastMessageAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New Conversation Button */}
      <div className="p-3 border-t border-border">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t("newConversation")}
        </button>
      </div>
    </div>
  )
}

// ==========================================
// New Ticket Form
// ==========================================
function NewTicketForm({
  t,
  onBack,
  onCreated,
}: {
  t: ReturnType<typeof useTranslations>
  onBack: () => void
  onCreated: (ticket: SupportTicket) => void
}) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return

    setIsSubmitting(true)
    setError("")
    try {
      const ticket = await supportService.createTicket({ subject, message })
      onCreated(ticket)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="p-1 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h3 className="font-medium text-sm">{t("newConversation")}</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-xl text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1.5">{t("subject")}</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t("subjectPlaceholder")}
            className="w-full px-3 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-muted/30"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">{t("message")}</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("messagePlaceholder")}
            rows={4}
            className="w-full px-3 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none bg-muted/30"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !subject.trim() || !message.trim()}
          className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? t("sending") : t("startConversation")}
        </button>
      </form>
    </div>
  )
}

// ==========================================
// Ticket Chat View
// ==========================================
function TicketChat({
  t,
  ticketId,
  onBack,
}: {
  t: ReturnType<typeof useTranslations>
  ticketId: string
  onBack: () => void
}) {
  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadTicket = useCallback(async () => {
    try {
      const data = await supportService.getTicket(ticketId)
      setTicket(data)
    } catch {
      // silently fail
    }
  }, [ticketId])

  useEffect(() => {
    loadTicket()
  }, [loadTicket])

  // Poll for new messages
  useEffect(() => {
    const interval = setInterval(loadTicket, 5000)
    return () => clearInterval(interval)
  }, [loadTicket])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [ticket?.messages])

  const handleSend = async () => {
    if (!input.trim() || isSending) return
    setIsSending(true)
    try {
      const updated = await supportService.sendMessage(ticketId, input)
      setTicket(updated)
      setInput("")
    } catch {
      // silently fail
    } finally {
      setIsSending(false)
    }
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const statusLabel = ticket.status === "open" ? t("statusOpen") : ticket.status === "assigned" ? t("statusAssigned") : ticket.status === "resolved" ? t("statusResolved") : t("statusClosed")
  const statusColor = ticket.status === "open" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : ticket.status === "assigned" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : ticket.status === "resolved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-3 border-b border-border">
        <button onClick={onBack} className="p-1 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{ticket.subject}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
              {statusLabel}
            </span>
            {ticket.agentName && (
              <span className="text-xs text-muted-foreground">{ticket.agentName}</span>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {ticket.status === "open" && (
          <div className="text-center py-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded-xl text-xs">
              <Clock className="w-3.5 h-3.5" />
              {t("waitingForAgent")}
            </div>
          </div>
        )}

        {ticket.messages.map((msg) => (
          <div key={msg._id} className={`flex ${msg.senderRole === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] ${msg.senderRole === "user"
              ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
              : "bg-muted text-foreground rounded-2xl rounded-bl-md"
              } px-4 py-2.5`}>
              {msg.senderRole === "cs" && (
                <p className="text-xs font-medium mb-1 opacity-70">
                  {msg.senderName} · {t("supportAgent")}
                </p>
              )}
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <p className={`text-[10px] mt-1 ${msg.senderRole === "user" ? "text-primary-foreground/60" : "text-muted-foreground/60"}`}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input - disabled if resolved/closed */}
      {ticket.status !== "resolved" && ticket.status !== "closed" ? (
        <div className="p-3 border-t border-border">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend() }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("typeMessage")}
              className="flex-1 px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm bg-muted/30"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="p-3 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">{t("conversationClosed")}</p>
        </div>
      )}
    </div>
  )
}
