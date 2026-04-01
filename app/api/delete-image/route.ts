/**
 * POST /api/delete-image
 * ──────────────────────
 * Deletes one or more images from Cloudinary by public_id.
 *
 * Body: { public_id: string } | { public_ids: string[] }
 */
import { NextRequest, NextResponse } from "next/server"
import cloudinary from "@/lib/cloudinary"

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Support single or batch deletion
    const ids: string[] = body.public_ids
      ? body.public_ids
      : body.public_id
        ? [body.public_id]
        : []

    if (ids.length === 0) {
      return NextResponse.json({ error: "No public_id(s) provided" }, { status: 400 })
    }

    // Delete each image (Cloudinary batch limit is 100)
    const results = await Promise.allSettled(
      ids.map((id) =>
        cloudinary.uploader.destroy(id, { resource_type: "image" }),
      ),
    )

    const deleted = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<any>).value)

    const errors = results
      .filter((r) => r.status === "rejected")
      .map((r) => (r as PromiseRejectedResult).reason?.message || "Unknown error")

    return NextResponse.json({ deleted, errors })
  } catch (error: any) {
    console.error("[delete-image] Cloudinary error:", error)
    return NextResponse.json(
      { error: error.message || "Delete failed" },
      { status: 500 },
    )
  }
}
