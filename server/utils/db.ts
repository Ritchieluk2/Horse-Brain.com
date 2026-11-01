// =============================================================
//  The D1 database (binding `horsebrain` in wrangler.jsonc).
//
//  Production: Cloudflare passes the binding with each request.
//  `npm run dev`: Nitro's Cloudflare dev emulation runs a local
//  copy of D1 (stored in .wrangler/state/v3). Apply the schema
//  locally once with:  npx wrangler d1 migrations apply horsebrain --local
//
//  Nitro puts the bindings on globalThis.__env__ in both cases (a
//  Promise while dev emulation starts up, hence the await).
// =============================================================

const BINDING = 'horsebrain'

export async function useDB(): Promise<any> {
  const env = await (globalThis as any).__env__
  const db = env?.[BINDING]
  if (!db) {
    throw createError({
      statusCode: 500,
      statusMessage: `Database binding "${BINDING}" not found. Check d1_databases in wrangler.jsonc.`
    })
  }
  return db
}

/** SQLite UNIQUE violations (e.g. an email that's already registered). */
export const isUniqueViolation = (err: any) => /UNIQUE constraint failed/i.test(String(err?.message || err))

export const parseJSON = <T>(text: string | null | undefined): T | null => {
  if (!text) return null
  try { return JSON.parse(text) as T } catch { return null }
}
