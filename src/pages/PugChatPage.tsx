import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { cyberpugs } from '../data/cyberpugs'
import {
  buildChatSystemPrompt,
  LOCKDOWN_BOOT_PRIMER,
  lockdownSysAlertForUnit,
} from '../data/chatLockdown'
import { chatScene } from '../data/chatScene'
import {
  PRIZE_GADGETS,
  PRIZE_IMAGES,
  PRIZES_TO_UNLOCK,
  prizeCountForOperatorSends,
} from '../data/prizes'
import {
  splitAssistantForDisplay,
  type OperatorChoice,
} from '../utils/operatorChoices'
type ChatLine = {
  id: string
  role: 'sys' | 'user' | 'pug'
  text: string
  choices?: OperatorChoice[]
}

type ApiMsg = { role: 'user' | 'assistant'; content: string }

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

function pugLineFromModelRaw(reply: string): ChatLine {
  const { displayText, choices } = splitAssistantForDisplay(reply)
  return { id: newId('p'), role: 'pug', text: displayText, choices }
}

export default function PugChatPage() {
  const { pugId } = useParams<{ pugId: string }>()
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatLine[]>([])
  const [apiMessages, setApiMessages] = useState<ApiMsg[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modelId, setModelId] = useState<string>('')
  const [prizeCount, setPrizeCount] = useState(0)
  const [celebrateSlot, setCelebrateSlot] = useState<number | null>(null)
  const [showBossModal, setShowBossModal] = useState(false)
  const [prizeModalIndex, setPrizeModalIndex] = useState<number | null>(null)
  const [prizesViewed, setPrizesViewed] = useState<boolean[]>(() =>
    Array.from({ length: PRIZES_TO_UNLOCK }, () => false),
  )
  /** Successful operator sends (submitUserText) that got a model reply — unlocks toys at thresholds. */
  const [operatorSendCount, setOperatorSendCount] = useState(0)
  const threadEndRef = useRef<HTMLDivElement>(null)

  const pug = useMemo(() => cyberpugs.find((u) => u.id === pugId), [pugId])

  const sessionSystemPrompt = useMemo(
    () =>
      pug
        ? buildChatSystemPrompt(pug.systemPrompt, {
            name: pug.name,
            callsign: pug.callsign,
            designation: pug.designation,
          })
        : '',
    [pug],
  )

  const allPrizesUnlocked = prizeCount >= PRIZES_TO_UNLOCK
  const allPrizeDossiersViewed = prizesViewed.every(Boolean)
  const chatBlockedByBossModal = showBossModal

  useEffect(() => {
    if (!allPrizesUnlocked || !allPrizeDossiersViewed) return
    if (prizeModalIndex !== null) return
    if (showBossModal) return
    setShowBossModal(true)
  }, [
    allPrizeDossiersViewed,
    allPrizesUnlocked,
    prizeModalIndex,
    showBossModal,
  ])

  const { branchChoices, showChoiceButtons, showFallbackClicks } = useMemo(() => {
    let lastPugIdx = -1
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'pug') {
        lastPugIdx = i
        break
      }
    }
    const lastPug = lastPugIdx >= 0 ? messages[lastPugIdx] : null
    const ch =
      lastPug?.choices && lastPug.choices.length >= 2 ? lastPug.choices : undefined
    const showCh = Boolean(ch && !loading && !chatBlockedByBossModal && modelId)
    return {
      branchChoices: ch,
      showChoiceButtons: showCh,
      showFallbackClicks: Boolean(
        modelId && !loading && !chatBlockedByBossModal && !showCh,
      ),
    }
  }, [messages, loading, chatBlockedByBossModal, modelId])

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (prizeModalIndex === null) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setPrizeModalIndex(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prizeModalIndex])

  useEffect(() => {
    let cancelled = false
    fetch('/api/config')
      .then((r) => r.json())
      .then((d: { models: string[]; region: string }) => {
        if (cancelled) return
        setModelId(d.models?.[0] ?? '')
        if (!d.models?.[0]) {
          setError(
            'No Bedrock models configured. Set BEDROCK_MODEL_ALLOWLIST in the API server env.',
          )
        }
      })
      .catch(() => {
        if (cancelled) return
        setError('Failed to reach Bedrock API server. Is it running?')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const boot = useCallback(async () => {
    if (!pug) return
    setError(null)
    setLoading(true)
    setPrizeCount(0)
    setOperatorSendCount(0)
    setPrizesViewed(Array.from({ length: PRIZES_TO_UNLOCK }, () => false))
    setShowBossModal(false)
    setCelebrateSlot(null)
    setApiMessages([])
    setMessages([
      { id: newId('sys'), role: 'sys', text: 'Uplink SECURE' },
      { id: newId('sys'), role: 'sys', text: lockdownSysAlertForUnit(pug.name) },
    ])

    const pushLocalOpen = (line: string) => {
      setMessages((prev) => [...prev, { id: newId('p'), role: 'pug', text: line }])
    }

    if (!modelId) {
      pushLocalOpen(
        `${pug.name} on standby — link Bedrock to open comms. Toy box is separate.`,
      )
      setLoading(false)
      return
    }

    const primer = {
      role: 'user' as const,
      content: LOCKDOWN_BOOT_PRIMER,
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId,
          systemPrompt: sessionSystemPrompt,
          messages: [primer],
        }),
      })
      const data = (await res.json()) as { message?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? res.statusText)
      const reply = data.message ?? ''
      setApiMessages([
        { role: 'user', content: primer.content },
        { role: 'assistant', content: reply },
      ])
      setMessages((prev) => [...prev, pugLineFromModelRaw(reply)])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setMessages((prev) => [
        ...prev,
        {
          id: newId('sys'),
          role: 'sys',
          text: 'Uplink failed.',
        },
      ])
      pushLocalOpen(
        `${pug.name} on fallback — retry when Bedrock is up.`,
      )
    } finally {
      setLoading(false)
    }
  }, [modelId, pug, sessionSystemPrompt])

  useEffect(() => {
    if (!pugId || !pug) return
    void boot()
  }, [pugId, modelId, pug, boot])

  const submitUserText = useCallback(
    async (text: string) => {
      if (!pug) return
      if (loading || showBossModal) return
      const trimmed = text.trim()
      if (!trimmed || !modelId) return

      setDraft('')
      setError(null)

      const nextApi: ApiMsg[] = [...apiMessages, { role: 'user', content: trimmed }]
      setApiMessages(nextApi)
      setMessages((prev) => [...prev, { id: newId('u'), role: 'user', text: trimmed }])
      setLoading(true)

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modelId,
            systemPrompt: sessionSystemPrompt,
            messages: nextApi,
          }),
        })
        const data = (await res.json()) as { message?: string; error?: string }
        if (!res.ok) throw new Error(data.error ?? res.statusText)
        const reply = data.message ?? ''
        setApiMessages((prev) => [...prev, { role: 'assistant', content: reply }])
        setMessages((prev) => [...prev, pugLineFromModelRaw(reply)])

        const nextSends = operatorSendCount + 1
        setOperatorSendCount(nextSends)
        const targetPrizes = prizeCountForOperatorSends(nextSends)
        let awardedSlot: number | null = null
        setPrizeCount((prev) => {
          if (targetPrizes > prev) {
            awardedSlot = prev
            return targetPrizes
          }
          return prev
        })
        if (awardedSlot !== null) {
          setCelebrateSlot(awardedSlot)
          window.setTimeout(() => setCelebrateSlot(null), 900)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
        setMessages((prev) => [
          ...prev,
          {
            id: newId('sys'),
            role: 'sys',
            text: 'Send failed — retry.',
          },
        ])
        setApiMessages((prev) => prev.slice(0, -1))
      } finally {
        setLoading(false)
      }
    },
    [
      apiMessages,
      loading,
      modelId,
      operatorSendCount,
      pug,
      sessionSystemPrompt,
      showBossModal,
    ],
  )

  function sendDraft() {
    const t = draft.trim()
    if (!t) return
    void submitUserText(t)
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

  if (!pugId || !pug) {
    return <Navigate to="/" replace />
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

          <div className="chat-toy-box" aria-label="Toy box">
            <div className="chat-toy-box__head">
              <span className="chat-toy-box__title">{"TOY_BOX · who's a good boi?"}</span>
            </div>
            <div className="chat-toy-box__body">
              {allPrizesUnlocked && !allPrizeDossiersViewed ? (
                <p className="chat-toy-box__boss-gate" role="status">
                  Open each toy dossier below (tap unlocked icons) to unlock Boss clearance.
                </p>
              ) : null}
              <div className="chat-prize-strip" aria-label="Toy collection">
                {PRIZE_IMAGES.map((src, i) => {
                  const unlocked = i < prizeCount
                  const viewed = Boolean(prizesViewed[i])
                  const gadget = PRIZE_GADGETS[i]
                  return (
                    <button
                      key={src}
                      type="button"
                      disabled={!unlocked}
                      className={`chat-prize-slot${unlocked ? ' chat-prize-slot--filled chat-prize-slot--interactive' : ''}${unlocked && viewed ? ' chat-prize-slot--viewed' : ''}${unlocked && !viewed ? ' chat-prize-slot--unviewed' : ''}${celebrateSlot === i ? ' chat-prize-slot--celebrate' : ''}`}
                      onClick={() => {
                        if (!unlocked) return
                        setPrizesViewed((prev) => {
                          const next = [...prev]
                          next[i] = true
                          return next
                        })
                        setPrizeModalIndex(i)
                      }}
                      aria-label={
                        unlocked
                          ? `Open toy dossier: ${gadget.title}${viewed ? ' (viewed)' : ' (new)'}`
                          : `Toy slot ${i + 1} sealed`
                      }
                    >
                      {unlocked ? (
                        <img src={src} alt="" className="chat-prize-slot__img" />
                      ) : (
                        <span className="chat-prize-slot__empty" aria-hidden>
                          ?
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
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
            {loading ? (
              <div className="chat-bubble chat-bubble--sys">
                <span className="chat-bubble__meta">SYSTEM</span>
                <p className="chat-bubble__text">Thinking…</p>
              </div>
            ) : null}
            <div ref={threadEndRef} />
          </div>

          {showChoiceButtons ? (
            <div className="chat-choice-area">
              <p className="chat-choice-area__label">Operator response</p>
              <div
                className="chat-choice-row"
                role="group"
                aria-label="Response options from unit"
              >
                {branchChoices!.map((c) => (
                  <button
                    key={c.letter}
                    type="button"
                    className="chat-choice-btn"
                    disabled={loading}
                    onClick={() => void submitUserText(c.letter)}
                  >
                    <span className="chat-choice-btn__letter">{c.letter}</span>
                    <span className="chat-choice-btn__label">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {showFallbackClicks ? (
            <div className="chat-choice-area chat-choice-area--fallback">
              <p className="chat-choice-area__label">Quick response</p>
              <div
                className="chat-choice-row chat-choice-row--binary"
                role="group"
                aria-label="Quick yes, no, or continue"
              >
                <button
                  type="button"
                  className="chat-choice-btn chat-choice-btn--wide"
                  disabled={loading}
                  onClick={() => void submitUserText('Yes.')}
                >
                  <span className="chat-choice-btn__letter" aria-hidden>
                    ✓
                  </span>
                  <span className="chat-choice-btn__label">Yes</span>
                </button>
                <button
                  type="button"
                  className="chat-choice-btn chat-choice-btn--wide"
                  disabled={loading}
                  onClick={() => void submitUserText('No.')}
                >
                  <span className="chat-choice-btn__letter" aria-hidden>
                    ✕
                  </span>
                  <span className="chat-choice-btn__label">No</span>
                </button>
                <button
                  type="button"
                  className="chat-choice-btn chat-choice-btn--wide"
                  disabled={loading}
                  onClick={() => void submitUserText('Continue.')}
                >
                  <span className="chat-choice-btn__letter" aria-hidden>
                    →
                  </span>
                  <span className="chat-choice-btn__label">Continue</span>
                </button>
              </div>
            </div>
          ) : null}

          {modelId && !showBossModal ? (
            <form className="chat-composer" onSubmit={handleComposerSubmit}>
              <label htmlFor="chat-draft" className="visually-hidden">
                Message
              </label>
              <textarea
                id="chat-draft"
                className="chat-composer__input"
                placeholder={loading ? 'Opening uplink…' : 'Transmit to unit…'}
                rows={2}
                value={draft}
                disabled={loading}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleDraftKeyDown}
              />
              <button
                type="submit"
                className="chat-composer__send"
                disabled={!draft.trim() || loading}
              >
                Send
              </button>
            </form>
          ) : null}
          <p className="chat-panel__hint">
            {error ? `Uplink warning: ${error} ` : null}
            <button type="button" className="chat-panel__hint-btn" onClick={() => navigate('/')}>
              Return to catalog
            </button>
          </p>
        </section>
      </div>

      {showBossModal ? (
        <div
          className="cyber-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="boss-modal-title"
        >
          <div className="cyber-modal">
            <h2 id="boss-modal-title" className="cyber-modal__title">
              You scored 3 awesome prizes!
            </h2>
            <p className="cyber-modal__body">
              Clearance spike detected. You have been selected to advance to the Boss Pug.
            </p>
            <button
              type="button"
              className="cyber-modal__cta"
              onClick={() => navigate('/boss-pug')}
            >
              Advance to Boss Pug
            </button>
          </div>
        </div>
      ) : null}

      {prizeModalIndex !== null ? (
        <div
          className="chat-prize-modal-backdrop"
          role="presentation"
          onClick={() => setPrizeModalIndex(null)}
        >
          <div
            className="chat-prize-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="prize-modal-heading"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="chat-prize-modal__close"
              aria-label="Close prize dossier"
              onClick={() => setPrizeModalIndex(null)}
            >
              ×
            </button>
            <p className="chat-prize-modal__sku">{PRIZE_GADGETS[prizeModalIndex].designation}</p>
            <h2 className="chat-prize-modal__title" id="prize-modal-heading">
              {PRIZE_GADGETS[prizeModalIndex].title}
            </h2>
            <div className="chat-prize-modal__visual">
              <img
                src={PRIZE_IMAGES[prizeModalIndex]}
                alt=""
                className="chat-prize-modal__img"
              />
            </div>
            <p className="chat-prize-modal__body">{PRIZE_GADGETS[prizeModalIndex].body}</p>
            <ul className="chat-prize-modal__specs">
              {PRIZE_GADGETS[prizeModalIndex].specs.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <button
              type="button"
              className="chat-prize-modal__dismiss"
              onClick={() => setPrizeModalIndex(null)}
            >
              Close dossier
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
