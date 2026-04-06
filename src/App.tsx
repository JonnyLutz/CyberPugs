import { useState } from 'react'
import { CyberPugCard } from './components/CyberPugCard'
import { LinkCeremony } from './components/LinkCeremony'
import { cyberpugs, heroBackdrop } from './data/cyberpugs'
import type { CyberPug } from './types'
import './App.css'

function App() {
  const [linked, setLinked] = useState<CyberPug | null>(null)

  return (
    <div className="app">
      {linked ? (
        <LinkCeremony pug={linked} onClose={() => setLinked(null)} />
      ) : null}

      <header className="hero">
        <div
          className="hero__bg"
          style={{ backgroundImage: `url(${heroBackdrop})` }}
          role="presentation"
        />
        <div className="hero__veil" />
        <div className="hero__inner">
          <p className="hero__eyebrow">Classified cute · Clearance: squeaky</p>
          <h1 className="hero__title">CyberPugs</h1>
          <p className="hero__lede">
            Pick your augmented companion. Every unit ships with premium wrinkle
            density, questionable firewall etiquette, and glow-in-the-dark loyalty.
          </p>
          <p className="hero__prompt">
            Choose your CyberPug below — then watch the neural handshake fire up.
          </p>
        </div>
      </header>

      <main className="catalog">
        <div className="catalog__head">
          <h2 className="catalog__title">Active roster</h2>
          <p className="catalog__meta">{cyberpugs.length} units online</p>
        </div>
        <div className="catalog__grid">
          {cyberpugs.map((pug) => (
            <CyberPugCard key={pug.id} pug={pug} onSelect={setLinked} />
          ))}
        </div>
      </main>

      <footer className="foot">
        <p>CyberPugs · Speculative snuggle tech. No pugs were debugged against their will.</p>
      </footer>
    </div>
  )
}

export default App
