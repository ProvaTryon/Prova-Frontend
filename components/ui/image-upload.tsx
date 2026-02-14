"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, Loader2, AlertCircle, ImagePlus } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

// ── Types ──────────────────────────────────────────
export interface UploadedImage {
  secure_url: string
  public_id: string
}

interface ImageUploadProps {
  /** Current value (single image) */
  value?: UploadedImage | null
  /** Callback when image changes */
  onChange: (image: UploadedImage | null) => void
  /** Label text */
  label?: string
  /** Whether the field is required */
  required?: boolean
  /** Custom class */
  className?: string
}

interface MultiImageUploadProps {
  /** Current values */
  value?: UploadedImage[]
  /** Callback when images change */
  onChange: (images: UploadedImage[]) => void
  /** Label text */
  label?: string
  /** Max number of images */
  maxImages?: number
  /** Custom class */
  className?: string
}

// ── Helpers ────────────────────────────────────────
const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]

function validateFile(file: File): string | null {
  if (!ALLOWED.includes(file.type)) {
    return `Invalid type "${file.type}". Use JPEG, PNG, WebP, GIF, or AVIF.`
  }
  if (file.size > MAX_SIZE) {
    return `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 5 MB.`
  }
  return null
}

async function uploadFile(file: File): Promise<UploadedImage> {
  const form = new FormData()
  form.append("file", file)

  const res = await fetch("/api/upload", { method: "POST", body: form })
  const data = await res.json()

  if (!res.ok) throw new Error(data.error || "Upload failed")
  return data as UploadedImage
}

async function deleteImage(public_id: string): Promise<void> {
  await fetch("/api/delete-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ public_id }),
  })
}

// ═══════════════════════════════════════════════════
// Single Image Upload
// ═══════════════════════════════════════════════════
export function ImageUpload({ value, onChange, label, required, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setUploading(true)
      try {
        // If there's an existing image, delete it first
        if (value?.public_id) {
          await deleteImage(value.public_id)
        }
        const uploaded = await uploadFile(file)
        onChange(uploaded)
      } catch (err: any) {
        setError(err.message || "Upload failed")
      } finally {
        setUploading(false)
      }
    },
    [value, onChange],
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input so same file can be re-selected
    e.target.value = ""
  }

  const handleRemove = async () => {
    if (value?.public_id) {
      try {
        await deleteImage(value.public_id)
      } catch {
        // Silently ignore — image may already be deleted
      }
    }
    onChange(null)
  }

  return (
    <div className={className}>
      {label && (
        <label className="text-sm font-medium leading-none mb-2 block">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      {value?.secure_url ? (
        /* ── Preview ── */
        <div className="relative group w-full aspect-square max-w-[200px] border border-border rounded-md overflow-hidden bg-muted">
          <Image
            src={value.secure_url}
            alt="Uploaded"
            fill
            className="object-cover"
            sizes="200px"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* ── Upload zone ── */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center justify-center w-full aspect-square max-w-[200px] border-2 border-dashed border-border rounded-md hover:border-accent hover:bg-muted/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-muted-foreground mb-2" />
              <span className="text-xs text-muted-foreground">Click to upload</span>
              <span className="text-[10px] text-muted-foreground/60 mt-1">Max 5 MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={handleChange}
        className="hidden"
      />

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive mt-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════
// Multi Image Upload
// ═══════════════════════════════════════════════════
export function MultiImageUpload({
  value = [],
  onChange,
  label,
  maxImages = 5,
  className,
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    async (files: FileList) => {
      setError(null)

      const remaining = maxImages - value.length
      if (remaining <= 0) {
        setError(`Maximum ${maxImages} images allowed.`)
        return
      }

      const toUpload = Array.from(files).slice(0, remaining)

      // Validate all first
      for (const file of toUpload) {
        const err = validateFile(file)
        if (err) {
          setError(err)
          return
        }
      }

      setUploading(true)
      try {
        const results = await Promise.all(toUpload.map(uploadFile))
        onChange([...value, ...results])
      } catch (err: any) {
        setError(err.message || "Upload failed")
      } finally {
        setUploading(false)
      }
    },
    [value, onChange, maxImages],
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files)
    e.target.value = ""
  }

  const handleRemove = async (index: number) => {
    const img = value[index]
    if (img?.public_id) {
      try {
        await deleteImage(img.public_id)
      } catch {
        // Silently ignore
      }
    }
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className={className}>
      {label && (
        <label className="text-sm font-medium leading-none mb-2 block">{label}</label>
      )}

      <div className="flex flex-wrap gap-3">
        {/* Existing previews */}
        {value.map((img, i) => (
          <div
            key={img.public_id || i}
            className="relative group w-24 h-24 border border-border rounded-md overflow-hidden bg-muted"
          >
            <Image
              src={img.secure_url}
              alt={`Image ${i + 1}`}
              fill
              className="object-cover"
              sizes="96px"
            />
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Add button */}
        {value.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-border rounded-md hover:border-accent hover:bg-muted/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <ImagePlus className="w-5 h-5 text-muted-foreground mb-1" />
                <span className="text-[10px] text-muted-foreground">Add</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        multiple
        onChange={handleChange}
        className="hidden"
      />

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive mt-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
