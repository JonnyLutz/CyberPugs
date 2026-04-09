import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

/** Time to linger on the Boss Pug reveal before the end screen. */
const CREDITS_DELAY_MS = 9000

export default function BossPugPage() {
  const [showCredits, setShowCredits] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setShowCredits(true), CREDITS_DELAY_MS)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div className="boss-pug-page">
      <div className="boss-pug-page__backdrop" aria-hidden />
      <header className="boss-pug-page__bar">
        <Link to="/" className="boss-pug-page__back">
          Back to roster
        </Link>
      </header>
      <main className="boss-pug-page__main">
        <p className="boss-pug-page__eyebrow">Boss encounter · clearance max</p>
        <h1 className="boss-pug-page__name">Bubbles</h1>
        <p className="boss-pug-page__subtitle">The Boss Pug</p>
        <div className="boss-pug-page__frame">
          <img
            src="/media/bossPug.png"
            alt="Bubbles, the Boss Pug"
            className="boss-pug-page__img"
            width={960}
            height={960}
          />
        </div>
        <p className="boss-pug-page__tagline">The snort echoes through the subnet. You made it.</p>
      </main>

      {showCredits ? (
        <div
          className="boss-pug-credits"
          role="dialog"
          aria-modal="true"
          aria-labelledby="boss-credits-title"
        >
          <div className="boss-pug-credits__scanlines" aria-hidden />
          <div className="boss-pug-credits__inner">
            <p className="boss-pug-credits__glitch" aria-hidden>
              GOOD_BOI_PROTOCOL · COMPLETE
            </p>
            <h2 id="boss-credits-title" className="boss-pug-credits__title">
              CyberPugs 2026
            </h2>
            <p className="boss-pug-credits__sub">Transmission terminated · thanks for playing</p>
            <Link to="/" className="boss-pug-credits__home">
              Return to home
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
