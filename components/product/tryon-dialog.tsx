"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { Upload, Loader2, Download, AlertCircle, Check } from "lucide-react"
import { useTranslations } from "next-intl"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { fetchProfile, updateProfile } from "@/lib/profile-service"
import { fetchLatestMeasurements, refreshMeasurementsFromProfile } from "@/lib/measurement-service"
import {
  processTryOnAndSave,
  urlToFile,
  revokeObjectURL,
  processVton360TryOnAndSave,
  getVtonModel,
  getOotdCategory,
  validateImageFile,
} from "@/lib/vton-service"
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
  productId: string
  productImage: string
  productName: string
  productCategory?: string
  productType?: string
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

function getErrorMessage(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const maybeMessage = (error as { message?: unknown }).message
    return typeof maybeMessage === "string" ? maybeMessage : undefined
  }

  return undefined
}

export function TryOnDialog({
  open,
  onOpenChange,
  productId,
  productImage,
  productName,
  productCategory,
  productType,
}: TryOnDialogProps) {
  const t = useTranslations("productDetail")
  const { logout } = useAuth()
  const { toast } = useToast()

  const [step, setStep] = useState<Step>("loading")
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null)
  const [savedSideImageUrl, setSavedSideImageUrl] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [uploadedSideFile, setUploadedSideFile] = useState<File | null>(null)
  const [sideUploadPreview, setSideUploadPreview] = useState<string | null>(null)
  const [saveToProfile, setSaveToProfile] = useState(true)
  const [refreshMeasurementsNow, setRefreshMeasurementsNow] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  // Clean up blob URLs on unmount / close
  useEffect(() => {
    if (!open) {
      return () => {
        if (resultUrl) revokeObjectURL(resultUrl)
        if (uploadPreview) revokeObjectURL(uploadPreview)
        if (sideUploadPreview) revokeObjectURL(sideUploadPreview)
      }
    }
  }, [open, resultUrl, uploadPreview, sideUploadPreview])

  // Reset state and fetch profile when dialog opens
  useEffect(() => {
    if (!open) return

    setStep("loading")
    setUploadedFile(null)
    setUploadPreview(null)
    setUploadedSideFile(null)
    setSideUploadPreview(null)
    setResultUrl(null)
    setError(null)
    setSaveToProfile(true)
    setRefreshMeasurementsNow(false)

    const loadProfile = async () => {
      try {
        const profile = await fetchProfile()
        if (profile.tryonImage) {
          setSavedImageUrl(profile.tryonImage)
          setSavedSideImageUrl(profile.tryonSideImage || null)
          setStep("saved")
        } else {
          setSavedImageUrl(null)
          setSavedSideImageUrl(null)
          setStep("upload")
        }
      } catch (err: unknown) {
        const message = getErrorMessage(err)?.toLowerCase() || ""
        // Auth error → token expired/invalid — block the entire flow
        if (message.includes("401") || message.includes("unauthorized") || message.includes("expired")) {
          logout()
          setError(t("tryOn.loginRequired"))
          setStep("auth-error")
          return
        }
        // Other errors (network, etc.) → still allow upload
        setSavedImageUrl(null)
        setSavedSideImageUrl(null)
        setStep("upload")
      }
    }

    loadProfile()
  }, [open, logout, t])

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

  const handleSideFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
    setUploadedSideFile(file)
    const preview = URL.createObjectURL(file)
    setSideUploadPreview(preview)
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

    const model = getVtonModel(productCategory, productType, productName)
    // VTON360 pipeline is much slower (Colab inference) — allow 10 min
    const timeoutMs = model === 'vton360' ? 600_000 : 120_000

    abortRef.current = new AbortController()
    const timer = setTimeout(() => abortRef.current?.abort(), timeoutMs)

    try {
      const garmentFile = await urlToFile(productImage, `garment.jpg`)
      const signal = abortRef.current.signal
      let result: string
      if (model === 'vton360') {
        const saved = await processVton360TryOnAndSave(personFile, garmentFile, {
          signal,
          productId,
          productName,
          productImage,
          garmentCategory: productCategory,
        })
        result = saved.resultImageUrl
      } else {
        const saved = await processTryOnAndSave(personFile, garmentFile, {
          category: getOotdCategory(productCategory, productType, productName),
          signal,
          productId,
          productName,
          productImage,
          garmentCategory: productCategory,
        })
        result = saved.resultImageUrl
      }
      setResultUrl(result)
      setStep("result")
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setError(t("tryOn.timeout"))
      } else {
        setError(sanitizeError(getErrorMessage(err)) || t("tryOn.processingFailed"))
      }
      setStep(savedImageUrl ? "saved" : "upload")
    } finally {
      clearTimeout(timer)
      abortRef.current = null
    }
  }, [productCategory, productId, productImage, productName, productType, savedImageUrl, t])

  const handleUseSavedImage = useCallback(async () => {
    if (!savedImageUrl) return
    try {
      const file = await urlToFile(savedImageUrl, "person.jpg")
      await runTryOn(file)
    } catch (err: unknown) {
      setError(sanitizeError(getErrorMessage(err)) || t("tryOn.processingFailed"))
    }
  }, [savedImageUrl, runTryOn, t])

  const handleSubmitUpload = useCallback(async () => {
    if (!uploadedFile) return

    try {
      // Save to profile if checkbox is checked
      if (saveToProfile) {
        if (!uploadedSideFile) {
          setError(t("tryOn.sideImageRequired") || "Please upload a side profile image to save measurements.")
          return
        }

        try {
          const [frontCloudUrl, sideCloudUrl] = await Promise.all([
            uploadToCloudinary(uploadedFile),
            uploadToCloudinary(uploadedSideFile),
          ])

          await updateProfile({
            tryonImage: frontCloudUrl,
            tryonSideImage: sideCloudUrl,
          })
          setSavedImageUrl(frontCloudUrl)
          setSavedSideImageUrl(sideCloudUrl)

          // Do not re-run measurements when one already exists unless the user asks for it.
          const latestMeasurement = await fetchLatestMeasurements().catch(() => null)
          const shouldRefreshMeasurements = refreshMeasurementsNow || !latestMeasurement

          if (shouldRefreshMeasurements) {
            refreshMeasurementsFromProfile({ engine: "shapy" }).catch(() => {
              toast({
                title: t("tryOn.measurementRefreshFailed") || "Size recommendation update failed",
                description: t("tryOn.measurementRefreshFailedDesc") || "Please retry from your profile later.",
                variant: "destructive",
              })
            })
          }
        } catch {
          // Profile save failed (e.g. expired token) — continue with try-on anyway
        }
      }

      await runTryOn(uploadedFile)
    } catch (err: unknown) {
      setError(sanitizeError(getErrorMessage(err)) || t("tryOn.uploadFailed"))
    }
  }, [refreshMeasurementsNow, runTryOn, saveToProfile, t, toast, uploadedFile, uploadedSideFile])

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
            {!savedSideImageUrl && (
              <p className="text-xs text-amber-600 text-center">
                {t("tryOn.sideImageMissing") || "Add a side profile image while saving a new photo to unlock size recommendations."}
              </p>
            )}
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

            {saveToProfile && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {t("tryOn.sideImageHint") || "A side profile photo is required to generate accurate size recommendations."}
                </p>
                <div className="relative aspect-[3/4] max-h-64 mx-auto border-2 border-dashed border-border rounded-lg overflow-hidden bg-muted hover:border-primary transition-colors">
                  {sideUploadPreview ? (
                    <Image src={sideUploadPreview} alt="Uploaded side profile" fill className="object-cover" />
                  ) : (
                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                      <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                      <p className="text-sm font-medium">
                        {t("tryOn.sideClickToUpload") || "Click to upload side profile photo"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{t("tryOn.fileRequirements")}</p>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleSideFileSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {sideUploadPreview && (
                  <button
                    onClick={() => {
                      if (sideUploadPreview) revokeObjectURL(sideUploadPreview)
                      setUploadedSideFile(null)
                      setSideUploadPreview(null)
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground underline"
                  >
                    {t("tryOn.removeSidePhoto") || "Remove side photo"}
                  </button>
                )}

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={refreshMeasurementsNow}
                    onChange={(e) => setRefreshMeasurementsNow(e.target.checked)}
                    className="rounded border-border"
                  />
                  {t("tryOn.recalculateMeasurementsNow") || "Recalculate body measurements now"}
                </label>
              </div>
            )}

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
