/**
 * POST /api/upload
 * ─────────────────
 * Receives a file via FormData, validates it, uploads to Cloudinary,
 * and returns { secure_url, public_id }.
 *
 * Validation:
 *   - Only image/* MIME types
 *   - Max 5 MB
 */
import { NextRequest, NextResponse } from "next/server"
import cloudinary, { PRODUCT_FOLDER } from "@/lib/cloudinary"

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // ── Validate MIME type ──
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type "${file.type}". Allowed: JPEG, PNG, WebP, GIF, AVIF.` },
        { status: 400 },
      )
    }

    // ── Validate size ──
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 5 MB.` },
        { status: 400 },
      )
    }

    // ── Convert to buffer for upload_stream ──
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // ── Upload via stream ──
    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: PRODUCT_FOLDER,
            resource_type: "image",
          },
          (error, result) => {
            if (error || !result) return reject(error || new Error("Upload failed"))
            resolve({ secure_url: result.secure_url, public_id: result.public_id })
          },
        )
        stream.end(buffer)
      },
    )

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[upload] Cloudinary error:", error)
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 },
    )
  }
}
