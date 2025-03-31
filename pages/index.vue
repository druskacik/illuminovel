<template>
  <div class="container mx-auto px-4 py-12">
    <h1 class="text-4xl md:text-5xl font-bold text-center mb-8">
      Soundtrack for your favorite book in seconds
    </h1>
    <div class="text-center text-sm text-gray-500 text-red-400 mb-8">
      Note: the generation was down for a few days, I apologise for the inconvenience. Everything should be working now!
    </div>
    <div class="max-w-md mx-auto mb-12">
      <UForm @submit="handleSubmit" class="flex flex-col md:flex-row md:items-center">
        <div class="flex-grow mb-2 md:mb-0 md:mr-2">
          <UInputMenu
            v-model="selectedBook"
            :search="search"
            :loading="isSuggestionLoading"
            :search-lazy="true"
            :debounce="500"
            placeholder="Search for a book..."
            option-attribute="value"
            trailing
            size="lg"
            :ui="{ rounded: 'rounded-full', input: { size: 'lg' } }"
          >
            <template #trailing v-if="!isSuggestionLoading">
              <span class="text-gray-500 dark:text-gray-400 text-xs"></span>
            </template>
            <template #empty>
              - Search for a book -
            </template>
            <template #option-empty="{ query }">
              <div v-if="!isSuggestionLoading">
                No results for <q>{{ query }}</q>
              </div>
              <div v-else>
                Loading...
              </div>
            </template>
            <template #option="{ option: book }">
              <div class="flex items-center">
                <!-- <img :src="book.imageUrl" :alt="book.title" class="w-12 h-16 object-cover mr-4"> -->
                <div>
                  <div class="font-semibold">{{ book.title }}</div>
                  <div class="text-sm text-gray-500">{{ book.author }}</div>
                </div>
              </div>
            </template>
          </UInputMenu>
        </div>
        <UButton
          type="submit"
          icon="i-heroicons-musical-note-solid"
          color="primary"
          :loading="isLoading"
          :disabled="!isBookSelected"
          size="lg"
          class="w-full md:w-auto"
        >
          {{ isLoading ? 'Generating...' : 'Generate' }}
        </UButton>
      </UForm>
      <div class="text-xs text-gray-500 flex items-center mt-1">
        <UTooltip :ui="{ base: 'h-fit overflow-visible whitespace-normal' }">
          <div class="flex items-center">
            <UIcon name="i-heroicons-information-circle" class="mr-1" />
            <span>About the search results</span>
          </div>
          <template #text>
            <div class="italic">
              The search results are from the Wikidata database. If a book is
              not found, the reason is most likely that the book is not in the
              Wikidata database.
            </div>
          </template>
        </UTooltip>
      </div>
    </div>
    
    <div v-if="isLoading" class="mt-8 flex justify-center">
      <img src="~/assets/catjam.gif" alt="Loading" class="w-48 h-48">
    </div>

    <div v-if="generatedPlaylist && !isLoading" class="mt-8">
      <h2 class="text-2xl font-semibold mb-4">Generated Soundtrack</h2>
      <div class="bg-white shadow-md rounded-lg p-6">
        <div class="flex items-center mb-4">
          <img :src="generatedPlaylist.imageUrl" alt="Playlist Cover" class="w-24 h-24 object-cover rounded-md mr-4">
          <div>
            <h3 class="text-xl font-bold">{{ generatedPlaylist.name }}</h3>
            <a :href="generatedPlaylist.spotifyUrl" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800">
              Listen on Spotify
            </a>
          </div>
        </div>
        <ul class="space-y-4">
          <li v-for="(track, index) in generatedPlaylist.tracks" :key="index" class="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <span>{{ track.title }}</span>
            <span class="text-gray-600 text-sm sm:text-base">{{ track.artist }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="mt-16 lg:flex lg:space-x-8">
      <section class="lg:w-1/2">
        <h2 class="text-3xl font-semibold mb-6">Featured Soundtracks</h2>
        <div class="space-y-4">
          <div v-for="(book, index) in featuredBooks" :key="index" class="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
            <div class="flex items-center">
              <img :src="book.imageUrl" :alt="book.title" class="w-16 h-16 object-cover mr-4 rounded">
              <h3 class="text-xl font-bold">{{ book.title }}</h3>
            </div>
            <div>
              <a
                :href="book.spotifyLink"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 hover:text-blue-800"
              >
                Listen on Spotify
              </a>
            </div>
          </div>
        </div>
      </section>
      
      <section class="mt-16 lg:mt-0 lg:w-1/2">
        <h2 class="text-3xl font-semibold mb-6">Recently Made</h2>
        <div class="space-y-4">
          <div v-for="(book, index) in recentlyMadeBooks" :key="index" class="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
            <div class="flex items-center">
              <img :src="book.imageUrl" :alt="book.title" class="w-16 h-16 object-cover mr-4 rounded">
              <h3 class="text-xl font-bold">{{ book.title }}</h3>
            </div>
            <div>
              <a
                :href="book.spotifyLink"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 hover:text-blue-800"
              >
                Listen on Spotify
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
    <app-about-soundtrack-generation />
  </div>
</template>

<script setup>
const selectedBook = ref(null);
const isSuggestionLoading = ref(false);
const isLoading = ref(false);
const isBookSelected = computed(() => selectedBook.value !== null);
const generatedPlaylist = ref(null);

const { data: recentlyMadeBooks, status, error, refresh, clear } = await useAsyncData(
  'recentlyMadeBooks',
  () => $fetch('/api/get-featured')
)

useSeoMeta({
  title: 'Illuminovel - Book Soundtracks',
  ogTitle: 'Illuminovel - Book Soundtracks',
  description: 'Generate a Spotify playlist of music suitable for your favorite book.',
  ogDescription: 'Generate a Spotify playlist of music suitable for your favorite book.',
})


const featuredBooks = [
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    spotifyLink: "https://open.spotify.com/playlist/1N21OiTZdk2LQF9nMoqnnV",
    imageUrl: "https://mosaic.scdn.co/640/ab67616d00001e020fb62db4f20c99fde9ba0f20ab67616d00001e02578c58b83130e3239458f507ab67616d00001e02a026fc7c2cd5e5033c731e51ab67616d00001e02ff2684642c23615f628260ba",
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    spotifyLink: "https://open.spotify.com/playlist/08c7VEK6I3Kinz6CNqBCPt",
    imageUrl: "https://mosaic.scdn.co/640/ab67616d00001e020430d38a75d569dae3d82611ab67616d00001e026359bcacfdc3d97b1ee36916ab67616d00001e02d488e27a5d0246ebf3f5ac08ab67616d00001e02f6080da2dfb72fcf1d68e3b5"
  },
  {
    title: "A Game of Thrones",
    author: "George R. R. Martin",
    spotifyLink: "https://open.spotify.com/playlist/61DXT7OCQWHpnp1IKqrgZQ",
    imageUrl: "https://mosaic.scdn.co/640/ab67616d00001e02088889d170bccc1b3a00eb05ab67616d00001e020fb62db4f20c99fde9ba0f20ab67616d00001e024603759d9ff943651e25e5f0ab67616d00001e02b8245d3d056e9f4e75fc6b46"
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    spotifyLink: "https://open.spotify.com/playlist/7JHN0EghMKi5On9R6kWy69",
    imageUrl: "https://mosaic.scdn.co/640/ab67616d00001e023d5162a29d4a39046d2f0d02ab67616d00001e024230ea03841886ac65958fe5ab67616d00001e0254c804ca694378a4bb8c5a78ab67616d00001e0285dba7bea3da11460655c660",
  },
  {
    title: "War and Peace",
    author: "Leo Tolstoy",
    spotifyLink: "https://open.spotify.com/playlist/6IujHP9jvjqYlduW9qpoak",
    imageUrl: "https://mosaic.scdn.co/640/ab67616d00001e022389dc9983bdb641c58ea8eaab67616d00001e023c223a880376db34edf5dd6fab67616d00001e025509a42615698f3d21367d56ab67616d00001e026f661a0a4674e37f854e344b",
  },
];

const search = async (q) => {
  if (q.length < 3) {
    return []
  }
  isSuggestionLoading.value = true
  const books = await $fetch(`/api/suggest-book?q=${q}`)
  isSuggestionLoading.value = false

  return books.map((book) => ({
    ...book,
    value: `${book.title} by ${book.author}`,
  }))
}

const handleSubmit = async () => {
  try {
    isLoading.value = true
    const response = await $fetch('/api/create-playlist', {
      method: 'POST',
      body: selectedBook.value,
    })
    console.log('response', response)
    generatedPlaylist.value = response
  } catch (error) {
    console.error('Error creating playlist:', error)
  } finally {
    isLoading.value = false
  }
};
</script>
