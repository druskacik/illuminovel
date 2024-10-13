<template>
  <nav class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-14">
        <div class="flex-shrink-0 flex items-center">
          <NuxtLink to="/" class="text-xl font-bold text-gray-800">Illuminovel</NuxtLink>
        </div>
        <div class="hidden sm:flex sm:items-center sm:space-x-8">
          <NuxtLink 
            to="/illustrations" 
            :class="[
              'inline-flex items-center px-1 pt-1 text-sm font-medium h-full',
              isActive('/illustrations') 
                ? 'border-b-2 border-indigo-500 text-gray-900' 
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            Illustrations
          </NuxtLink>
          <NuxtLink 
            to="/about" 
            :class="[
              'inline-flex items-center px-1 pt-1 text-sm font-medium h-full',
              isActive('/about') 
                ? 'border-b-2 border-indigo-500 text-gray-900' 
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            About
          </NuxtLink>
          <NuxtLink 
            to="https://t.me/rdruska" 
            :class="[
              'inline-flex items-center px-1 pt-1 text-sm font-medium h-full',
              isActive('https://t.me/rdruska') 
                ? 'border-b-2 border-indigo-500 text-gray-900' 
                : 'text-gray-500 hover:text-gray-700'
            ]"
            target="_blank"
          >
            Contact
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

const isActive = (path) => route.path === path;

</script>

<style scoped>
/* Add any component-specific styles here if needed */
</style>
