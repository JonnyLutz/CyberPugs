import { useEffect, useState } from 'react'
import type { CyberPug } from '../types'
import { ceremonyCoreImage } from '../data/cyberpugs'

type Props = {
  pug: CyberPug
  onClose: () => void
  onEnterChat: () => void
}

const BOOT_LINES = [
  '> handshake: CYBER_PUG_AUTH v3',
  '> verifying treat-clearance… OK',
  '> syncing wrinkle-hash… OK',
  '> calibrating snort resonance… OK',
  '> uplink: STABLE',
]

export function LinkCeremony({ pug, onClose, onEnterChat }: Props) {
  const [phase, setPhase] = useState(0)
  const [linesShown, setLinesShown] = useState(0)

  useEffect(() => {
    const boot = window.setInterval(() => {
      setLinesShown((n) => {
        if (n >= BOOT_LINES.length) {
          window.clearInterval(boot)
          return n
        }
        return n + 1
      })
    }, 420)
    const reveal = window.setTimeout(() => setPhase(1), 2800)
    return () => {
      window.clearInterval(boot)
      window.clearTimeout(reveal)
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="ceremony" role="dialog" aria-modal aria-labelledby="ceremony-title">
      <button
        type="button"
        className="ceremony__backdrop"
        aria-label="Dismiss"
        onClick={onClose}
      />
      <div className="ceremony__grid" aria-hidden />
      <div className="ceremony__content">
        <p className="ceremony__label" id="ceremony-title">
          Neural link sequence
        </p>
        <h2 className={`ceremony__headline ${phase >= 1 ? 'ceremony__headline--on' : ''}`}>
          Link established
        </h2>
        <p className="ceremony__sub">
          {pug.name} · {pug.callsign}
        </p>

        <div className="ceremony__boot" aria-live="polite">
          {BOOT_LINES.slice(0, linesShown).map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <div className={`ceremony__hero ${phase >= 1 ? 'ceremony__hero--on' : ''}`}>
          <div className="ceremony__ring">
            <img src={pug.image} alt="" className="ceremony__pug" />
          </div>
          <div className="ceremony__core-wrap">
            <img src={ceremonyCoreImage} alt="" className="ceremony__core" />
            <p className="ceremony__core-cap">Companion core synced</p>
          </div>
        </div>

        <p className="ceremony__flavor">
          Deploying belly-rub protocols, snack watchlists, and emergency zoomie
          buffers. Your CyberPug is now bound to this session.
        </p>

        <div className="ceremony__actions ceremony__actions--single">
          <button type="button" className="ceremony__btn" onClick={onEnterChat}>
            Open comms channel
          </button>
          <button type="button" className="ceremony__btn-text" onClick={onClose}>
            Cancel · choose another unit
          </button>
        </div>
      </div>
    </div>
  )
}
