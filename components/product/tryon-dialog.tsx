"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { Upload, Loader2, Download, AlertCircle, Check } from "lucide-react"
import { useTranslations } from "next-intl"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { fetchProfile, updateProfile } from "@/lib/profile-service"
import { processTryOn, urlToFile, revokeObjectURL, processVton360TryOn, getVtonModel, validateImageFile } from "@/lib/vton-service"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface TryOnDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productImage: string
  productName: string
  productCategory?: string
}

type Step = "loading" | "upload" | "saved" | "processing" | "result" | "auth-error"

/** Strip HTML/ngrok error pages and return a short user-friendly message */
function sanitizeError(msg?: string): string {
  if (!msg) return ""
  if (msg.includes("<!DOCTYPE") || msg.includes("<html")) {
    return "AI service is currently unavailable. Please try again later."
  }
  // Trim excessively long messages
  if (msg.length > 200) return msg.slice(0, 200) + "…"
  return msg
}

export function TryOnDialog({ open, onOpenChange, productImage, productName, productCategory }: TryOnDialogProps) {
  const t = useTranslations("productDetail")
  const { user, logout } = useAuth()
  const { toast } = useToast()

  const [step, setStep] = useState<Step>("loading")
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [saveToProfile, setSaveToProfile] = useState(true)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  // Clean up blob URLs on unmount / close
  useEffect(() => {
    if (!open) {
      return () => {
        if (resultUrl) revokeObjectURL(resultUrl)
        if (uploadPreview) revokeObjectURL(uploadPreview)
      }
    }
  }, [open, resultUrl, uploadPreview])

  // Reset state and fetch profile when dialog opens
  useEffect(() => {
    if (!open) return

    setStep("loading")
    setUploadedFile(null)
    setUploadPreview(null)
    setResultUrl(null)
    setError(null)
    setSaveToProfile(true)

    const loadProfile = async () => {
      try {
        const profile = await fetchProfile()
        if (profile.tryonImage) {
          setSavedImageUrl(profile.tryonImage)
          setStep("saved")
        } else {
          setSavedImageUrl(null)
          setStep("upload")
        }
      } catch (err: any) {
        // Auth error → token expired/invalid — block the entire flow
        if (err.message?.includes("401") || err.message?.toLowerCase().includes("unauthorized") || err.message?.toLowerCase().includes("expired")) {
          logout()
          setError(t("tryOn.loginRequired"))
          setStep("auth-error")
          return
        }
        // Other errors (network, etc.) → still allow upload
        setSavedImageUrl(null)
        setStep("upload")
      }
    }

    loadProfile()
  }, [open])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError(t("tryOn.fileTooLarge"))
      return
    }

    try {
      validateImageFile(file)
    } catch {
      setError(t("tryOn.invalidFileType") || "Invalid file type. Please upload JPEG, PNG, or WebP.")
      return
    }

    setError(null)
    setUploadedFile(file)
    const preview = URL.createObjectURL(file)
    setUploadPreview(preview)
  }, [t])

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const form = new FormData()
    form.append("file", file)
    const res = await fetch("/api/upload?type=user", { method: "POST", body: form })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Upload failed")
    return data.secure_url as string
  }

  const runTryOn = useCallback(async (personFile: File) => {
    setStep("processing")
    setError(null)

    const model = getVtonModel(productCategory)
    // VTON360 pipeline is much slower (Colab inference) — allow 10 min
    const timeoutMs = model === 'vton360' ? 600_000 : 120_000

    abortRef.current = new AbortController()
    const timer = setTimeout(() => abortRef.current?.abort(), timeoutMs)

    try {
      const garmentFile = await urlToFile(productImage, `garment.jpg`)
      const signal = abortRef.current.signal
      let result: string
      if (model === 'vton360') {
        result = await processVton360TryOn(personFile, garmentFile, signal)
      } else {
        result = await processTryOn(personFile, garmentFile, { category: 1, signal })
      }
      setResultUrl(result)
      setStep("result")
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError(t("tryOn.timeout"))
      } else {
        setError(sanitizeError(err.message) || t("tryOn.processingFailed"))
      }
      setStep(savedImageUrl ? "saved" : "upload")
    } finally {
      clearTimeout(timer)
      abortRef.current = null
    }
  }, [productImage, productCategory, savedImageUrl, t])

  const handleUseSavedImage = useCallback(async () => {
    if (!savedImageUrl) return
    try {
      const file = await urlToFile(savedImageUrl, "person.jpg")
      await runTryOn(file)
    } catch (err: any) {
      setError(sanitizeError(err.message) || t("tryOn.processingFailed"))
    }
  }, [savedImageUrl, runTryOn, t])

  const handleSubmitUpload = useCallback(async () => {
    if (!uploadedFile) return

    try {
      // Save to profile if checkbox is checked
      if (saveToProfile) {
        try {
          const cloudUrl = await uploadToCloudinary(uploadedFile)
          await updateProfile({ tryonImage: cloudUrl })
          setSavedImageUrl(cloudUrl)
        } catch {
          // Profile save failed (e.g. expired token) — continue with try-on anyway
        }
      }

      await runTryOn(uploadedFile)
    } catch (err: any) {
      setError(sanitizeError(err.message) || t("tryOn.uploadFailed"))
    }
  }, [uploadedFile, saveToProfile, runTryOn, t])

  const handleDownload = useCallback(() => {
    if (!resultUrl) return
    const link = document.createElement("a")
    link.href = resultUrl
    link.download = `tryon-${productName.replace(/\s+/g, "-")}-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [resultUrl, productName])

  const handleClose = useCallback(() => {
    abortRef.current?.abort()
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {step === "result" ? t("tryOn.resultTitle") : t("tryOn.title")}
          </DialogTitle>
        </DialogHeader>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="line-clamp-3">{error}</p>
          </div>
        )}

        {/* Auth error — expired token */}
        {step === "auth-error" && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground text-center">
              {t("tryOn.loginRequired")}
            </p>
            <Button
              onClick={handleClose}
              className="w-full py-3 rounded-md"
            >
              {t("tryOn.close")}
            </Button>
          </div>
        )}

        {/* Loading */}
        {step === "loading" && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Saved image step */}
        {step === "saved" && savedImageUrl && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("tryOn.savedImageFound")}</p>
            <div className="relative aspect-[3/4] max-h-64 mx-auto overflow-hidden rounded-lg bg-muted">
              <Image src={savedImageUrl} alt="Saved photo" fill className="object-cover" />
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleUseSavedImage}
                className="w-full py-3 rounded-md"
              >
                <Check className="w-4 h-4" />
                {t("tryOn.useSavedImage")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep("upload")}
                className="w-full py-3 rounded-md"
              >
                {t("tryOn.uploadNew")}
              </Button>
            </div>
          </div>
        )}

        {/* Upload step */}
        {step === "upload" && (
          <div className="space-y-4">
            <div className="relative aspect-[3/4] max-h-64 mx-auto border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted hover:border-primary transition-colors">
              {uploadPreview ? (
                <Image src={uploadPreview} alt="Uploaded photo" fill className="object-cover" />
              ) : (
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                  <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">{t("tryOn.clickToUpload")}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("tryOn.fileRequirements")}</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {uploadPreview && (
              <button
                onClick={() => {
                  if (uploadPreview) revokeObjectURL(uploadPreview)
                  setUploadedFile(null)
                  setUploadPreview(null)
                }}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                {t("tryOn.removePhoto")}
              </button>
            )}

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={saveToProfile}
                onChange={(e) => setSaveToProfile(e.target.checked)}
                className="rounded border-border"
              />
              {t("tryOn.saveForFuture")}
            </label>

            <Button
              onClick={handleSubmitUpload}
              disabled={!uploadedFile}
              className="w-full py-3 rounded-md"
            >
              {t("tryOn.startTryOn")}
            </Button>

            {savedImageUrl && (
              <button
                onClick={() => setStep("saved")}
                className="w-full text-sm text-muted-foreground hover:text-foreground underline text-center"
              >
                {t("tryOn.backToSaved")}
              </button>
            )}
          </div>
        )}

        {/* Processing step */}
        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground text-center">{t("tryOn.processingMessage")}</p>
          </div>
        )}

        {/* Result step */}
        {step === "result" && resultUrl && (
          <div className="space-y-4">
            <div className="relative aspect-[3/4] max-h-80 mx-auto overflow-hidden rounded-lg bg-muted">
              <Image src={resultUrl} alt="Try-on result" fill className="object-cover" />
              <div className="absolute top-3 right-3 px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                {t("tryOn.aiGenerated")}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleDownload}
                className="w-full py-3 rounded-md"
              >
                <Download className="w-4 h-4" />
                {t("tryOn.downloadResult")}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (resultUrl) revokeObjectURL(resultUrl)
                  setResultUrl(null)
                  setStep(savedImageUrl ? "saved" : "upload")
                }}
                className="w-full py-3 rounded-md"
              >
                {t("tryOn.tryAgain")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
