import jockeysData from '~/data/jockeys.json'
import horsesData from '~/data/horses.json'
import tracksData from '~/data/tracks.json'

const TRACK_INDEX = Object.fromEntries(
  (tracksData.tracks || []).map(t => [t.id, t])
)

export function useEntityProfile(type, id) {
  if (type === 'jockey') {
    const jockey = jockeysData.jockeys?.[id] || null
    if (!jockey) return null

    return {
      type: 'jockey',
      id: jockey.equibase_refid,
      name: jockey.name,
      subtitle: `${jockey.years_active} years active • ${jockey.hometown}`,
      heroImage: '/images/hero-jockey.jpg',
      heroFallback: 'https://images.unsplash.com/photo-1566251037378-5e04e3bec343?w=1200&q=80',
      
      careerStats: [
        { label: 'Career Starts', value: jockey.career_stats.starts.toLocaleString() },
        { label: 'Career Wins', value: jockey.career_stats.wins.toLocaleString() },
        { label: 'Win Rate', value: `${jockey.career_stats.win_rate}%` },
        { label: 'In The Money', value: `${jockey.career_stats.in_the_money_rate}%` },
        { label: 'Lifetime Earnings', value: `$${(jockey.career_stats.lifetime_earnings / 1000000).toFixed(1)}M` }
      ],

      botAccuracy: {
        total_picks: jockey.botAccuracy.total_picks,
        wins: jockey.botAccuracy.wins,
        win_rate: jockey.botAccuracy.win_rate,
        roi: jockey.botAccuracy.roi,
        avg_confidence: jockey.botAccuracy.avg_confidence,
        performance_vs_avg: jockey.botAccuracy.performance_vs_avg
      },

      racingHistory: jockey.racing_history.map(r => ({
        id: `${r.track_id}-${r.date}-${r.race_num}`,
        date: r.date,
        track_id: r.track_id,
        track_name: r.track_name,
        race_num: r.race_num,
        race_type: r.race_type,
        partner_name: r.horse_name,
        partner_id: r.horse_equibase_refid,
        partner_type: 'horse',
        finish_position: r.finish_position,
        odds: r.odds,
        purse: r.purse,
        earnings: r.earnings
      }))
    }
  }

  if (type === 'horse') {
    const horse = horsesData.horses?.[id] || null
    if (!horse) return null

    return {
      type: 'horse',
      id: horse.equibase_refid,
      name: horse.name,
      subtitle: `${horse.sex} • Foaled ${new Date(horse.birthdate).getFullYear()} • Trainer: ${horse.trainer}`,
      heroImage: '/images/hero-horse.jpg',
      heroFallback: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1200&q=80',
      
      careerStats: [
        { label: 'Career Starts', value: horse.career_stats.starts.toLocaleString() },
        { label: 'Career Wins', value: horse.career_stats.wins.toLocaleString() },
        { label: 'Win Rate', value: `${horse.career_stats.win_rate}%` },
        { label: 'In The Money', value: `${horse.career_stats.in_the_money_rate}%` },
        { label: 'Lifetime Earnings', value: `$${(horse.career_stats.lifetime_earnings / 1000).toFixed(0)}k` }
      ],

      botAccuracy: {
        total_picks: horse.botAccuracy.total_picks,
        wins: horse.botAccuracy.wins,
        win_rate: horse.botAccuracy.win_rate,
        roi: horse.botAccuracy.roi,
        avg_confidence: horse.botAccuracy.avg_confidence,
        performance_vs_avg: horse.botAccuracy.performance_vs_avg
      },

      racingHistory: horse.racing_history.map(r => ({
        id: `${r.track_id}-${r.date}-${r.race_num}`,
        date: r.date,
        track_id: r.track_id,
        track_name: r.track_name,
        race_num: r.race_num,
        race_type: r.race_type,
        partner_name: r.jockey_name,
        partner_id: r.jockey_equibase_refid,
        partner_type: 'jockey',
        finish_position: r.finish_position,
        odds: r.odds,
        purse: r.purse,
        earnings: r.earnings
      }))
    }
  }

  return null
}