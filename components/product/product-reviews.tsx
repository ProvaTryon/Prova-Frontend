"use client"

import { useState, useEffect } from "react"
import { Star, Loader2, Send } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
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
    }
    rating: number
    comment?: string
    createdAt: string
    updatedAt: string
}

interface ProductReviewsProps {
    productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
    const t = useTranslations("productDetail")
    const { user, isAuthenticated } = useAuth()
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        rating: 5,
        comment: "",
    })

    useEffect(() => {
        fetchReviews()
    }, [productId])

    const fetchReviews = async () => {
        try {
            setLoading(true)
            const data = await reviewService.getProductReviews(productId)
            setReviews(Array.isArray(data) ? data : data.reviews || [])
        } catch (err) {
            console.error("Failed to fetch reviews:", err)
            setReviews([])
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isAuthenticated) {
            setError("Please sign in to leave a review")
            return
        }

        try {
            setSubmitting(true)
            setError("")

            await reviewService.addReview({
                product: productId,
                rating: formData.rating,
                comment: formData.comment,
            })

            setFormData({ rating: 5, comment: "" })
            setShowForm(false)
            fetchReviews()
        } catch (err: any) {
            setError(err.message || "Failed to submit review")
        } finally {
            setSubmitting(false)
        }
    }

    const averageRating =
        reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 0

    return (
        <div className="space-y-8">
            {/* Reviews Summary */}
            <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-serif text-2xl font-medium mb-6">{t("customerReviews")}</h3>

                <div className="flex items-start gap-8 mb-8">
                    {/* Rating Stats */}
                    <div className="flex-shrink-0">
                        <div className="text-4xl font-bold mb-2">{averageRating}</div>
                        <div className="flex gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-5 h-5 ${i < Math.round(parseFloat(averageRating as any))
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-muted-foreground"
                                        }`}
                                />
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground">{reviews.length} {t("reviews")}</p>
                    </div>

                    {/* Write Review Button */}
                    {isAuthenticated && (
                        <div className="flex-1">
                            {!showForm ? (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    {t("writeAReview")}
                                </button>
                            ) : (
                                <form onSubmit={handleSubmitReview} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">{t("rating")}</label>
                                        <select
                                            value={formData.rating}
                                            onChange={(e) =>
                                                setFormData({ ...formData, rating: parseInt(e.target.value) })
                                            }
                                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="1">1 - {t("poor")}</option>
                                            <option value="2">2 - {t("fair")}</option>
                                            <option value="3">3 - {t("good")}</option>
                                            <option value="4">4 - {t("veryGood")}</option>
                                            <option value="5">5 - {t("excellent")}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">{t("comment")} ({t("optional")})</label>
                                        <textarea
                                            value={formData.comment}
                                            onChange={(e) =>
                                                setFormData({ ...formData, comment: e.target.value })
                                            }
                                            rows={4}
                                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Share your experience with this product..."
                                        />
                                    </div>

                                    {error && (
                                        <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    {t("loading")}
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    {t("submitReview")}
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowForm(false)}
                                            className="px-6 py-2 border border-border rounded-lg hover:bg-muted"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>

                {!isAuthenticated && (
                    <div className="mb-6 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
                        <a href="/login" className="text-primary hover:underline">
                            Sign in
                        </a>{" "}
                        to write a review
                    </div>
                )}
            </div>

            {/* Reviews List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    No reviews yet. Be the first to review!
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review._id} className="border border-border rounded-lg p-4">
                            {/* Review Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="font-medium">{review.user.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Rating */}
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
                            </div>

                            {/* Review Comment */}
                            {review.comment && (
                                <p className="text-sm text-muted-foreground">{review.comment}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
