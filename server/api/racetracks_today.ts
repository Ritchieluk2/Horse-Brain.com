import { ref } from 'vue';
import mongo_api from 'C:/Users/ritch/Documents/Coding Projects/HorseBrain/api/mongo_api.js';
import { defineEventHandler } from 'h3';

interface Racetrack {
    date: string
    track_id: string
    num_races: string
    track_name: string
    post_time: string
  }

export default defineEventHandler(async event => {
  const races = ref<Racetrack[]>([]) 

  const fetchedRaces = await mongo_api.fetchRacesToday()
  races.value = fetchedRaces.map((race: any) => ({
    date: race.date.split('T')[0], // Extract just the date part
    track_id: race.track_id,
    num_races: race.num_races.toString(), // Convert to string
    track_name: race.track_name,
    post_time: (() => {
      const time = race.post_time.split('T')[1].split('.')[0];
      const [hours, minutes] = time.split(':');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${minutes}${ampm}`;
    })()
  }))

    races.value.sort((a, b) => a.track_id.localeCompare(b.track_id))
    console.log("API \n");
    console.log(races);
    return {races: races};
})