// =============================================================
//  Account email templates: { subject, html, text } for each kind.
//
//  Email clients ignore CSS variables, <style> blocks (often) and
//  web fonts, so these use inline styles, tables and hex values
//  copied from assets/scss/base/_root.scss. Amagro falls back to
//  Georgia. Every email has a plain-text twin.
// =============================================================

const C = {
  espresso: '#45201A',
  espressoSoft: '#6B5854',
  babyBlue: '#85ABFF',
  shadowGrey: '#1D1C21',
  cream: '#F5F1E8',
  white: '#FFFFFF',
  border: '#E6DFDD',
  blueInk: '#3B67BF'
}

const HEADING = `Amagro, Georgia, 'Times New Roman', serif`
const BODY = `Raleway, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))

interface Layout {
  preheader: string        // inbox preview line
  heading: string
  paragraphs: string[]     // already-escaped HTML allowed
  button?: { label: string; url: string }
  afterButton?: string[]
  reason: string           // "You're getting this because…"
}

function layout(l: Layout) {
  const p = (html: string) =>
    `<p style="margin:0 0 16px;font-family:${BODY};font-size:16px;line-height:1.6;color:${C.espresso};">${html}</p>`

  const button = l.button ? `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
      <tr><td style="background:${C.babyBlue};border-radius:4px;">
        <a href="${esc(l.button.url)}" style="display:inline-block;padding:14px 32px;font-family:${HEADING};font-size:17px;font-weight:bold;letter-spacing:0.04em;text-transform:uppercase;color:${C.shadowGrey};text-decoration:none;">${esc(l.button.label)}</a>
      </td></tr>
    </table>
    <p style="margin:0 0 24px;font-family:${BODY};font-size:13px;line-height:1.5;color:${C.espressoSoft};">
      Button not working? Paste this link into your browser:<br>
      <a href="${esc(l.button.url)}" style="color:${C.blueInk};word-break:break-all;">${esc(l.button.url)}</a>
    </p>` : ''

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><title>${esc(l.heading)}</title></head>
<body style="margin:0;padding:0;background:${C.cream};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(l.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.cream};">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
      <!-- Header: espresso bar with the white rail along its bottom -->
      <tr><td style="background:${C.espresso};padding:22px 32px;border-bottom:2px solid ${C.white};border-radius:0 12px 0 0;">
        <span style="font-family:${HEADING};font-size:26px;font-weight:bold;letter-spacing:0.04em;text-transform:uppercase;color:${C.white};">HorseBrain</span>
      </td></tr>
      <!-- Body -->
      <tr><td style="background:${C.white};padding:36px 32px 12px;border:1px solid ${C.border};border-top:0;border-radius:0 0 0 12px;">
        <h1 style="margin:0 0 20px;font-family:${HEADING};font-size:26px;line-height:1.2;text-transform:uppercase;color:${C.espresso};">${esc(l.heading)}</h1>
        ${l.paragraphs.map(p).join('')}
        ${button}
        ${(l.afterButton || []).map(p).join('')}
      </td></tr>
      <!-- Footer -->
      <tr><td style="padding:24px 8px 0;font-family:${BODY};font-size:12px;line-height:1.6;color:${C.espressoSoft};">
        <p style="margin:0 0 10px;">${esc(l.reason)}</p>
        <p style="margin:0 0 10px;">Wagering involves risk. If gambling stops being fun, call the National Problem Gambling Helpline at 1-800-522-4700 or visit ncpgambling.org.</p>
        <p style="margin:0;">HorseBrain · horse-brain.com · Questions? Reply to this email or write to info@horse-brain.com.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`
}

const FOOTER_TEXT = [
  '',
  '—',
  'Wagering involves risk. If gambling stops being fun, call the National Problem Gambling Helpline at 1-800-522-4700 or visit ncpgambling.org.',
  'HorseBrain · horse-brain.com · info@horse-brain.com'
].join('\n')

// ---- Templates ------------------------------------------------------

export function verifyEmailTemplate(o: { firstName: string; url: string }) {
  const subject = 'Confirm your email for HorseBrain'
  const reason = 'You’re getting this because this address was used to create a HorseBrain account. If that wasn’t you, ignore this email and no account will be confirmed.'
  return {
    subject,
    html: layout({
      preheader: 'One click to confirm your email. The link works for 24 hours.',
      heading: 'Confirm your email',
      paragraphs: [
        `Hi ${esc(o.firstName)},`,
        'Thanks for creating a HorseBrain account. Please confirm this is your email address so we can keep your account secure and send you password resets.'
      ],
      button: { label: 'Confirm email', url: o.url },
      afterButton: ['This link works for 24 hours and can be used once.'],
      reason
    }),
    text: [
      `Hi ${o.firstName},`,
      '',
      'Thanks for creating a HorseBrain account. Confirm your email address here:',
      o.url,
      '',
      'This link works for 24 hours and can be used once.',
      '',
      reason,
      FOOTER_TEXT
    ].join('\n')
  }
}

