<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Race Selection</h1>


    <div v-if="loading" class="mt-4">Loading races...</div>
    <div v-else-if="error" class="mt-4 text-red-600">{{ error }}</div>
    <div v-else-if="races.length === 0" class="mt-4">No races found for the selected date.</div>
    <ul v-else class="mt-4 space-y-2">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="raceday in races" :key="raceday.track_id">
          <Raceday :raceday="raceday" />
        </div>
      </div>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { format } from 'date-fns'
  import mongoApi from '~/api/mongo_api'
  import Raceday from './Raceday.vue'

  interface Race {
    date: string
    track_id: string
    num_races: string
    track_name: string
    post_time: string
  }

  const races = ref<Race[]>([])
  const loading = ref(false)
  const error = ref('')

    async function fetchRaces() {
      loading.value = true
      error.value = ''
      try { 
        const fetchedRaces = await mongoApi.fetchRacesToday()
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
      } catch (err) {
        console.error('Error fetching races:', err)
        error.value = 'Failed to fetch races. Please try again.'
      } finally {
        loading.value = false
      }
    }
  
  fetchRaces();
</script>