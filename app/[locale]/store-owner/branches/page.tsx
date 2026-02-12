"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Search, Plus, Edit, Trash2, MapPin, Phone, User, Loader2, Building2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import * as branchService from "@/lib/branch-service"

interface Branch {
    _id: string
    name: string
    address: string
    phone: string
    manager: string
    createdAt?: string
}

export default function MerchantBranchesPage() {
    const t = useTranslations('storeOwner.branches')
    const [branches, setBranches] = useState<Branch[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        phone: "",
        manager: "",
    })
    const [formLoading, setFormLoading] = useState(false)

    useEffect(() => {
        loadBranches()
    }, [])

    const loadBranches = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await branchService.getAllBranches()
            console.log("Branches loaded:", data)
            setBranches(data || [])
        } catch (error: any) {
            console.error("Failed to load branches:", error)
            setError(error.message || "Failed to load branches")
            setBranches([])
        } finally {
            setLoading(false)
        }
    }

    const filteredBranches = branches.filter(
        (branch) =>
            branch.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            branch.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            branch.manager?.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const handleAddBranch = () => {
        setEditingBranch(null)
        setFormData({
            name: "",
            address: "",
            phone: "",
            manager: "",
        })
        setIsModalOpen(true)
    }

    const handleEditBranch = (branch: Branch) => {
        setEditingBranch(branch)
        setFormData({
            name: branch.name,
            address: branch.address,
            phone: branch.phone,
            manager: branch.manager,
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.address || !formData.phone || !formData.manager) {
            alert(t('allFieldsRequired'))
            return
        }

        try {
            setFormLoading(true)

            if (editingBranch) {
                // Update existing branch
                const updatedBranch = await branchService.updateBranch(editingBranch._id, formData)
                setBranches(branches.map(b =>
                    b._id === editingBranch._id ? { ...b, ...formData } : b
                ))
            } else {
                // Create new branch
                const newBranch = await branchService.createBranch(formData)
                setBranches([...branches, newBranch])
            }

            setIsModalOpen(false)
            setEditingBranch(null)
        } catch (error: any) {
            console.error("Failed to save branch:", error)
            alert(error.message || "Failed to save branch")
        } finally {
            setFormLoading(false)
        }
    }

    const handleDelete = async (branchId: string) => {
        if (!confirm(t('deleteConfirm'))) {
            return
        }

        try {
            setActionLoading(branchId)
            await branchService.deleteBranch(branchId)
            setBranches(branches.filter(b => b._id !== branchId))
        } catch (error: any) {
            console.error("Failed to delete branch:", error)
            alert(error.message || "Failed to delete branch")
        } finally {
            setActionLoading(null)
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
                    onClick={loadBranches}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                    {t('tryAgain')}
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
                <Button onClick={handleAddBranch} className="gap-2">
                    <Plus className="w-4 h-4" />
                    {t('addBranch')}
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-background border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">{t('totalBranches')}</p>
                    <p className="text-2xl font-bold">{branches.length}</p>
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

            {/* Branches Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBranches.map((branch) => (
                    <div key={branch._id} className="bg-background border border-border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{branch.name}</h3>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditBranch(branch)}
                                    disabled={actionLoading === branch._id}
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(branch._id)}
                                    disabled={actionLoading === branch._id}
                                >
                                    {actionLoading === branch._id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span>{branch.address}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="w-4 h-4" />
                                <span>{branch.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="w-4 h-4" />
                                <span>{branch.manager}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredBranches.length === 0 && (
                <div className="text-center py-12">
                    <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">{t('noBranchesFound')}</h3>
                    <p className="text-muted-foreground mb-4">
                        {searchQuery ? t('tryAdjusting') : t('getStarted')}
                    </p>
                    {!searchQuery && (
                        <Button onClick={handleAddBranch}>
                            <Plus className="w-4 h-4 mr-2" />
                            {t('addBranch')}
                        </Button>
                    )}
                </div>
            )}

            {/* Branch Form Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingBranch ? t('editBranch') : t('addBranch')}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('branchName')}</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder={t('branchNamePlaceholder')}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">{t('address')}</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder={t('addressPlaceholder')}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">{t('phone')}</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder={t('phonePlaceholder')}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="manager">{t('manager')}</Label>
                            <Input
                                id="manager"
                                value={formData.manager}
                                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                                placeholder={t('managerPlaceholder')}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                                disabled={formLoading}
                            >
                                {t('cancel')}
                            </Button>
                            <Button type="submit" disabled={formLoading}>
                                {formLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t('saving')}
                                    </>
                                ) : (
                                    t('save')
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
