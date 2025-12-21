"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { mockStores, type Store } from "@/lib/mock-data"
import { Search, Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AdminStoresPage() {
  const t = useTranslations('admin.stores')
  const [stores, setStores] = useState<Store[]>(mockStores)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "suspended">("all")

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || store.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (storeId: string, newStatus: "active" | "pending" | "suspended") => {
    setStores(stores.map((store) => (store.id === storeId ? { ...store, status: newStatus } : store)))
  }

  const handleDelete = (storeId: string) => {
    if (confirm(t('deleteConfirm'))) {
      setStores(stores.filter((store) => store.id !== storeId))
    }
  }

  const activeCount = stores.filter((s) => s.status === "active").length
  const pendingCount = stores.filter((s) => s.status === "pending").length
  const suspendedCount = stores.filter((s) => s.status === "suspended").length

  const getStatusColor = (status: string) => {
    if (status === "active") return "bg-green-100 text-green-700"
    if (status === "pending") return "bg-yellow-100 text-yellow-700"
    return "bg-red-100 text-red-700"
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-semibold mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          {t('addStore')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">{t('activeStores')}</p>
              <p className="text-2xl font-bold text-green-900">{activeCount}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 font-medium">{t('pendingApproval')}</p>
              <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
            </div>
            <XCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">{t('suspended')}</p>
              <p className="text-2xl font-bold text-red-900">{suspendedCount}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
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
            {t('all')}
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === "active" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}
          >
            {t('active')}
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === "pending" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}
          >
            {t('pending')}
          </button>
          <button
            onClick={() => setStatusFilter("suspended")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === "suspended" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}
          >
            {t('suspended')}
          </button>
        </div>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 font-medium">{t('storeName')}</th>
              <th className="text-left p-4 font-medium">{t('owner')}</th>
              <th className="text-left p-4 font-medium">{t('products')}</th>
              <th className="text-left p-4 font-medium">{t('sales')}</th>
              <th className="text-left p-4 font-medium">{t('revenue')}</th>
              <th className="text-left p-4 font-medium">{t('status')}</th>
              <th className="text-right p-4 font-medium">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredStores.map((store) => (
              <tr key={store.id} className="border-t hover:bg-muted/50">
                <td className="p-4">
                  <div>
                    <div className="font-medium">{store.name}</div>
                    <div className="text-sm text-muted-foreground">{store.description}</div>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <div className="font-medium">{store.ownerName}</div>
                    <div className="text-sm text-muted-foreground">{store.ownerEmail}</div>
                  </div>
                </td>
                <td className="p-4">{store.totalProducts}</td>
                <td className="p-4">{store.totalSales}</td>
                <td className="p-4 font-medium">${store.revenue.toLocaleString()}</td>
                <td className="p-4">
                  <select
                    value={store.status}
                    onChange={(e) => handleStatusChange(store.id, e.target.value as any)}
                    aria-label={t('status')}
                    className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(store.status)}`}
                  >
                    <option value="active">{t('active')}</option>
                    <option value="pending">{t('pending')}</option>
                    <option value="suspended">{t('suspended')}</option>
                  </select>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(store.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStores.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('noStoresFound')}</p>
        </div>
      )}
    </div>
  )
}
