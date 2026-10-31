<template>
    <section id="racetracks" class="racetracks section dark-background">

      <!-- Section Title -->
      <div class="container section-title" data-aos="fade-up">
        <h2>All Racetracks</h2>
      </div><!-- End Section Title -->

      <div class="container" data-aos="fade-up" data-aos-delay="100">

        <div v-if="pending" class="mt-4">
          <br>
          <h3>Loading Racetracks</h3>
          <p>This may take a moment.</p>
          <br>
        </div>
        <div v-else-if="error" class="mt-4 text-red-600">{{ error }}</div>
        <div v-else-if="races.length === 0" class="mt-4">
          <br>
          <h3>No racetracks.</h3>
          <p>Not for a while at least :/</p>
          <br>
        </div>
        <div v-else>
          <div class="row gy-4">
          <!-- TODO: Turn this into a subcomponent populated using a v-for loop -->
            <div v-for="racetrack in data" :key="raceday.track_id">
              <RacetrackCardOverview :racetrack="racetrack" />
            </div>

          </div>
        </div>

      </div>

    </section>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { format } from 'date-fns';
  import RacetrackCardOverview from './ActiveRacetracksOverview.vue';

  interface Racetrack {
    date: string
    track_id: string
    num_races: string
    track_name: string
    post_time: string
  }

  const { data, error, pending, refresh } = await useFetch('/api/racetracks_today');
  /*
    async function fetchRaces() {
      loading.value = true
      error.value = ''
      try { 
        
        races.value = data.value;
        console.log("VUE");
        console.log(races.value);
      } catch (err) {
        console.error('Error fetching races:', err)
        error.value = 'Failed to fetch races. Please try again.'
      } finally {
        console.log("SET LOADING TRUE");
        loading.value = false
      }
    }
  
  fetchRaces()*/
</script>

<style scoped>

</style>