import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const truncateAddress = (
  address: string,
  { prefix = 8, suffix = 6 }: { prefix?: number; suffix?: number } = {}
) => {
  return `${address.slice(0, prefix)}•••${address.slice(-suffix)}`
}

export const getEffectiveDomain = (url: string) => {
  try {
    // Create a URL object to parse the URL
    const parsedUrl = new URL(url)

    // Handle localhost explicitly
    if (parsedUrl.hostname === "localhost") {
      return "localhost"
    }

    // Split hostname into parts
    const domainParts = parsedUrl.hostname.split(".")

    // Handle domains with no periods, e.g., localhost, intranet URLs
    if (domainParts.length === 1) {
      return parsedUrl.hostname
    }

    // Handle common TLDs and extract the effective domain (last two parts)
    const effectiveDomain = domainParts.slice(-2).join(".")
    return effectiveDomain
  } catch (error) {
    console.error("Invalid URL:", error)
    return null
  }
}
