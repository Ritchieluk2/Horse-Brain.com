<template>
  <div class="form">
    <div class="form-field">
      <label class="form-label" :for="`${idPrefix}-line1`">Street address</label>
      <input :id="`${idPrefix}-line1`" v-model="address.line1" class="form-input" name="address-line1"
        autocomplete="address-line1" v-bind="aria('address.line1')">
      <p v-if="errors['address.line1']" :id="errId('address.line1')" class="form-error">{{ errors['address.line1'] }}</p>
    </div>
    <div class="form-field">
      <label class="form-label" :for="`${idPrefix}-line2`">Apt, suite, unit <span class="form-optional">optional</span></label>
      <input :id="`${idPrefix}-line2`" v-model="address.line2" class="form-input" name="address-line2"
        autocomplete="address-line2">
    </div>

    <div class="form-row form-row--address">
      <div class="form-field">
        <label class="form-label" :for="`${idPrefix}-city`">City</label>
        <input :id="`${idPrefix}-city`" v-model="address.city" class="form-input" name="address-level2"
          autocomplete="address-level2" v-bind="aria('address.city')">
        <p v-if="errors['address.city']" :id="errId('address.city')" class="form-error">{{ errors['address.city'] }}</p>
      </div>
      <div class="form-field">
        <label class="form-label" :for="`${idPrefix}-region`">State</label>
        <select :id="`${idPrefix}-region`" v-model="address.region" class="form-select" name="address-level1"
          autocomplete="address-level1" v-bind="aria('address.region')">
          <option value="">Select…</option>
          <option v-for="[code, label] in US_STATES" :key="code" :value="code">{{ label }}</option>
        </select>
        <p v-if="errors['address.region']" :id="errId('address.region')" class="form-error">{{ errors['address.region'] }}</p>
      </div>
      <div class="form-field">
        <label class="form-label" :for="`${idPrefix}-zip`">ZIP code</label>
        <input :id="`${idPrefix}-zip`" v-model.trim="address.postalCode" class="form-input" name="postal-code"
          autocomplete="postal-code" inputmode="numeric" maxlength="10" v-bind="aria('address.postalCode')">
        <p v-if="errors['address.postalCode']" :id="errId('address.postalCode')" class="form-error">{{ errors['address.postalCode'] }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// US mailing address fields, shared by /sign-up and /account/settings.
// `address` is the parent's reactive object; fields are edited in place.
// Error keys match shared/account-rules.js ('address.city' …).
import { US_STATES } from '#shared/account-rules.js'

const props = defineProps({
  address: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
  idPrefix: { type: String, default: 'addr' }
})

const errId = (key) => `${props.idPrefix}-err-${key.replace(/\./g, '-')}`
const aria = (key) => props.errors[key] ? { 'aria-invalid': 'true', 'aria-describedby': errId(key) } : {}
</script>
