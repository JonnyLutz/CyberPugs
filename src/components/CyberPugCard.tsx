import type { CyberPug } from '../types'

type Props = {
  pug: CyberPug
  onSelect: (pug: CyberPug) => void
}

export function CyberPugCard({ pug, onSelect }: Props) {
  return (
    <article className="cyber-card">
      <div className="cyber-card__frame">
        <img
          src={pug.image}
          alt=""
          className="cyber-card__photo"
          loading="lazy"
          width={400}
          height={500}
        />
        <div className="cyber-card__scan" aria-hidden />
      </div>
      <div className="cyber-card__body">
        <header className="cyber-card__header">
          <p className="cyber-card__designation">{pug.designation}</p>
          <h2 className="cyber-card__name">{pug.name}</h2>
          <p className="cyber-card__callsign">{pug.callsign}</p>
        </header>
        <dl className="cyber-card__attrs">
          {pug.attributes.map((a) => (
            <div key={a.label} className="cyber-card__row">
              <dt>{a.label}</dt>
              <dd>{a.value}</dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          className="cyber-card__cta"
          onClick={() => onSelect(pug)}
        >
          Sync this snoot
        </button>
      </div>
    </article>
  )
}
