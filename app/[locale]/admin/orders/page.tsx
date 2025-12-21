"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Search, Eye, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { OrderDetailsModal } from "@/components/admin/order-details-modal"

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

const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-1001",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    items: [
      {
        productId: "1",
        productName: "Silk Blend Midi Dress",
        quantity: 1,
        price: 149,
        size: "M",
        color: "Black",
      },
      {
        productId: "2",
        productName: "Tailored Wool Blazer",
        quantity: 1,
        price: 299,
        size: "M",
        color: "Navy",
      },
    ],
    total: 448,
    status: "delivered",
    paymentStatus: "paid",
    orderDate: "2024-03-15T10:30:00",
    shippingAddress: "123 Main St, New York, NY 10001",
  },
  {
    id: "2",
    orderNumber: "ORD-1002",
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    items: [
      {
        productId: "3",
        productName: "Cashmere Turtleneck",
        quantity: 2,
        price: 159,
        size: "S",
        color: "Cream",
      },
    ],
    total: 318,
    status: "shipped",
    paymentStatus: "paid",
    orderDate: "2024-03-18T14:20:00",
    shippingAddress: "456 Oak Ave, Los Angeles, CA 90001",
  },
  {
    id: "3",
    orderNumber: "ORD-1003",
    customerName: "Sarah Johnson",
    customerEmail: "sarah@example.com",
    items: [
      {
        productId: "4",
        productName: "Wide Leg Trousers",
        quantity: 1,
        price: 129,
        size: "L",
        color: "Black",
      },
    ],
    total: 129,
    status: "processing",
    paymentStatus: "paid",
    orderDate: "2024-03-20T09:15:00",
    shippingAddress: "789 Pine Rd, Chicago, IL 60601",
  },
  {
    id: "4",
    orderNumber: "ORD-1004",
    customerName: "Mike Wilson",
    customerEmail: "mike@example.com",
    items: [
      {
        productId: "5",
        productName: "Leather Crossbody Bag",
        quantity: 1,
        price: 249,
        size: "One Size",
        color: "Tan",
      },
    ],
    total: 249,
    status: "pending",
    paymentStatus: "paid",
    orderDate: "2024-03-21T16:45:00",
    shippingAddress: "321 Elm St, Boston, MA 02101",
  },
]

const statusColors = {
  pending: "bg-yellow-50 text-yellow-700",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
}

export default function OrdersManagement() {
  const t = useTranslations('admin.orders')
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const pendingOrders = orders.filter((o) => o.status === "pending").length
  const shippedOrders = orders.filter((o) => o.status === "shipped").length

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-background border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">{t('totalOrders')}</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="bg-background border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">{t('totalRevenue')}</p>
          <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-background border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">{t('pending')}</p>
          <p className="text-2xl font-bold">{pendingOrders}</p>
        </div>
        <div className="bg-background border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">{t('shipped')}</p>
          <p className="text-2xl font-bold">{shippedOrders}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold">{t('order')}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">{t('customer')}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">{t('items')}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">{t('total')}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">{t('date')}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">{t('status')}</th>
                <th className="text-right px-6 py-4 text-sm font-semibold">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">{order.paymentStatus}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{order.items.length} {t('itemsCount')}</td>
                  <td className="px-6 py-4 font-medium">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as Order["status"])}
                      className={`px-2 py-1 text-xs font-medium rounded capitalize ${statusColors[order.status]}`}
                      aria-label={t('status')}
                    >
                      <option value="pending">{t('pending')}</option>
                      <option value="processing">{t('processing')}</option>
                      <option value="shipped">{t('shipped')}</option>
                      <option value="delivered">{t('delivered')}</option>
                      <option value="cancelled">{t('cancelled')}</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title={t('actions')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('noOrdersFound')}</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} order={selectedOrder} />
    </div>
  )
}
