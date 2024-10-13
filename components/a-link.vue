<template>
  <a :href="href" :target="target" class="text-blue-600 hover:text-blue-800 underline">
    <slot></slot>
  </a>
</template>

<script setup>
defineProps({
  href: {
    type: String,
    required: true
  },
  target: {
    type: String,
    default: '_blank'
  }
});
</script>
