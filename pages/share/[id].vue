<template>
  <div v-if="pending" class="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
    <ULoader size="lg" />
    <p class="ml-4 text-xl font-semibold">Loading characters...</p>
  </div>
  <div v-else class="shared-gallery pt-20 pb-20">
    <UContainer>
      <h1 class="text-3xl font-bold text-center mb-12">Character Illustrations For <i>{{ bookName }}</i></h1>
      <div v-if="error" class="text-center text-red-500">
        <p>{{ error }}</p>
      </div>
      <div v-else>
        <ImageGallery :characters="characters" />
      </div>
    </UContainer>
  </div>
</template>

<script setup>

const route = useRoute();
const error = ref(null);

const { data: sharedData, pending } = useAsyncData(
  'sharedCharacters',
  () => $fetch(`/api/get-shared?id=${route.params.id}`),
  {
    transform: (data) => {
      if (!data) {
        error.value = 'No data found for this shared ID';
        return { characters: [], bookName: '' };
      }
      return data;
    },
    onError: (e) => {
      console.error('Error fetching shared characters:', e);
      error.value = 'Failed to load shared characters';
    }
  }
);

const characters = computed(() => sharedData.value?.characters || []);
const bookName = computed(() => sharedData.value?.bookName || '');
</script>

<style scoped>
.shared-gallery {
  min-height: 100vh;
}
</style>
