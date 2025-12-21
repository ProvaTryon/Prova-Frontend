"use client"

import { X } from "lucide-react"

interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  size: string
  color: string
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  paymentStatus: "paid" | "pending" | "failed"
  orderDate: string
  shippingAddress: string
}

interface OrderDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  order: Order | null
}

export function OrderDetailsModal({ isOpen, onClose, order }: OrderDetailsModalProps) {
  if (!isOpen || !order) return null

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 15
  const tax = subtotal * 0.08

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-semibold">Order Details</h2>
            <p className="text-sm text-muted-foreground">{order.orderNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="font-semibold mb-3">Customer Information</h3>
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{order.customerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date:</span>
                <span className="font-medium">{new Date(order.orderDate).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="font-semibold mb-3">Shipping Address</h3>
            <div className="bg-muted/30 rounded-lg p-4">
              <p>{order.shippingAddress}</p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-muted/30 rounded-lg p-4">
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping:</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-semibold">Total:</span>
                <span className="font-semibold">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="font-semibold mb-3">Status</h3>
            <div className="flex gap-4">
              <div className="flex-1 bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Order Status</p>
                <p className="font-medium capitalize">{order.status}</p>
              </div>
              <div className="flex-1 bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                <p className="font-medium capitalize">{order.paymentStatus}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
