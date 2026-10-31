<template>
  <div class="page-title">
    <div class="container">
      <h1>{{ title }}</h1>
      <nav class="breadcrumbs">
        <ol>
          <li v-for="(crumb, index) in crumbs" :key="index">
            <NuxtLink 
              v-if="crumb.to" 
              class="breadcrumb-link" 
              :to="crumb.to"
            >
              {{ crumb.label }}
            </NuxtLink>
            <span v-else class="breadcrumb-current">{{ crumb.label }}</span>
          </li>
        </ol>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Page Title'
  },
  // Optional. When omitted, defaults to "Home / {title}".
  breadcrumbs: {
    type: Array,
    default: null
  }
})

const crumbs = computed(() =>
  props.breadcrumbs?.length
    ? props.breadcrumbs
    : [{ label: 'Home', to: '/' }, { label: props.title }]
)
</script>

<!-- Styles: assets/scss/components/_page-title.scss -->
