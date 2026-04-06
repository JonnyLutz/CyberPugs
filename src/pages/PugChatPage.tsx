import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { cyberpugs } from '../data/cyberpugs'
import { chatScene } from '../data/chatScene'

type ChatLine = {
  id: string
  role: 'sys' | 'user' | 'pug'
  text: string
}

const SEED_MESSAGES: ChatLine[] = [
  { id: 'seed-sys', role: 'sys', text: 'Uplink channel SECURE · Sniff-256 handshake OK' },
  {
    id: 'seed-p1',
    role: 'pug',
    text: '*digital snort* … channel open. Awaiting operator. Treat buffer at 47%.',
  },
]

/** Five live user sends; replies escalate in absurdity each turn. */
const MAX_LIVE_USER_SENDS = 5

function tierReplies(unitName: string, callsign: string): readonly string[] {
  return [
    `*snort* … ${unitName} copies. Unless that was a biscuit offer? Re-send if biscuit.`,
    `Snort² detected. Side note: I’m like 68% nose, 32% main-character energy. Do not audit.`,
    `*wag_pointer.dll missing* … falling back to LEGACY_TAIL_WAG v1. Please stand clear of the cute.`,
    `NEURAL STATUS: “who’s a good unit” packet detected. Firewall says no. Snout says absolutely yes. Deadlock.`,
    `*snort cascade* Fine. ${callsign} signing off. Auth token: SNORT-OPS-REGRET-NOTHING. Deploying nap.exe — bye, human.`,
  ] as const
}

const SESSION_FINALE_SYS =
  'SESSION END · Exchange cap reached. Unit entering mandatory zoomie cooldown + nap partition. Channel closed.'

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

export default function PugChatPage() {
  const { pugId } = useParams<{ pugId: string }>()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatLine[]>(SEED_MESSAGES)
  const [draft, setDraft] = useState('')
  const [liveUserSends, setLiveUserSends] = useState(0)
  const [sessionEnded, setSessionEnded] = useState(false)
  const threadEndRef = useRef<HTMLDivElement>(null)

  const pug = useMemo(() => cyberpugs.find((u) => u.id === pugId), [pugId])

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!pugId || !pug) {
    return <Navigate to="/" replace />
  }

  function sendDraft() {
    if (!pug) return
    if (sessionEnded || liveUserSends >= MAX_LIVE_USER_SENDS) return
    const text = draft.trim()
    if (!text) return

    const next = liveUserSends + 1
    const tiers = tierReplies(pug.name, pug.callsign)
    const pugLine = tiers[next - 1]

    setMessages((prev) => {
      const nextMsgs: ChatLine[] = [
        ...prev,
        { id: newId('u'), role: 'user', text },
        { id: newId('p'), role: 'pug', text: pugLine },
      ]
      if (next >= MAX_LIVE_USER_SENDS) {
        nextMsgs.push({ id: newId('sys'), role: 'sys', text: SESSION_FINALE_SYS })
      }
      return nextMsgs
    })
    setLiveUserSends(next)
    if (next >= MAX_LIVE_USER_SENDS) setSessionEnded(true)
    setDraft('')
  }

  function handleComposerSubmit(e: FormEvent) {
    e.preventDefault()
    sendDraft()
  }

  function handleDraftKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Enter' || e.shiftKey) return
    e.preventDefault()
    sendDraft()
  }

  return (
    <div className="chat-page">
      <header className="chat-page__bar">
        <div className="chat-page__bar-inner">
          <div className="chat-page__unit">
            <p className="chat-page__unit-label">Active uplink</p>
            <h1 className="chat-page__unit-name">{pug.name}</h1>
            <p className="chat-page__unit-callsign">{pug.callsign}</p>
          </div>
          <Link to="/" className="chat-page__back">
            Back to roster
          </Link>
        </div>
      </header>

      <div className="chat-page__body">
        <section className="chat-scene" aria-label="Comms bay visual">
          <div
            className="chat-scene__layer chat-scene__layer--city"
            style={{ backgroundImage: `url(${chatScene.cityAlley})` }}
          />
          <div
            className="chat-scene__layer chat-scene__layer--workshop"
            style={{ backgroundImage: `url(${chatScene.workshop})` }}
          />
          <div className="chat-scene__accent chat-scene__accent--console">
            <img src={chatScene.synthConsole} alt="" />
          </div>
          <div className="chat-scene__accent chat-scene__accent--panel">
            <img src={chatScene.cyanPanel} alt="" />
          </div>
          <div className="chat-scene__accent chat-scene__accent--datapad">
            <img src={chatScene.datapad} alt="" />
          </div>
          <div className="chat-scene__scanlines" aria-hidden />
          <div className="chat-scene__vignette" aria-hidden />
          <div className="chat-scene__grid" aria-hidden />
          <div className="chat-scene__pug">
            <div className="chat-scene__pug-ring">
              <img src={pug.image} alt="" className="chat-scene__pug-img" />
            </div>
            <p className="chat-scene__pug-caption">Neural comms · {pug.designation}</p>
          </div>
        </section>

        <section className="chat-panel" aria-label="Neural chat">
          <div className="chat-panel__chrome">
            <span className="chat-panel__dot" />
            <span className="chat-panel__dot chat-panel__dot--amber" />
            <span className="chat-panel__dot chat-panel__dot--cyan" />
            <span className="chat-panel__title">PUG_COMMS_SESSION</span>
          </div>
          <div className="chat-thread" role="log">
            {messages.map((m) => (
              <div key={m.id} className={`chat-bubble chat-bubble--${m.role}`}>
                <span className="chat-bubble__meta">
                  {m.role === 'sys' ? 'SYSTEM' : m.role === 'user' ? 'YOU' : pug.name}
                </span>
                <p className="chat-bubble__text">{m.text}</p>
              </div>
            ))}
            <div ref={threadEndRef} />
          </div>
          {sessionEnded ? (
            <div className="chat-session-end">
              <p className="chat-session-end__title">Comms closed</p>
              <p className="chat-session-end__text">
                {pug.name} has left to pursue dreams of snacks and unchecked zoomies.
              </p>
              <Link to="/" className="chat-session-end__cta">
                Return to roster
              </Link>
            </div>
          ) : (
            <form className="chat-composer" onSubmit={handleComposerSubmit}>
              <label htmlFor="chat-draft" className="visually-hidden">
                Message
              </label>
              <textarea
                id="chat-draft"
                className="chat-composer__input"
                placeholder="transmit pug-comms"
                rows={2}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleDraftKeyDown}
              />
              <button
                type="submit"
                className="chat-composer__send"
                disabled={!draft.trim()}
              >
                Send
              </button>
            </form>
          )}
          <p className="chat-panel__hint">
            {sessionEnded
              ? 'Session finished — pick another unit anytime.'
              : `Demo uplink: ${liveUserSends}/${MAX_LIVE_USER_SENDS} exchanges before auto-disconnect.`}{' '}
            <button type="button" className="chat-panel__hint-btn" onClick={() => navigate('/')}>
              {sessionEnded ? 'Back to catalog' : 'Return to catalog'}
            </button>
          </p>
        </section>
      </div>
    </div>
  )
}
