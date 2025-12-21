"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { mockProducts } from "@/lib/mock-data"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  products?: typeof mockProducts
}

const quickActions = [
  "Find a dress for a wedding",
  "Show me casual wear",
  "What's trending now?",
  "Help me with sizing",
]

const mockResponses: Record<string, { text: string; products?: typeof mockProducts }> = {
  default: {
    text: "I'd be happy to help you find the perfect outfit! Could you tell me more about what you're looking for?",
  },
  dress: {
    text: "I found some beautiful dresses that would be perfect for a wedding! Here are my top recommendations:",
    products: mockProducts.filter((p) => p.name.toLowerCase().includes("dress")).slice(0, 2),
  },
  casual: {
    text: "Here are some great casual pieces from our collection:",
    products: mockProducts.filter((p) => p.category === "women" || p.category === "men").slice(0, 3),
  },
  trending: {
    text: "These items are trending right now and flying off the shelves:",
    products: mockProducts.filter((p) => p.salePrice).slice(0, 3),
  },
  sizing: {
    text: "I can help with sizing! Our size guide includes detailed measurements for each item. You can find it on any product page. Is there a specific item you need help with?",
  },
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI fashion assistant. How can I help you find the perfect outfit today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (message?: string) => {
    const messageText = message || input
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1000))

    let response = mockResponses.default
    const lowerMessage = messageText.toLowerCase()

    if (lowerMessage.includes("dress") || lowerMessage.includes("wedding")) {
      response = mockResponses.dress
    } else if (lowerMessage.includes("casual")) {
      response = mockResponses.casual
    } else if (lowerMessage.includes("trend")) {
      response = mockResponses.trending
    } else if (lowerMessage.includes("size") || lowerMessage.includes("sizing")) {
      response = mockResponses.sizing
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response.text,
      products: response.products,
    }

    setMessages((prev) => [...prev, assistantMessage])
    setIsTyping(false)
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center z-50"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-background border border-border rounded-lg shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-semibold">Fashion Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-primary-foreground/20 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>

                  {/* Product Cards */}
                  {message.products && message.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.products.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          className="flex gap-2 p-2 bg-background rounded-lg hover:bg-muted transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="relative w-16 h-20 flex-shrink-0 rounded overflow-hidden bg-muted">
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
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
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
          <div className="p-4 border-t border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
