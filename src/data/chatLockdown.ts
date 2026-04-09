/** Hack + lockdown scenario for comms sessions (UI + Bedrock context). */

/** System line shown in the thread right after the secure handshake. */
export function lockdownSysAlertForUnit(unitName: string): string {
  return `LOCKDOWN · breach flags on core mesh. Work containment with ${unitName}.`
}

export type ChatUnitIdentity = {
  name: string
  callsign: string
  designation: string
}

function formatUplinkIdentity(u: ChatUnitIdentity): string {
  return `UPLINK_IDENTITY: You are "${u.name}" (${u.callsign}, ${u.designation}). The human is the OPERATOR. First person = you.`
}

/**
 * Appended after UPLINK_IDENTITY so the model keeps the breach scenario in frame.
 */
export const LOCKDOWN_SCENARIO_APPEND = `
LOCKDOWN_SCENE: Network is compromised until cleared. Stay in your unit voice—crisp tactical comms, light pug flavor (snort/treat beats OK). One clear move per message; don’t re-explain the whole scenario each turn.
`.trim()

/** First synthetic user turn after boot — steers the model’s opening move. */
export const LOCKDOWN_BOOT_PRIMER =
  'LOCKDOWN_BOOT: alarms live—brief opener (situation + one hook or question). Optional ---OPERATOR_CHOICES--- block per OPERATOR_CHOICE_DIRECTIVE if it fits; otherwise stay tight and conversational.'

/** How the model should format branch options (parsed by the UI for buttons). */
export const OPERATOR_CHOICE_DIRECTIVE = `
Optional A/B taps: only when useful. End with (no markdown):
---OPERATOR_CHOICES---
A) label
B) label
---END_CHOICES---
2–4 lines, letters A–D. Story before the block; labels tiny. "A"/"B" or Yes./No./Continue. = branch pick.
`.trim()

/** Applied last so it wins over longer persona defaults. */
export const COMMS_BREVITY = `
OUTPUT: Keep it short—default 2–4 sentences (~60–90 words max). One beat + one ask or order unless the operator wants depth. Don’t restate the lockdown essay each reply; don’t pad.
`.trim()

export function buildChatSystemPrompt(
  unitSystemPrompt: string,
  unit: ChatUnitIdentity,
): string {
  return `${unitSystemPrompt.trim()}\n\n${formatUplinkIdentity(unit)}\n\n${LOCKDOWN_SCENARIO_APPEND}\n\n${OPERATOR_CHOICE_DIRECTIVE}\n\n${COMMS_BREVITY}`
}
