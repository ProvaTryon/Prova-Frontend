/**
 * ☁️ Cloudinary Configuration (Server-side only)
 * ================================================
 * Centralized Cloudinary config — imported ONLY by API routes.
 * Never import this file from client components.
 */
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export default cloudinary

/** Folder used for all product images */
export const PRODUCT_FOLDER = "prova/products"
