import racedaysData from '~/data/racedays.json'
import tracksData from '~/data/tracks.json'

/**
 * Placeholder "today". Set to null to use the real system clock
 * once the API is wired in.
 */
const DEMO_TODAY = '2026-10-31'

/** Index tracks by id for O(1) joins. */
const TRACK_INDEX = Object.fromEntries(
  (tracksData.tracks || []).map(t => [t.id, t])
)

/**
 * Parse 'YYYY-MM-DD' as LOCAL midnight.
 * new Date('2026-10-31') parses as UTC and renders as Oct 30
 * in negative-offset timezones. This avoids that off-by-one.
 */
function parseLocalDate(iso) {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatTime(isoDateTime) {
  const d = new Date(isoDateTime)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

/** Join a raw raceday record with its track and derive display fields. */
function enrich(key, raw) {
  const track = TRACK_INDEX[raw.track_id] || {}
  const dateObj = parseLocalDate(raw.date)
  const races = raw.races || []

  const sortedRaces = [...races].sort(
    (a, b) => new Date(a.post_time) - new Date(b.post_time)
  )

  return {
    ...raw,
    key,
    races: sortedRaces,

    // Joined from tracks.json
    track_name: track.name || raw.track_id,
    logo: track.logo || '',
    background: track.background || '',
    location: track.location || '',

    // Derived dates
    dateISO: raw.date,
    shortDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate: dateObj.toLocaleDateString('en-US', {
      weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
    }),
    formatted_date: dateObj.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }),

    // Derived overview
    overview: {
      total_races: sortedRaces.length,
      first_post: sortedRaces.length ? formatTime(sortedRaces[0].post_time) : '—',
      last_post: sortedRaces.length ? formatTime(sortedRaces[sortedRaces.length - 1].post_time) : '—'
    },

    // Convenience
    going: raw.weather?.track_condition || '—',
    path: `/racedays/${raw.track_id}/${raw.date}`
  }
}

/** Built once at module load — the JSON is static. */
const ALL_RACEDAYS = Object.entries(racedaysData.racedays || {})
  .map(([key, raw]) => enrich(key, raw))
  .sort((a, b) => parseLocalDate(a.dateISO) - parseLocalDate(b.dateISO))

export function useRacedays() {
  const today = DEMO_TODAY ? parseLocalDate(DEMO_TODAY) : parseLocalDate(
    new Date().toISOString().slice(0, 10)
  )

  const upcomingRacedays = computed(() =>
    ALL_RACEDAYS.filter(rd => parseLocalDate(rd.dateISO) >= today)
  )

  const pastRacedays = computed(() =>
    ALL_RACEDAYS
      .filter(rd => parseLocalDate(rd.dateISO) < today)
      .sort((a, b) => parseLocalDate(b.dateISO) - parseLocalDate(a.dateISO))
  )

  /** Lookup by track id + date, case-insensitive on the track. */
  function getRaceday(trackId, date) {
    if (!trackId || !date) return null
    const key = `${String(trackId).toUpperCase()}-${String(date).slice(0, 10)}`
    return ALL_RACEDAYS.find(rd => rd.key === key) || null
  }

  /** Soonest upcoming raceday for a given track. */
  function getNextRacedayForTrack(trackId) {
    const id = String(trackId).toUpperCase()
    return upcomingRacedays.value.find(rd => rd.track_id === id) || null
  }

  /** All upcoming racedays for a track, soonest first. */
  function getUpcomingForTrack(trackId) {
    const id = String(trackId).toUpperCase()
    return upcomingRacedays.value.filter(rd => rd.track_id === id)
  }

  /** Previous / next raceday at the same track, for page-to-page nav. */
  function getAdjacentRacedays(raceday) {
    if (!raceday) return { previous: null, next: null }
    const sameTrack = ALL_RACEDAYS.filter(rd => rd.track_id === raceday.track_id)
    const i = sameTrack.findIndex(rd => rd.key === raceday.key)
    return {
      previous: i > 0 ? sameTrack[i - 1] : null,
      next: i >= 0 && i < sameTrack.length - 1 ? sameTrack[i + 1] : null
    }
  }

  return {
    allRacedays: ALL_RACEDAYS,
    upcomingRacedays,
    pastRacedays,
    getRaceday,
    getNextRacedayForTrack,
    getUpcomingForTrack,
    getAdjacentRacedays
  }
}