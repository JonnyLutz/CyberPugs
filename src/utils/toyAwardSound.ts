let sharedCtx: AudioContext | null = null

/**
 * Short cyber-ding on toy unlock. Call from a user gesture (button) so autoplay allows audio.
 */
export function playToyAwardSound(muted: boolean): void {
  if (muted) return
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    if (!sharedCtx) sharedCtx = new AC()
    const ctx = sharedCtx
    if (ctx.state === 'suspended') void ctx.resume()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    const t0 = ctx.currentTime
    osc.frequency.setValueAtTime(740, t0)
    osc.frequency.exponentialRampToValueAtTime(1180, t0 + 0.07)
    gain.gain.setValueAtTime(0.12, t0)
    gain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.32)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t0)
    osc.stop(t0 + 0.34)
  } catch {
    /* ignore */
  }
}
