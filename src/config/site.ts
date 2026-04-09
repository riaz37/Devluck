export const siteConfig = {
  name: "Naseeb",
  description: "A modern web application",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
} as const;

export type SiteConfig = typeof siteConfig;
