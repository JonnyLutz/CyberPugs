export type OperatorChoice = {
  letter: string
  label: string
}

export const CHOICE_BLOCK_START = '---OPERATOR_CHOICES---'
export const CHOICE_BLOCK_END = '---END_CHOICES---'

/**
 * Parse "A) label" lines inside the choice block (letters A–D).
 */
function parseChoiceLines(block: string): OperatorChoice[] {
  const out: OperatorChoice[] = []
  for (const line of block.split('\n')) {
    const t = line.trim()
    if (!t) continue
    const m = t.match(/^([A-D])\)\s*(.+)$/i)
    if (m) out.push({ letter: m[1].toUpperCase(), label: m[2].trim() })
  }
  return out
}

/**
 * Split model output into thread display text + optional choices for buttons.
 * Full `raw` must still be sent in API message history for the model.
 */
export function splitAssistantForDisplay(raw: string): {
  displayText: string
  choices: OperatorChoice[] | undefined
} {
  const startIdx = raw.lastIndexOf(CHOICE_BLOCK_START)
  const endIdx = raw.lastIndexOf(CHOICE_BLOCK_END)
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    return { displayText: raw.trim(), choices: undefined }
  }

  const inner = raw.slice(startIdx + CHOICE_BLOCK_START.length, endIdx).trim()
  const parsed = parseChoiceLines(inner)
  const choices = parsed.length >= 2 ? parsed : undefined

  const before = raw.slice(0, startIdx).trimEnd()
  const after = raw.slice(endIdx + CHOICE_BLOCK_END.length).trimStart()
  let displayText = [before, after].filter(Boolean).join('\n\n').trim()
  if (!displayText) displayText = raw.trim()

  return { displayText, choices }
}
