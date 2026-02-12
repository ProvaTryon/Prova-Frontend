"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface User {
    _id: string
    name: string
    email: string
    phone?: string
    address?: string
    birth_date?: string
    role: "user" | "admin" | "merchant" | "cs"
    isActive: boolean
}

interface UserEditModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (userId: string, userData: Partial<User>) => Promise<void>
    user: User | null
}

export function UserEditModal({ isOpen, onClose, onSubmit, user }: UserEditModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        birth_date: "",
        role: "user" as User["role"],
        isActive: true,
        password: "", // Optional - only if user wants to change password
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || "",
                birth_date: user.birth_date ? user.birth_date.split("T")[0] : "",
                role: user.role || "user",
                isActive: user.isActive ?? true,
                password: "", // Reset password field
            })
            setError(null)
        }
    }, [user, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        // Validate required fields
        if (!formData.name || formData.name.length < 3) {
            setError("Name must be at least 3 characters")
            return
        }
        if (!formData.email) {
            setError("Email is required")
            return
        }
        if (!formData.phone || formData.phone.length < 10) {
            setError("Phone must be at least 10 characters")
            return
        }
        if (!formData.address || formData.address.length < 5) {
            setError("Address must be at least 5 characters")
            return
        }
        if (!formData.birth_date) {
            setError("Birth date is required")
            return
        }
        // Check if user is at least 13 years old
        const birthDate = new Date(formData.birth_date)
        const today = new Date()
        const thirteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate())
        if (birthDate > thirteenYearsAgo) {
            setError("User must be at least 13 years old")
            return
        }
        if (formData.password && formData.password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }
        if (!formData.password) {
            setError("Password is required to update user (backend requirement)")
            return
        }

        setLoading(true)
        setError(null)

        try {
            // Backend requires ALL fields due to full validation schema
            // Send complete user data with all required fields
            const updateData: any = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                birth_date: new Date(formData.birth_date).toISOString(), // Convert to ISO format
                role: formData.role,
                isActive: formData.isActive,
                password: formData.password, // Required by backend
            }

            console.log('📤 Sending update data:', updateData);

            await onSubmit(user._id, updateData)
            onClose()
        } catch (err: any) {
            setError(err.message || "Failed to update user")
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-semibold">Edit User</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-muted rounded-lg transition-colors"
                        disabled={loading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            minLength={3}
                            maxLength={50}
                        />
                    </div>

                    <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                            minLength={10}
                            placeholder="Enter phone number (min 10 characters)"
                        />
                    </div>

                    <div>
                        <Label htmlFor="address">Address *</Label>
                        <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            required
                            minLength={5}
                            placeholder="Enter address (min 5 characters)"
                        />
                    </div>

                    <div>
                        <Label htmlFor="birth_date">Birth Date *</Label>
                        <Input
                            id="birth_date"
                            type="date"
                            value={formData.birth_date}
                            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                            required
                            max={new Date(new Date().getFullYear() - 13, new Date().getMonth(), new Date().getDate()).toISOString().split("T")[0]}
                        />
                        <p className="text-xs text-muted-foreground mt-1">User must be at least 13 years old</p>
                    </div>

                    <div>
                        <Label htmlFor="password">New Password *</Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength={6}
                            placeholder="Enter new password (min 6 characters)"
                        />
                        <p className="text-xs text-amber-600 mt-1">⚠️ Backend requires password - this will change the user's password</p>
                    </div>

                    <div>
                        <Label htmlFor="role">Role</Label>
                        <select
                            id="role"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as User["role"] })}
                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                            disabled={user?.role === "admin"} // Prevent changing admin role
                        >
                            <option value="user">User</option>
                            <option value="merchant">Merchant</option>
                            <option value="cs">Customer Service</option>
                            <option value="admin">Admin</option>
                        </select>
                        {user?.role === "admin" && (
                            <p className="text-xs text-muted-foreground mt-1">Admin role cannot be changed</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-4 h-4 rounded border-input"
                            disabled={user?.role === "admin"} // Prevent deactivating admin
                        />
                        <Label htmlFor="isActive" className="cursor-pointer">
                            Account Active
                        </Label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
