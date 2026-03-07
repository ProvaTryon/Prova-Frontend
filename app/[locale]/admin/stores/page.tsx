"use client"

import { useState, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { Search, Trash2, Store, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import * as merchantService from "@/lib/merchant-service"

// Backend Merchant structure (userId is populated from User model)
interface MerchantUser {
  _id: string
  name: string
  email: string
  phone: string
  isActive: boolean
}

interface Merchant {
  _id: string
  userId: MerchantUser
  companyName: string
  companyId: string
  nationalId: string
  products: string[]
  createdAt?: string
}

export default function AdminStoresPage() {
  const t = useTranslations('admin.stores')
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const highlightRef = useRef<HTMLTableRowElement>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    loadMerchants()
  }, [])

  useEffect(() => {
    const id = searchParams.get('highlight')
    if (id && merchants.length > 0) {
      setHighlightId(id)
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
      setTimeout(() => setHighlightId(null), 1500)
    }
  }, [searchParams, merchants])

  const loadMerchants = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await merchantService.getAllMerchants()
      console.log("Merchants loaded:", data)
      setMerchants(data || [])
    } catch (error: any) {
      console.error("Failed to load merchants:", error)
      setError(error.message || "Failed to load merchants")
      setMerchants([])
    } finally {
      setLoading(false)
    }
  }

  const filteredMerchants = merchants.filter((merchant) => {
    const matchesSearch =
      merchant.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      merchant.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      merchant.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleDelete = async (userId: string) => {
    if (confirm(t('deleteConfirm'))) {
      try {
        setActionLoading(userId)
        await merchantService.deleteMerchant(userId)
        setMerchants(merchants.filter((m) => m.userId?._id !== userId))
      } catch (error) {
        console.error("Failed to delete merchant:", error)
        alert("Failed to delete merchant")
      } finally {
        setActionLoading(null)
      }
    }
  }

  const totalMerchants = merchants.length
  const totalProducts = merchants.reduce((sum, m) => sum + (m.products?.length || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadMerchants}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-semibold mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Total Merchants</p>
              <p className="text-2xl font-bold text-blue-900">{totalMerchants}</p>
            </div>
            <Store className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Total Products</p>
              <p className="text-2xl font-bold text-green-900">{totalProducts}</p>
            </div>
            <Store className="w-8 h-8 text-green-600" />
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
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 font-medium">{t('storeName')}</th>
              <th className="text-left p-4 font-medium">{t('owner')}</th>
              <th className="text-left p-4 font-medium">Products</th>
              <th className="text-left p-4 font-medium">Joined</th>
              <th className="text-right p-4 font-medium">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredMerchants.map((merchant) => (
              <tr
                key={merchant._id}
                ref={merchant._id === highlightId ? highlightRef : undefined}
                className={`border-t hover:bg-muted/50 transition-colors duration-700 ${merchant._id === highlightId ? 'bg-accent/30' : ''}`}
              >
                <td className="p-4">
                  <div>
                    <div className="font-medium">{merchant.companyName || merchant.userId?.name}</div>
                    <div className="text-sm text-muted-foreground">{merchant.userId?.email}</div>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <div className="font-medium">{merchant.userId?.name}</div>
                    <div className="text-sm text-muted-foreground">{merchant.userId?.phone}</div>
                  </div>
                </td>
                <td className="p-4 text-sm">
                  {merchant.products?.length || 0}
                </td>
                <td className="p-4 text-sm">
                  {merchant.createdAt ? new Date(merchant.createdAt).toLocaleDateString() : "-"}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(merchant.userId?._id)}
                      disabled={actionLoading === merchant.userId?._id}
                    >
                      {actionLoading === merchant.userId?._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-600" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredMerchants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('noStoresFound')}</p>
        </div>
      )}
    </div>
  )
}
