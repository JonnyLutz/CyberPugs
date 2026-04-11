/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute base URL for the Bedrock Express API (e.g. https://api.example.com). Omit for same-origin /api (dev proxy). */
  readonly VITE_BEDROCK_API_BASE?: string
}