export function resetPasswordTemplate(o: { firstName: string; url: string }) {
  const subject = 'Reset your HorseBrain password'
  const reason = 'You’re getting this because someone asked to reset the password for this HorseBrain account. If it wasn’t you, you can ignore this email: your password won’t change.'
  return {
    subject,
    html: layout({
      preheader: 'Choose a new password. The link works for 1 hour.',
      heading: 'Reset your password',
      paragraphs: [
        `Hi ${esc(o.firstName)},`,
        'We received a request to reset your HorseBrain password. Choose a new one with the button below.'
      ],
      button: { label: 'Choose a new password', url: o.url },
      afterButton: ['This link works for 1 hour and can be used once. Resetting your password signs you out on every other device.'],
      reason
    }),
    text: [
      `Hi ${o.firstName},`,
      '',
      'We received a request to reset your HorseBrain password. Choose a new one here:',
      o.url,
      '',
      'This link works for 1 hour and can be used once. Resetting your password signs you out on every other device.',
      '',
      reason,
      FOOTER_TEXT
    ].join('\n')
  }
}

export function passwordChangedTemplate(o: { firstName: string; when: string; resetUrl: string }) {
  const subject = 'Your HorseBrain password was changed'
  const reason = 'You’re getting this security notice because the password on your HorseBrain account changed.'
  return {
    subject,
    html: layout({
      preheader: 'If this was you, there’s nothing else to do.',
      heading: 'Password changed',
      paragraphs: [
        `Hi ${esc(o.firstName)},`,
        `The password for your HorseBrain account was changed on ${esc(o.when)}. You’ve been signed out on your other devices.`,
        '<strong>If this was you,</strong> there’s nothing else to do.',
        '<strong>If it wasn’t,</strong> reset your password straight away and reply to this email so we can help.'
      ],
      button: { label: 'Reset password', url: o.resetUrl },
      reason
    }),
    text: [
      `Hi ${o.firstName},`,
      '',
      `The password for your HorseBrain account was changed on ${o.when}. You’ve been signed out on your other devices.`,
      '',
      'If this was you, there’s nothing else to do.',
      `If it wasn’t, reset your password straight away: ${o.resetUrl}`,
      'and reply to this email so we can help.',
      '',
      reason,
      FOOTER_TEXT
    ].join('\n')
  }
}

export function confirmNewEmailTemplate(o: { firstName: string; newEmail: string; url: string }) {
  const subject = 'Confirm your new email for HorseBrain'
  const reason = 'You’re getting this because someone asked to move a HorseBrain account to this address. If that wasn’t you, ignore this email and nothing will change.'
  return {
    subject,
    html: layout({
      preheader: 'Confirm this address to finish changing your HorseBrain email.',
      heading: 'Confirm your new email',
      paragraphs: [
        `Hi ${esc(o.firstName)},`,
        `You asked to change the email on your HorseBrain account to <strong>${esc(o.newEmail)}</strong>. Confirm it to finish the change. Until you do, you’ll keep signing in with your current email.`
      ],
      button: { label: 'Confirm new email', url: o.url },
      afterButton: ['This link works for 24 hours and can be used once.'],
      reason
    }),
    text: [
      `Hi ${o.firstName},`,
      '',
      `You asked to change the email on your HorseBrain account to ${o.newEmail}. Confirm it here to finish the change:`,
      o.url,
      '',
      'Until you do, you’ll keep signing in with your current email. This link works for 24 hours and can be used once.',
      '',
      reason,
      FOOTER_TEXT
    ].join('\n')
  }
}

export function emailChangeRequestedTemplate(o: { firstName: string; maskedNewEmail: string; settingsUrl: string; resetUrl: string }) {
  const subject = 'Your HorseBrain email is being changed'
  const reason = 'You’re getting this security notice at the email currently on your HorseBrain account.'
  return {
    subject,
    html: layout({
      preheader: 'If this was you, there’s nothing else to do.',
      heading: 'Email change requested',
      paragraphs: [
        `Hi ${esc(o.firstName)},`,
        `Someone signed in to your HorseBrain account asked to change its email to <strong>${esc(o.maskedNewEmail)}</strong>. The change only happens once that address is confirmed.`,
        '<strong>If this was you,</strong> there’s nothing else to do.',
        `<strong>If it wasn’t,</strong> cancel the change in your <a href="${esc(o.settingsUrl)}" style="color:${C.blueInk};">account settings</a>, then reset your password.`
      ],
      button: { label: 'Reset password', url: o.resetUrl },
      reason
    }),
    text: [
      `Hi ${o.firstName},`,
      '',
      `Someone signed in to your HorseBrain account asked to change its email to ${o.maskedNewEmail}. The change only happens once that address is confirmed.`,
      '',
      'If this was you, there’s nothing else to do.',
      `If it wasn’t, cancel the change in your account settings (${o.settingsUrl}), then reset your password: ${o.resetUrl}`,
      '',
      reason,
      FOOTER_TEXT
    ].join('\n')
  }
}
