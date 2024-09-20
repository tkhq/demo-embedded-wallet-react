import { SiteConfig } from "@/types"

import { env } from "@/env.mjs"

const baseUrl = env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000"

export const siteConfig: SiteConfig = {
  name: "Demo Embedded Wallet",
  author: "turnkey",
  description:
    "A comprehensive demo showcasing how to build an embedded wallet using Turnkey.",
  keywords: [
    "Turnkey",
    "Web3",
    "Next.js",
    "React",
    "Tailwind CSS",
    "Radix UI",
    "shadcn/ui",
  ],
  url: {
    base: baseUrl,
    author: "https://turnkey.io",
  },
  links: {
    github: "https://github.com/tkhq/demo-embedded-wallet",
  },
  ogImage: `${baseUrl}/og.jpg`,
}
