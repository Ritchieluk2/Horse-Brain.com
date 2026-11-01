// =============================================================
//  The account emails, wired together: issue a one-time token,
//  build the link from the site's own address, render the
//  template and send it. API routes call these.
// =============================================================
import type { H3Event } from 'h3'
import type { UserRecord } from './users'
import { issueToken, startEmailCooldown } from './tokens'
import { sendEmail } from './email'
import { verifyEmailTemplate, resetPasswordTemplate, passwordChangedTemplate, confirmNewEmailTemplate, emailChangeRequestedTemplate } from './email-templates'

// Links point back at whichever host served the request
// (http://localhost:3000 in dev). NUXT_SITE_URL overrides it.
function siteUrl(event: H3Event) {
  const configured = useRuntimeConfig(event).siteUrl as string
  return (configured || getRequestURL(event).origin).replace(/\/$/, '')
}

export async function sendVerificationEmail(event: H3Event, user: UserRecord) {
  const token = await issueToken('verify-email', user)
  const url = `${siteUrl(event)}/verify-email?token=${encodeURIComponent(token)}`
  await sendEmail({ to: user.email, tag: 'verify-email', ...verifyEmailTemplate({ firstName: user.firstName, url }) }, event)
  await startEmailCooldown('verify-email', user.email)
}

export async function sendPasswordResetEmail(event: H3Event, user: UserRecord) {
  const token = await issueToken('reset-password', user)
  const url = `${siteUrl(event)}/reset-password?token=${encodeURIComponent(token)}`
  await sendEmail({ to: user.email, tag: 'reset-password', ...resetPasswordTemplate({ firstName: user.firstName, url }) }, event)
  await startEmailCooldown('reset-password', user.email)
}

export async function sendPasswordChangedEmail(event: H3Event, user: UserRecord) {
  const when = new Date().toLocaleString('en-US', {
    dateStyle: 'long', timeStyle: 'short', timeZone: 'America/New_York', timeZoneName: 'short'
  })
  await sendEmail({
    to: user.email,
    tag: 'password-changed',
    ...passwordChangedTemplate({ firstName: user.firstName, when, resetUrl: `${siteUrl(event)}/forgot-password` })
  }, event)
}

// n•••@gmail.com: enough to recognise, not enough to harvest
export function maskEmail(email: string) {
  const [local, domain] = email.split('@')
  return `${local.slice(0, 1)}•••@${domain}`
}

/** Email change: confirmation link to the NEW address + a heads-up to the current one. */
export async function sendEmailChangeEmails(event: H3Event, user: UserRecord, newEmail: string) {
  const token = await issueToken('change-email', user, { newEmail })
  const base = siteUrl(event)
  await sendEmail({
    to: newEmail,
    tag: 'change-email',
    ...confirmNewEmailTemplate({ firstName: user.firstName, newEmail, url: `${base}/verify-email?change=1&token=${encodeURIComponent(token)}` })
  }, event)
  await startEmailCooldown('change-email', user.email)
  try {
    await sendEmail({
      to: user.email,
      tag: 'change-email-notice',
      ...emailChangeRequestedTemplate({
        firstName: user.firstName,
        maskedNewEmail: maskEmail(newEmail),
        settingsUrl: `${base}/account/settings`,
        resetUrl: `${base}/forgot-password`
      })
    }, event)
  } catch (err: any) {
    console.error('[auth] email-change notice not sent:', err?.message || err)
  }
}
