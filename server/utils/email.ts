// =============================================================
//  Outgoing email. The ONLY file that knows which provider we use
//  (Resend, https://resend.com/docs/api-reference/emails/send-email).
//  To switch to Elastic Email / Cloudflare Email Service later,
//  rewrite `deliver()` and keep `sendEmail()`'s signature.
//
//  Settings (.env, never committed):
//    RESEND_API_KEY   re_…  (sending-only key, limited to the domain)
//    EMAIL_FROM       "HorseBrain <noreply@mail.horse-brain.com>"
//    EMAIL_REPLY_TO   info@horse-brain.com            (optional)
//  The NUXT_-prefixed names (NUXT_RESEND_API_KEY …) work too, and are
//  what to use for Cloudflare secrets when we deploy.
// =============================================================

import type { H3Event } from 'h3'

export interface OutgoingEmail {
  to: string
  subject: string
  html: string
  text: string
  /** Short label for logs and Resend's dashboard, e.g. 'verify-email' */
  tag?: string
}

function settings(event?: H3Event) {
  // With the event: Cloudflare secrets/vars for this request (NUXT_RESEND_API_KEY …)
  const rc = useRuntimeConfig(event)
  const env = (typeof process !== 'undefined' ? process.env : {}) as Record<string, string | undefined>
  return {
    apiKey: (rc.resendApiKey as string) || env.RESEND_API_KEY || '',
    from: (rc.emailFrom as string) || env.EMAIL_FROM || '',
    replyTo: (rc.emailReplyTo as string) || env.EMAIL_REPLY_TO || ''
  }
}

export class EmailNotConfiguredError extends Error {}

/** Dev diagnostics only: which key deliver() will use, without revealing it. */
export async function emailKeyFingerprint(event?: H3Event) {
  const { apiKey } = settings(event)
  return { length: apiKey.length, last4: apiKey.slice(-4), hash: (await sha256Hex(apiKey)).slice(0, 10) }
}

async function deliver(msg: OutgoingEmail, event?: H3Event) {
  const { apiKey, from, replyTo } = settings(event)
  if (!apiKey || !from) {
    throw new EmailNotConfiguredError('Email is not configured: set RESEND_API_KEY and EMAIL_FROM in .env, then restart.')
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [msg.to],
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      ...(replyTo ? { reply_to: replyTo } : {}),
      ...(msg.tag ? { tags: [{ name: 'type', value: msg.tag }] } : {})
    })
  })

  const body = await res.json().catch(() => ({})) as { id?: string; message?: string; name?: string }
  if (!res.ok) {
    throw new Error(`Resend ${res.status} ${body.name || ''}: ${body.message || 'unknown error'}`)
  }
  return body.id as string
}

/**
 * Send one email. Returns the provider's message id.
 * Throws on failure; callers decide whether that should fail the request.
 */
export async function sendEmail(msg: OutgoingEmail, event?: H3Event) {
  try {
    const id = await deliver(msg, event)
    console.info(`[email] sent ${msg.tag || 'email'} (${id})`)
    return id
  } catch (err: any) {
    // Never log the address or body, only what went wrong
    console.error(`[email] ${msg.tag || 'email'} failed: ${err?.message || err}`)
    throw err
  }
}
