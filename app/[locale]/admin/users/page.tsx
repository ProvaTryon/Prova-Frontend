"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Search, Pencil, Trash2, Shield, UserIcon } from "lucide-react"
import { Input } from "@/components/ui/input"

interface User {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  accountType: "customer" | "brand"
  joinedDate: string
  orders: number
  status: "active" | "suspended"
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "user",
    accountType: "customer",
    joinedDate: "2024-01-15",
    orders: 12,
    status: "active",
  },
  {
    id: "2",
    name: "Admin User",
    email: "admin@prova.com",
    role: "admin",
    accountType: "customer",
    joinedDate: "2023-12-01",
    orders: 0,
    status: "active",
  },
  {
    id: "3",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    accountType: "customer",
    joinedDate: "2024-02-20",
    orders: 8,
    status: "active",
  },
  {
    id: "4",
    name: "Fashion Brand Co",
    email: "contact@fashionbrand.com",
    role: "user",
    accountType: "brand",
    joinedDate: "2024-01-10",
    orders: 0,
    status: "active",
  },
  {
    id: "5",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    role: "user",
    accountType: "customer",
    joinedDate: "2024-03-05",
    orders: 15,
    status: "active",
  },
]

export default function UsersManagement() {
  const t = useTranslations('admin.users')
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleToggleRole = (userId: string) => {
    setUsers(
      users.map((user) => (user.id === userId ? { ...user, role: user.role === "admin" ? "user" : "admin" } : user)),
    )
  }

  const handleToggleStatus = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: user.status === "active" ? "suspended" : "active" } : user,
      ),
    )
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm(t('deleteConfirm'))) {
      setUsers(users.filter((user) => user.id !== userId))
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-background border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">{t('totalUsers')}</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="bg-background border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">{t('activeUsers')}</p>
          <p className="text-2xl font-bold">{users.filter((u) => u.status === "active").length}</p>
        </div>
        <div className="bg-background border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">{t('customers')}</p>
          <p className="text-2xl font-bold">{users.filter((u) => u.accountType === "customer").length}</p>
        </div>
        <div className="bg-background border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">{t('brands')}</p>
          <p className="text-2xl font-bold">{users.filter((u) => u.accountType === "brand").length}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold">{t('user')}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">{t('accountType')}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">{t('role')}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">{t('orders')}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">{t('joined')}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">{t('status')}</th>
                <th className="text-right px-6 py-4 text-sm font-semibold">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        {user.role === "admin" ? (
                          <Shield className="w-5 h-5 text-primary" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-muted text-xs font-medium rounded capitalize">
                      {user.accountType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleRole(user.id)}
                      className={`px-2 py-1 text-xs font-medium rounded ${user.role === "admin"
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "bg-muted hover:bg-muted/80"
                        }`}
                    >
                      {user.role === "admin" ? t('admin') : t('userRole')}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm">{user.orders}</td>
                  <td className="px-6 py-4 text-sm">{new Date(user.joinedDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className={`px-2 py-1 text-xs font-medium rounded ${user.status === "active"
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-red-50 text-red-700 hover:bg-red-100"
                        }`}
                    >
                      {user.status === "active" ? t('active') : t('suspended')}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors" title={t('actions')}>
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        disabled={user.role === "admin"}
                        title={t('actions')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('noUsersFound')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
