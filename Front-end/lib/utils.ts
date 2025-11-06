import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats image URL to be compatible with next/image component
 * @param imageUrl - The image URL to format
 * @param fallback - Fallback image URL if the original is invalid
 * @returns Properly formatted image URL
 */
export function formatImageUrl(imageUrl: string | null | undefined, fallback: string = "/placeholder.jpg"): string {
  if (!imageUrl || imageUrl === "/" || imageUrl === "") return fallback
  
  // If it's already an absolute URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  
  // Nếu là đường dẫn file từ backend upload (/uploads/...), thêm base URL của backend
  if (imageUrl.includes('/uploads/')) {
    // Backend API đang chạy trên port 5000 (instructor API - nơi upload file)
    return `https://localhost:5000${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
  }
  
  // If it's a relative path, ensure it starts with /
  return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
}
