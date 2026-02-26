"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Loader2, Trash2, Edit2, Star } from "lucide-react"
import { useTranslations } from "next-intl"
import * as reviewService from "@/lib/review-service"

interface Review {
    _id: string
    user: {
        _id: string
        name: string
    }
    product: {
        _id: string
        name: string
        image: string
    }
    rating: number
    comment?: string
    createdAt: string
    updatedAt: string
}

export default function ReviewsPage() {
    const t = useTranslations("reviews")
    const { user, isAuthenticated } = useAuth()
    const router = useRouter()
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingData, setEditingData] = useState({ rating: 5, comment: "" })

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/auth")
            return
        }

        fetchUserReviews()
    }, [isAuthenticated, router, user?.id])

    const fetchUserReviews = async () => {
        try {
            setLoading(true)
            setError("")
            if (!user?.id) throw new Error("User ID not found")

            const data = await reviewService.getUserReviews(user.id)
            setReviews(Array.isArray(data) ? data : data.reviews || [])
        } catch (err) {
            console.error("Failed to fetch reviews:", err)
            setError("Failed to load your reviews")
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (review: Review) => {
        setEditingId(review._id)
        setEditingData({
            rating: review.rating,
            comment: review.comment || "",
        })
    }

    const handleSaveEdit = async (reviewId: string) => {
        try {
            setError("")
            await reviewService.updateReview(reviewId, editingData)
            setEditingId(null)
            fetchUserReviews()
        } catch (err) {
            setError("Failed to update review")
        }
    }

    const handleDelete = async (reviewId: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return

        try {
            setError("")
            await reviewService.deleteReview(reviewId)
            fetchUserReviews()
        } catch (err) {
            setError("Failed to delete review")
        }
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="font-serif text-4xl font-medium mb-8">{t("myReviews")}</h1>

                    {error && (
                        <div className="mb-8 p-4 bg-destructive/10 text-destructive rounded-lg">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-20">
                            <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground mb-4">{t("noReviews")}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <div key={review._id} className="border border-border rounded-lg p-6">
                                    {/* Product Info */}
                                    <div className="flex gap-4 mb-4">
                                        <img
                                            src={review.product.image}
                                            alt={review.product.name}
                                            className="w-20 h-20 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-medium">{review.product.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {editingId === review._id ? (
                                        // Edit Mode
                                        <div className="space-y-4 border-t border-border pt-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">{t("rating")}</label>
                                                <select
                                                    value={editingData.rating}
                                                    onChange={(e) =>
                                                        setEditingData({ ...editingData, rating: parseInt(e.target.value) })
                                                    }
                                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                >
                                                    <option value="1">1 - Poor</option>
                                                    <option value="2">2 - Fair</option>
                                                    <option value="3">3 - Good</option>
                                                    <option value="4">4 - Very Good</option>
                                                    <option value="5">5 - Excellent</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">{t("comment")}</label>
                                                <textarea
                                                    value={editingData.comment}
                                                    onChange={(e) =>
                                                        setEditingData({ ...editingData, comment: e.target.value })
                                                    }
                                                    rows={4}
                                                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder={t("writeYourReview")}
                                                />
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleSaveEdit(review._id)}
                                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                                                >
                                                    {t("save")}
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
                                                >
                                                    {t("cancel")}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // View Mode
                                        <>
                                            {/* Rating */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="flex gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < review.rating
                                                                    ? "fill-yellow-400 text-yellow-400"
                                                                    : "text-muted-foreground"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm font-medium">{review.rating}.0</span>
                                            </div>

                                            {/* Comment */}
                                            {review.comment && (
                                                <p className="text-sm text-muted-foreground mb-4">{review.comment}</p>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-2 pt-4 border-t border-border">
                                                <button
                                                    onClick={() => handleEdit(review)}
                                                    className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    {t("edit")}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(review._id)}
                                                    className="flex items-center gap-2 px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    {t("delete")}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
