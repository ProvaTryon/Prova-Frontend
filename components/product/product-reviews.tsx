"use client"

import { useState, useEffect } from "react"
import {
    Star, Loader2, Send, MessageSquare, User,
    Heart, Reply, Pencil, Trash2, MoreHorizontal,
    ChevronDown, ChevronUp, X, Check
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useTranslations } from "next-intl"
import * as reviewService from "@/lib/review-service"
import { motion, AnimatePresence } from "framer-motion"

// ─── Types ───
interface ReplyType {
    _id: string
    user: { _id: string; name: string }
    comment: string
    createdAt?: string
}

interface Review {
    _id: string
    user: { _id: string; name: string }
    product: { _id: string; name: string }
    rating: number
    comment?: string
    likes: string[]
    replies: ReplyType[]
    createdAt: string
    updatedAt: string
}

interface ProductReviewsProps {
    productId: string
}

// ─── Interactive Star Rating ───
function StarRating({
    value,
    onChange,
    size = 28,
    readOnly = false,
}: {
    value: number
    onChange?: (val: number) => void
    size?: number
    readOnly?: boolean
}) {
    const [hoverValue, setHoverValue] = useState<number | null>(null)
    const displayValue = hoverValue ?? value

    const handleClick = (starIndex: number, isHalf: boolean) => {
        if (readOnly || !onChange) return
        const newValue = isHalf ? starIndex + 0.5 : starIndex + 1
        onChange(newValue)
    }

    return (
        <div className="flex items-center gap-0.5" onMouseLeave={() => !readOnly && setHoverValue(null)}>
            {[0, 1, 2, 3, 4].map((starIndex) => {
                const fillLevel =
                    displayValue >= starIndex + 1
                        ? 1
                        : displayValue >= starIndex + 0.5
                            ? 0.5
                            : 0

                return (
                    <div
                        key={starIndex}
                        className={`relative ${readOnly ? '' : 'cursor-pointer'}`}
                        style={{ width: size, height: size }}
                    >
                        <Star
                            className="absolute inset-0 text-muted-foreground/30"
                            style={{ width: size, height: size }}
                        />
                        {fillLevel > 0 && (
                            <div
                                className="absolute inset-0 overflow-hidden"
                                style={{ width: `${fillLevel * 100}%` }}
                            >
                                <Star
                                    className="fill-amber-400 text-amber-400"
                                    style={{ width: size, height: size }}
                                />
                            </div>
                        )}
                        {!readOnly && (
                            <>
                                <div
                                    className="absolute inset-0 w-1/2"
                                    onMouseEnter={() => setHoverValue(starIndex + 0.5)}
                                    onClick={() => handleClick(starIndex, true)}
                                />
                                <div
                                    className="absolute inset-0 left-1/2 w-1/2"
                                    onMouseEnter={() => setHoverValue(starIndex + 1)}
                                    onClick={() => handleClick(starIndex, false)}
                                />
                            </>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

// ─── Rating label helper ───
function getRatingLabel(rating: number, t: (key: string) => string): string {
    if (rating <= 1) return t("poor")
    if (rating <= 2) return t("fair")
    if (rating <= 3) return t("good")
    if (rating <= 4) return t("veryGood")
    return t("excellent")
}

// ─── Time-ago helper ───
function timeAgo(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (seconds < 60) return "just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    const months = Math.floor(days / 30)
    if (months < 12) return `${months}mo ago`
    return `${Math.floor(months / 12)}y ago`
}

// ─────────────────────────────────────────────
// ─── Single Review Card ───
// ─────────────────────────────────────────────
function ReviewCard({
    review,
    userId,
    isAuthenticated,
    onUpdate,
    t,
}: {
    review: Review
    userId?: string
    isAuthenticated: boolean
    onUpdate: () => void
    t: (key: string) => string
}) {
    const isOwner = userId === review.user._id
    const hasLiked = userId ? review.likes.includes(userId) : false

    const [showMenu, setShowMenu] = useState(false)
    const [editing, setEditing] = useState(false)
    const [editRating, setEditRating] = useState(review.rating)
    const [editComment, setEditComment] = useState(review.comment || "")
    const [saving, setSaving] = useState(false)

    const [showReplies, setShowReplies] = useState(false)
    const [replyText, setReplyText] = useState("")
    const [replyingOpen, setReplyingOpen] = useState(false)
    const [submittingReply, setSubmittingReply] = useState(false)

    const [liking, setLiking] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)

    // ─── Handlers ───
    const handleLike = async () => {
        if (!isAuthenticated || !userId || liking) return
        setLiking(true)
        try {
            await reviewService.toggleLike(review._id, userId)
            onUpdate()
        } catch (err) {
            console.error("Like failed:", err)
        } finally {
            setLiking(false)
        }
    }

    const handleDelete = async () => {
        if (deleting) return
        setDeleting(true)
        try {
            await reviewService.deleteReview(review._id)
            onUpdate()
        } catch (err) {
            console.error("Delete failed:", err)
        } finally {
            setDeleting(false)
            setConfirmDelete(false)
        }
    }

    const handleSaveEdit = async () => {
        if (saving) return
        setSaving(true)
        try {
            await reviewService.updateReview(review._id, {
                rating: editRating,
                comment: editComment,
            })
            setEditing(false)
            onUpdate()
        } catch (err) {
            console.error("Update failed:", err)
        } finally {
            setSaving(false)
        }
    }

    const handleAddReply = async () => {
        if (!userId || !replyText.trim() || submittingReply) return
        setSubmittingReply(true)
        try {
            await reviewService.addReply(review._id, userId, replyText.trim())
            setReplyText("")
            setReplyingOpen(false)
            setShowReplies(true)
            onUpdate()
        } catch (err) {
            console.error("Reply failed:", err)
        } finally {
            setSubmittingReply(false)
        }
    }

    const handleDeleteReply = async (replyId: string) => {
        try {
            await reviewService.deleteReply(review._id, replyId)
            onUpdate()
        } catch (err) {
            console.error("Delete reply failed:", err)
        }
    }

    return (
        <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center shrink-0 text-sm font-semibold text-foreground/70">
                    {review.user.name?.charAt(0)?.toUpperCase() || <User className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{review.user.name}</h4>
                            <span className="text-[11px] text-muted-foreground">{timeAgo(review.createdAt)}</span>
                        </div>

                        {/* Owner menu */}
                        {isOwner && !editing && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="p-1 rounded-lg hover:bg-muted transition-colors"
                                >
                                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                </button>
                                <AnimatePresence>
                                    {showMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 top-8 z-10 bg-popover border border-border rounded-xl shadow-lg overflow-hidden min-w-[140px]"
                                        >
                                            <button
                                                onClick={() => {
                                                    setEditing(true)
                                                    setEditRating(review.rating)
                                                    setEditComment(review.comment || "")
                                                    setShowMenu(false)
                                                }}
                                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                                {t("editReview")}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setConfirmDelete(true)
                                                    setShowMenu(false)
                                                }}
                                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                {t("deleteReview")}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* ─── Edit Mode ─── */}
                    {editing ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4 mt-2"
                        >
                            <div className="flex items-center gap-3">
                                <StarRating value={editRating} onChange={setEditRating} size={24} />
                                {editRating > 0 && (
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                        {editRating} — {getRatingLabel(editRating, t)}
                                    </span>
                                )}
                            </div>
                            <textarea
                                value={editComment}
                                onChange={(e) => setEditComment(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all resize-none"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={saving || editRating === 0}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-foreground text-background rounded-lg text-xs font-medium hover:bg-foreground/90 disabled:opacity-40 transition-colors"
                                >
                                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                    {t("save")}
                                </button>
                                <button
                                    onClick={() => setEditing(false)}
                                    className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg text-xs hover:bg-muted transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                    {t("cancel")}
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <>
                            {/* Stars */}
                            <div className="mb-2">
                                <StarRating value={review.rating} readOnly size={16} />
                            </div>

                            {/* Comment */}
                            {review.comment && (
                                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                    {review.comment}
                                </p>
                            )}

                            {/* ─── Actions bar (Like, Reply, Replies count) ─── */}
                            <div className="flex items-center gap-4 mt-2">
                                {/* Like button */}
                                <button
                                    onClick={handleLike}
                                    disabled={!isAuthenticated || liking}
                                    className={`flex items-center gap-1.5 text-xs transition-colors ${hasLiked
                                        ? "text-rose-500"
                                        : "text-muted-foreground hover:text-rose-500"
                                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                                >
                                    <Heart className={`w-4 h-4 ${hasLiked ? "fill-rose-500" : ""}`} />
                                    <span>{review.likes.length > 0 ? review.likes.length : ""}</span>
                                    {review.likes.length === 0 && <span>{t("like")}</span>}
                                </button>

                                {/* Reply button */}
                                {isAuthenticated && (
                                    <button
                                        onClick={() => setReplyingOpen(!replyingOpen)}
                                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <Reply className="w-4 h-4" />
                                        {t("reply")}
                                    </button>
                                )}

                                {/* Toggle replies */}
                                {review.replies.length > 0 && (
                                    <button
                                        onClick={() => setShowReplies(!showReplies)}
                                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
                                    >
                                        {showReplies ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                        {review.replies.length} {review.replies.length === 1 ? t("replyCount") : t("repliesCount")}
                                    </button>
                                )}
                            </div>
                        </>
                    )}

                    {/* ─── Delete Confirmation ─── */}
                    <AnimatePresence>
                        {confirmDelete && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 p-3 bg-destructive/5 border border-destructive/20 rounded-xl"
                            >
                                <p className="text-sm text-destructive mb-2">{t("deleteConfirm")}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive text-destructive-foreground rounded-lg text-xs font-medium disabled:opacity-50"
                                    >
                                        {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                        {t("confirmYes")}
                                    </button>
                                    <button
                                        onClick={() => setConfirmDelete(false)}
                                        className="px-3 py-1.5 border border-border rounded-lg text-xs hover:bg-muted transition-colors"
                                    >
                                        {t("cancel")}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ─── Reply Input ─── */}
                    <AnimatePresence>
                        {replyingOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-3"
                            >
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleAddReply()}
                                        placeholder={t("replyPlaceholder")}
                                        className="flex-1 px-3 py-2 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all placeholder:text-muted-foreground"
                                    />
                                    <button
                                        onClick={handleAddReply}
                                        disabled={!replyText.trim() || submittingReply}
                                        className="px-3 py-2 bg-foreground text-background rounded-xl text-sm disabled:opacity-40 transition-colors hover:bg-foreground/90"
                                    >
                                        {submittingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ─── Replies List ─── */}
                    <AnimatePresence>
                        {showReplies && review.replies.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                className="mt-4 space-y-3 border-l-2 border-border pl-4"
                            >
                                {review.replies.map((reply) => {
                                    const isReplyOwner = userId === reply.user?._id
                                    return (
                                        <motion.div
                                            key={reply._id}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-start gap-3 group"
                                        >
                                            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 text-[11px] font-semibold text-muted-foreground">
                                                {reply.user?.name?.charAt(0)?.toUpperCase() || "?"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium">{reply.user?.name}</span>
                                                    {reply.createdAt && (
                                                        <span className="text-[10px] text-muted-foreground">{timeAgo(reply.createdAt)}</span>
                                                    )}
                                                    {isReplyOwner && (
                                                        <button
                                                            onClick={() => handleDeleteReply(reply._id)}
                                                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 transition-all"
                                                            title={t("deleteReply")}
                                                        >
                                                            <Trash2 className="w-3 h-3 text-destructive" />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground leading-relaxed">{reply.comment}</p>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// ─── Main Component ───
// ─────────────────────────────────────────────
export function ProductReviews({ productId }: ProductReviewsProps) {
    const t = useTranslations("productDetail")
    const { user, isAuthenticated } = useAuth()
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({ rating: 0, comment: "" })

    useEffect(() => {
        fetchReviews()
    }, [productId])

    const fetchReviews = async () => {
        try {
            setLoading(true)
            const data = await reviewService.getProductReviews(productId)
            const list: Review[] = Array.isArray(data) ? data : data.reviews || []
            // Ensure likes & replies always exist
            setReviews(list.map((r) => ({ ...r, likes: r.likes || [], replies: r.replies || [] })))
        } catch (err) {
            console.error("Failed to fetch reviews:", err)
            setReviews([])
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isAuthenticated) { setError(t("signInToReview")); return }
        if (formData.rating === 0) { setError(t("selectRating")); return }

        try {
            setSubmitting(true)
            setError("")
            await reviewService.addReview({
                user: user?.id,
                product: productId,
                rating: formData.rating,
                comment: formData.comment,
            })
            setFormData({ rating: 0, comment: "" })
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
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0

    const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => Math.round(r.rating) === star).length,
    }))

    return (
        <div className="space-y-6">
            {/* ─── Summary Card ─── */}
            <div className="bg-card border border-border rounded-2xl p-8">
                <h3 className="font-serif text-2xl font-medium mb-8">{t("customerReviews")}</h3>

                <div className="flex flex-col md:flex-row gap-10">
                    {/* Left: Average */}
                    <div className="flex flex-col items-center text-center min-w-[160px]">
                        <div className="text-5xl font-bold tracking-tight mb-2">
                            {averageRating > 0 ? averageRating.toFixed(1) : "\u2014"}
                        </div>
                        <StarRating value={averageRating} readOnly size={22} />
                        <p className="text-sm text-muted-foreground mt-2">
                            {reviews.length} {t("reviews")}
                        </p>
                    </div>

                    {/* Middle: Distribution Bars */}
                    <div className="flex-1 space-y-2">
                        {ratingCounts.map(({ star, count }) => {
                            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                            return (
                                <div key={star} className="flex items-center gap-3 text-sm">
                                    <span className="w-8 text-right text-muted-foreground font-medium">{star}</span>
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                                    <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="h-full bg-amber-400 rounded-full"
                                        />
                                    </div>
                                    <span className="w-8 text-muted-foreground">{count}</span>
                                </div>
                            )
                        })}
                    </div>

                    {/* Right: Write Review CTA */}
                    <div className="flex flex-col items-center justify-center min-w-[180px]">
                        {isAuthenticated ? (
                            !showForm && (
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setShowForm(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl text-sm font-medium hover:bg-foreground/90 transition-colors"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    {t("writeAReview")}
                                </motion.button>
                            )
                        ) : (
                            <div className="text-center text-sm text-muted-foreground">
                                <a href="/auth" className="text-foreground font-medium hover:underline">
                                    {t("signInToReview")}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Write Review Form ─── */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -12, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -12, height: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="bg-card border border-border rounded-2xl p-8">
                            <h4 className="font-serif text-xl font-medium mb-6">{t("writeAReview")}</h4>

                            <form onSubmit={handleSubmitReview} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-3">{t("rating")}</label>
                                    <div className="flex items-center gap-4">
                                        <StarRating
                                            value={formData.rating}
                                            onChange={(val) => setFormData({ ...formData, rating: val })}
                                            size={36}
                                        />
                                        {formData.rating > 0 && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full"
                                            >
                                                {formData.rating} — {getRatingLabel(formData.rating, t)}
                                            </motion.span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        {t("comment")} <span className="text-muted-foreground font-normal">({t("optional")})</span>
                                    </label>
                                    <textarea
                                        value={formData.comment}
                                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all resize-none placeholder:text-muted-foreground"
                                        placeholder={t("writeYourReview")}
                                    />
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-3 bg-destructive/10 text-destructive rounded-xl text-sm"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <div className="flex gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={submitting || formData.rating === 0}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-foreground text-background rounded-xl text-sm font-medium hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                                    </motion.button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false)
                                            setFormData({ rating: 0, comment: "" })
                                            setError("")
                                        }}
                                        className="px-6 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition-colors"
                                    >
                                        {t("cancel")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Reviews List ─── */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                    <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground">{t("noReviews")}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review, idx) => (
                        <motion.div
                            key={review._id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                        >
                            <ReviewCard
                                review={review}
                                userId={user?.id}
                                isAuthenticated={isAuthenticated}
                                onUpdate={fetchReviews}
                                t={t}
                            />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
