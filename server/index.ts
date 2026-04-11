import {
  BedrockRuntimeClient,
  ConverseCommand,
} from '@aws-sdk/client-bedrock-runtime'
import express from 'express'
import { assertAllowedModelId, getAllowedModelIds } from './allowedModels.js'

function formatApiError(e: unknown): string {
  if (e && typeof e === 'object' && 'name' in e && 'message' in e) {
    const o = e as { name: string; message: string }
    if (o.message && o.name && o.name !== 'Error') return `${o.name}: ${o.message}`
  }
  if (e instanceof Error) return e.message
  return String(e)
}

const region = process.env.AWS_REGION ?? 'us-east-1'
const port = Number(process.env.PORT ?? 8787)
const maxTokensCap = Number(process.env.MAX_OUTPUT_TOKENS_CAP ?? 8192)
const converseMaxTokens = Math.min(
  Math.max(1, Number(process.env.CONVERSE_MAX_OUTPUT_TOKENS ?? 700)),
  maxTokensCap,
)

const bedrock = new BedrockRuntimeClient({ region })

type ChatMessage = { role: 'user' | 'assistant'; content: string }

type ChatBody = {
  messages: ChatMessage[]
  modelId: string
  systemPrompt?: string
}

function textFromConverseOutput(output: {
  message?: { content?: Array<{ text?: string }> }
}): string {
  const blocks = output.message?.content
  if (!blocks?.length) return ''
  return blocks.map((b) => (typeof b.text === 'string' ? b.text : '')).join('')
}

const app = express()
const corsOrigin = process.env.CORS_ORIGIN?.trim()
if (corsOrigin) {
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', corsOrigin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    if (req.method === 'OPTIONS') {
      res.status(204).end()
      return
    }
    next()
  })
}
app.use(express.json({ limit: '2mb' }))

app.get('/api/config', (_req, res) => {
  res.json({ models: getAllowedModelIds(), region })
})

app.post('/api/chat', async (req, res) => {
  try {
    const body = req.body as ChatBody
    const allowed = getAllowedModelIds()
    assertAllowedModelId(body.modelId, allowed)

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      res.status(400).json({ error: 'messages must be a non-empty array' })
      return
    }

    const messages = body.messages.map((m) => ({
      role: m.role,
      content: [{ text: m.content }],
    }))

    const out = await bedrock.send(
      new ConverseCommand({
        modelId: body.modelId,
        messages,
        system: body.systemPrompt?.trim()
          ? [{ text: body.systemPrompt.trim() }]
          : undefined,
        inferenceConfig: {
          maxTokens: converseMaxTokens,
        },
      }),
    )

    const text = textFromConverseOutput(out.output ?? {})
    res.json({ message: text, stopReason: out.stopReason })
  } catch (e) {
    const message = formatApiError(e)
    console.error(e)
    res.status(500).json({ error: message })
  }
})

app.listen(port, '0.0.0.0', () => {
  console.log(`CyberPugs Bedrock API listening on :${port}  region=${region}`)
})
