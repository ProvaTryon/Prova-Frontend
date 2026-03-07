"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Search, Pencil, Trash2, Shield, UserIcon, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { UserEditModal } from "@/components/admin/user-edit-modal"
import * as userService from "@/lib/user-service"

interface User {
  _id: string
  name: string
  email: string
  phone?: string
  address?: string
  birth_date?: string
  role: "user" | "admin" | "merchant" | "cs"
  isActive: boolean
  lastLogin?: string
  createdAt?: string
}

export default function UsersManagement() {
  const t = useTranslations('admin.users')
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await userService.getAllUsers()
      setUsers(data || [])
    } catch (error: any) {
      console.error("Failed to load users:", error)
      setError(error.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())

    if (!activeFilter) return matchesSearch

    let matchesFilter = false
    switch (activeFilter) {
      case "total":
        matchesFilter = true
        break
      case "active":
        matchesFilter = user.isActive
        break
      case "user":
        matchesFilter = user.role === "user"
        break
      case "merchant":
        matchesFilter = user.role === "merchant"
        break
      case "cs":
        matchesFilter = user.role === "cs"
        break
      case "admin":
        matchesFilter = user.role === "admin"
        break
      default:
        matchesFilter = true
    }

    return matchesSearch && matchesFilter
  })

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditModalOpen(true)
  }

  const handleUpdateUser = async (userId: string, userData: Partial<User>) => {
    await userService.updateUser(userId, userData)
    // Update local state with new data
    setUsers(users.map((u) =>
      u._id === userId ? { ...u, ...userData } : u
    ))
  }

  const handleToggleStatus = async (userId: string) => {
    const user = users.find(u => u._id === userId)
    if (!user) return

    try {
      setActionLoading(userId)
      const newIsActive = !user.isActive
      await userService.updateUser(userId, { isActive: newIsActive })
      setUsers(users.map((u) =>
        u._id === userId ? { ...u, isActive: newIsActive } : u
      ))
    } catch (error: any) {
      console.error("Failed to update user status:", error)
      alert(error.message || "Failed to update user status")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u._id === userId)
    if (user?.role === "admin") {
      alert("Cannot delete admin users")
      return
    }

    if (confirm(t('deleteConfirm'))) {
      try {
        setActionLoading(userId)
        await userService.deleteUser(userId)
        setUsers(users.filter((u) => u._id !== userId))
      } catch (error) {
        console.error("Failed to delete user:", error)
        alert("Failed to delete user")
      } finally {
        setActionLoading(null)
      }
    }
  }

  const getRoleStyle = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-50 text-red-700"
      case "merchant":
        return "bg-blue-50 text-blue-700"
      case "cs":
        return "bg-purple-50 text-purple-700"
      default:
        return "bg-muted"
    }
  }

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
          onClick={loadUsers}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    )
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div
          onClick={() => setActiveFilter(activeFilter === "total" ? null : "total")}
          className={`bg-background border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${activeFilter === "total" ? "border-primary ring-2 ring-primary/20" : "border-border"
            }`}
        >
          <p className="text-sm text-muted-foreground mb-1">{t('totalUsers')}</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div
          onClick={() => setActiveFilter(activeFilter === "active" ? null : "active")}
          className={`bg-background border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${activeFilter === "active" ? "border-primary ring-2 ring-primary/20" : "border-border"
            }`}
        >
          <p className="text-sm text-muted-foreground mb-1">{t('activeUsers')}</p>
          <p className="text-2xl font-bold">{users.filter((u) => u.isActive).length}</p>
        </div>
        <div
          onClick={() => setActiveFilter(activeFilter === "user" ? null : "user")}
          className={`bg-background border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${activeFilter === "user" ? "border-primary ring-2 ring-primary/20" : "border-border"
            }`}
        >
          <p className="text-sm text-muted-foreground mb-1">Users</p>
          <p className="text-2xl font-bold">{users.filter((u) => u.role === "user").length}</p>
        </div>
        <div
          onClick={() => setActiveFilter(activeFilter === "merchant" ? null : "merchant")}
          className={`bg-background border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${activeFilter === "merchant" ? "border-primary ring-2 ring-primary/20" : "border-border"
            }`}
        >
          <p className="text-sm text-muted-foreground mb-1">Merchants</p>
          <p className="text-2xl font-bold">{users.filter((u) => u.role === "merchant").length}</p>
        </div>
        <div
          onClick={() => setActiveFilter(activeFilter === "cs" ? null : "cs")}
          className={`bg-background border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${activeFilter === "cs" ? "border-primary ring-2 ring-primary/20" : "border-border"
            }`}
        >
          <p className="text-sm text-muted-foreground mb-1">Customer Service</p>
          <p className="text-2xl font-bold">{users.filter((u) => u.role === "cs").length}</p>
        </div>
        <div
          onClick={() => setActiveFilter(activeFilter === "admin" ? null : "admin")}
          className={`bg-background border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${activeFilter === "admin" ? "border-primary ring-2 ring-primary/20" : "border-border"
            }`}
        >
          <p className="text-sm text-muted-foreground mb-1">Admins</p>
          <p className="text-2xl font-bold">{users.filter((u) => u.role === "admin").length}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold">{t('user')}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">{t('role')}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">{t('joined')}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">{t('status')}</th>
                <th className="text-right px-6 py-4 text-sm font-semibold">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-b border-border last:border-0 hover:bg-muted/30">
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
                    <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${getRoleStyle(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(user._id)}
                      disabled={actionLoading === user._id || user.role === "admin"}
                      className={`px-2 py-1 text-xs font-medium rounded ${user.isActive
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "bg-red-50 text-red-700 hover:bg-red-100"
                        } disabled:opacity-50`}
                    >
                      {actionLoading === user._id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        user.isActive ? t('active') : t('suspended')
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                        disabled={actionLoading === user._id}
                        title="Edit user"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors disabled:opacity-50"
                        disabled={user.role === "admin" || actionLoading === user._id}
                        title="Delete user"
                      >
                        {actionLoading === user._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
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

      {/* User Edit Modal */}
      <UserEditModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedUser(null)
        }}
        onSubmit={handleUpdateUser}
        user={selectedUser}
      />
    </div>
  )
}
