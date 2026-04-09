/**
 * Default model IDs for us-east-1 — replace with IDs from the Bedrock console
 * (including cross-region inference profile IDs like us.amazon.nova-lite-v1:0).
 * Override at runtime: BEDROCK_MODEL_ALLOWLIST=id1,id2,id3
 */
const DEFAULT_ALLOWLIST = [
  'us.amazon.nova-lite-v1:0',
  'us.amazon.nova-micro-v1:0',
  'amazon.nova-lite-v1:0',
] as const

export function getAllowedModelIds(): string[] {
  const raw = process.env.BEDROCK_MODEL_ALLOWLIST?.trim()
  if (raw) {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return [...DEFAULT_ALLOWLIST]
}

export function assertAllowedModelId(modelId: string, allowed: string[]): void {
  if (!allowed.includes(modelId)) {
    throw new Error(
      `modelId not allowed: ${modelId}. Update BEDROCK_MODEL_ALLOWLIST or server/allowedModels.ts.`,
    )
  }
}
