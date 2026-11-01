// =============================================================
//  Account rules, shared by the browser forms and the server API.
//  One source of truth for field limits, the legal-document
//  versions a user agrees to, and validation messages.
//
//  Imported through the ~ alias from both sides:
//    pages/sign-up.vue        → '#shared/account-rules.js'
//    server/api/auth/*.ts     → '#shared/account-rules.js'
//  Keep it dependency-free so it runs in the browser, Node and
//  Cloudflare Workers alike.
// =============================================================

// Bump a version whenever that document's text changes. Users who
// accepted an older version can then be asked to accept again.
export const LEGAL_VERSIONS = {
  terms: '2026-11-01',        // Terms of Use + Privacy Policy
  disclaimer: '2026-11-01',   // Picks are informational, no guarantees
  responsibleGambling: '2026-11-01'
}

// Minimum age to hold an account. Most US advance-deposit wagering
// requires 21+, so we use the stricter line everywhere.
export const MINIMUM_AGE = 21

export const PASSWORD_MIN = 10
export const PASSWORD_MAX = 128
export const NAME_MAX = 50

export const US_STATES = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'],
  ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'],
  ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'],
  ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'],
  ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'],
  ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
  ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
  ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'],
  ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'],
  ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'],
  ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming']
]
const STATE_CODES = new Set(US_STATES.map(([code]) => code))

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const ZIP_RE = /^\d{5}(-\d{4})?$/

const str = (v) => (typeof v === 'string' ? v.trim() : '')

export const normalizeEmail = (v) => str(v).toLowerCase()

// US numbers → +1XXXXXXXXXX. Anything else keeps its digits with a +.
export function normalizePhone(v) {
  const raw = str(v)
  if (!raw) return ''
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  if (raw.startsWith('+') && digits.length >= 8 && digits.length <= 15) return `+${digits}`
  return null // invalid
}

export function formatPhone(e164) {
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164 || '')
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : (e164 || '')
}

export function validateEmail(v) {
  const email = normalizeEmail(v)
  if (!email) return 'Enter your email address.'
  if (email.length > 254 || !EMAIL_RE.test(email)) return 'Enter a valid email address, like name@example.com.'
  return ''
}

export function validatePassword(v, email = '') {
  const pw = typeof v === 'string' ? v : ''
  if (!pw) return 'Create a password.'
  if (pw.length < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters.`
  if (pw.length > PASSWORD_MAX) return `Use ${PASSWORD_MAX} characters or fewer.`
  if (email && pw.toLowerCase() === normalizeEmail(email)) return 'Your password can’t be your email address.'
  return ''
}

const addressFilled = (a = {}) =>
  ['line1', 'line2', 'city', 'region', 'postalCode'].some(k => str(a[k]))

/**
 * Validate + normalise the editable profile fields (sign-up and settings).
 * Returns { errors, value: { firstName, lastName, phone, address, marketingOptIn } }.
 */
export function validateProfile(input = {}) {
  const errors = {}
  const firstName = str(input.firstName)
  const lastName = str(input.lastName)

  if (!firstName) errors.firstName = 'Enter your first name.'
  else if (firstName.length > NAME_MAX) errors.firstName = `Keep it under ${NAME_MAX} characters.`
  if (!lastName) errors.lastName = 'Enter your last name.'
  else if (lastName.length > NAME_MAX) errors.lastName = `Keep it under ${NAME_MAX} characters.`

  // Phone: optional, but must be a real number if given
  const phone = normalizePhone(input.phone)
  if (phone === null) errors.phone = 'Enter a 10-digit US number, or include the country code (+44…).'

  // Address: optional as a whole, complete if started
  const a = input.address || {}
  let address = null
  if (addressFilled(a)) {
    address = {
      line1: str(a.line1),
      line2: str(a.line2),
      city: str(a.city),
      region: str(a.region).toUpperCase(),
      postalCode: str(a.postalCode),
      country: 'US'
    }
    if (!address.line1) errors['address.line1'] = 'Enter the street address.'
    if (!address.city) errors['address.city'] = 'Enter the city.'
    if (!STATE_CODES.has(address.region)) errors['address.region'] = 'Choose a state.'
    if (!ZIP_RE.test(address.postalCode)) errors['address.postalCode'] = 'Enter a 5-digit ZIP code.'
  }

  return {
    errors,
    value: { firstName, lastName, phone: phone || '', address, marketingOptIn: input.marketingOptIn === true }
  }
}

/**
 * Validate + normalise a sign-up payload.
 * Returns { ok, errors: { field: message }, value: cleanRecord }.
 * Field keys match the form's `name`s (address fields are `address.city` etc.).
 */
export function validateSignUp(input = {}) {
  const { errors, value: profile } = validateProfile(input)
  const email = normalizeEmail(input.email)

  const emailErr = validateEmail(email)
  if (emailErr) errors.email = emailErr

  const pwErr = validatePassword(input.password, email)
  if (pwErr) errors.password = pwErr

  // Agreements: all three are required to open an account
  const ag = input.agreements || {}
  if (ag.terms !== true) errors['agreements.terms'] = 'You need to accept the Terms of Use and Privacy Policy.'
  if (ag.disclaimer !== true) errors['agreements.disclaimer'] = 'Please acknowledge the disclaimer.'
  if (ag.age !== true) errors['agreements.age'] = `You must be ${MINIMUM_AGE} or older to create an account.`

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: { ...profile, email }
  }
}

/** A user record → the plain object the profile form edits. */
export function profileFormFrom(user) {
  const a = user?.address || {}
  return {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone ? formatPhone(user.phone) : '',
    address: { line1: a.line1 || '', line2: a.line2 || '', city: a.city || '', region: a.region || '', postalCode: a.postalCode || '' },
    marketingOptIn: !!user?.marketingOptIn
  }
}
