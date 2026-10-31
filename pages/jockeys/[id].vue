<template>
  <EntityProfile v-if="profile" :profile="profile" />
  <div v-else class="not-found">
    <div class="container">
      <h2>Jockey not found</h2>
      <p>The jockey you're looking for doesn't exist in our database.</p>
      <NuxtLink to="/" class="btn btn--primary">Back to Home</NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import EntityProfile from '~/components/EntityProfile.vue'
import { useEntityProfile } from '~/composables/useEntityProfile'

const route = useRoute()

const profile = computed(() => 
  useEntityProfile('jockey', route.params.id)
)

useHead(() => ({
  title: profile.value 
    ? `${profile.value.name} | HorseBrain` 
    : 'Jockey Not Found | HorseBrain'
}))
</script>
