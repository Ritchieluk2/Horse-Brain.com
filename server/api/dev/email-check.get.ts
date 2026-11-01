// GET /api/dev/email-check   (only exists under `npm run dev`)
// Diagnoses email setup WITHOUT revealing the API key: compares a
// fingerprint of the key the server is actually using with the one
// written in .env, and asks Resend whether it accepts the key.
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { emailKeyFingerprint, sendEmail } from '../../utils/email'

const fingerprint = async (v?: string) => {
  if (v == null) return null
  return {
    length: v.length,
    startsWithRe: v.startsWith('re_'),
    // The first 3 characters are the public "re_" prefix, not part of the secret
    prefix: [...v.slice(0, 3)].map(c => `${JSON.stringify(c)} (U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')})`),
    last4: v.slice(-4),
    hasSpacesOrQuotes: /[\s"'`]/.test(v),
    hash: (await sha256Hex(v)).slice(0, 10)
  }
}

export default defineEventHandler(async (event) => {
  if (!import.meta.dev) throw createError({ statusCode: 404 })

  // What the running server sees
  const rc = useRuntimeConfig(event)
  const fromRuntimeConfig = (rc.resendApiKey as string) || ''
  const fromProcessEnv = process.env.RESEND_API_KEY
  const inUse = fromRuntimeConfig || fromProcessEnv || ''

  // What the .env file on disk says
  let fromFile: string | undefined
  try {
    const raw = await readFile(resolve(process.cwd(), '.env'), 'utf8')
    const line = raw.split(/\r?\n/).find(l => /^\s*RESEND_API_KEY\s*=/.test(l))
    fromFile = line?.replace(/^\s*RESEND_API_KEY\s*=\s*/, '').trim().replace(/^(['"])(.*)\1$/, '$2')
  } catch { /* no .env */ }

  // Ask Resend. A sending-only key gets 401 "restricted_api_key" here,
  // which still proves the key is VALID. "API key is invalid" proves it isn't.
  let resend: { status: number; name?: string; message?: string } | null = null
  if (inUse) {
    const res = await fetch('https://api.resend.com/domains', { headers: { Authorization: `Bearer ${inUse}` } })
    const body = await res.json().catch(() => ({})) as { name?: string; message?: string }
    resend = { status: res.status, name: body.name, message: body.message }
  }

  // ?send=1 → try a real send two ways to the Resend test inbox
  let sendTest: Record<string, unknown> | null = null
  if (getQuery(event).send && inUse) {
    const direct = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${inUse}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: (rc.emailFrom as string) || process.env.EMAIL_FROM,
        to: ['delivered@resend.dev'],
        subject: 'HorseBrain setup check',
        text: 'Setup check from /api/dev/email-check'
      })
    })
    const directBody = await direct.json().catch(() => ({}))
    let viaModule: unknown
    try {
      viaModule = { ok: true, id: await sendEmail({ to: 'delivered@resend.dev', subject: 'HorseBrain setup check (module)', text: 'check', html: '<p>check</p>', tag: 'setup-check' }, event) }
    } catch (err: any) {
      viaModule = { ok: false, error: err?.message }
    }
    sendTest = { direct: { status: direct.status, body: directBody }, viaModule, moduleKey: await emailKeyFingerprint(event) }
  }

  return {
    sendTest,
    keyInUse: inUse === fromRuntimeConfig && fromRuntimeConfig ? 'runtimeConfig (NUXT_RESEND_API_KEY)' : 'process.env.RESEND_API_KEY',
    nuxtResendApiKeySet: !!fromRuntimeConfig,
    inUse: await fingerprint(inUse),
    envFile: await fingerprint(fromFile),
    sameAsEnvFile: !!fromFile && inUse === fromFile,
    emailFrom: (rc.emailFrom as string) || process.env.EMAIL_FROM || null,
    cwd: process.cwd(),
    resend
  }
})
