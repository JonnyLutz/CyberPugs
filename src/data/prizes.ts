/** Prize / toy strip — slots unlock from successful operator→model send count (see thresholds). */

/** Cumulative sends (each = your message + model reply OK) that unlock toys 1..3. */
export const TOY_MESSAGE_THRESHOLDS = [3, 6, 9] as const

export function prizeCountForOperatorSends(sends: number): number {
  let n = 0
  for (const t of TOY_MESSAGE_THRESHOLDS) {
    if (sends >= t) n += 1
  }
  return Math.min(n, PRIZES_TO_UNLOCK)
}

export const PRIZE_IMAGES = [
  '/media/prizeItem1.png',
  '/media/prizeItem2.png',
  '/media/prizeItem3.png',
] as const

export const PRIZES_TO_UNLOCK = 3

export type PrizeGadget = {
  designation: string
  title: string
  body: string
  specs: string[]
}

/** Fake catalog copy for the prize modal (techno + pug jargon). Index matches PRIZE_IMAGES. */
export const PRIZE_GADGETS: readonly PrizeGadget[] = [
  {
    designation: 'SNORT-ARRAY v0.9β',
    title: 'Phased Wrinkle Collimator',
    body:
      'Deploys a toroidal cute-field across your subnet. Calibrated for operators who type faster than they snack. Side effect: nearby biscuits may experience spontaneous decryption.',
    specs: [
      'Latency: one tail-wag',
      'Certified for zoomie-adjacent workloads',
      'Treat throughput: classified (but optimistic)',
    ],
  },
  {
    designation: 'KIBBLE-CORE / AUX',
    title: 'Dual-Band Snack Harmonic Stabilizer',
    body:
      'Keeps morale packets phase-locked during long comms sessions. Emits a soft amber hum only pugs and their humans can pretend to hear. Not responsible for nap.exe priority inversion.',
    specs: [
      'WRINKLE_HASH offload: enabled',
      'Emergency snort buffer: 847 ms nominal',
      'Compatible with belly-rub protocol 2.x',
    ],
  },
  {
    designation: 'BOSS-KEYCHAIN NODE',
    title: 'Neural Muzzle Attenuator (toy-grade)',
    body:
      'Prototype loot from the deep catalog. Routes good-boy packets through a magenta gate before they hit the public snout interface. Bubbles signed off on the paint job.',
    specs: [
      'Clearance: snack-adjacent',
      'Glow factor: legally distracting',
      'Warranty: void if booped without consent',
    ],
  },
] as const
