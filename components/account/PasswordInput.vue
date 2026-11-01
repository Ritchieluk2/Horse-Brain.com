<template>
  <div class="password-field">
    <input
      :id="id"
      v-model="model"
      :type="visible ? 'text' : 'password'"
      class="form-input"
      :name="name"
      :autocomplete="autocomplete"
      :aria-invalid="invalid ? 'true' : undefined"
      :aria-describedby="describedby || undefined"
      spellcheck="false"
      autocapitalize="off"
      required
    >
    <button
      type="button"
      class="password-field__toggle"
      :aria-pressed="visible"
      :aria-controls="id"
      @click="visible = !visible"
    >
      {{ visible ? 'Hide' : 'Show' }}<span class="visually-hidden"> password</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  id: { type: String, required: true },
  name: { type: String, default: 'password' },
  autocomplete: { type: String, default: 'current-password' },
  invalid: { type: Boolean, default: false },
  describedby: { type: String, default: '' }
})

const model = defineModel({ type: String, default: '' })
const visible = ref(false)
</script>
