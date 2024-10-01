<template>
    <UContainer class="mt-16">
            <h2 class="text-3xl font-bold text-center mb-8">Made with Illuminovel</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <UCard v-for="(creation, index) in featuredCreations" :key="index">
                    <template #header>
                        <NuxtLink :to="`/share/${creation.id}`" class="text-lg font-semibold">{{ creation.bookTitle }}</NuxtLink>
                    </template>
                    <img :src="creation.imageUrl" :alt="creation.characterName" class="w-full h-64 object-cover">
                </UCard>
            </div>
        </UContainer>
</template>

<script setup>

const featuredCreations = [
    {
        bookTitle: "Harry Potter and the Philosopher's Stone",
        imageUrl: 'https://res.cloudinary.com/sparing/image/upload/v1725456323/f6asussonn2rbc45dmzi.jpg',
        characterName: 'Harry Potter',
        id: '66d860b25adb04d43d1af28e',
    },
    {
        bookTitle: 'The Fellowship of the Ring',
        imageUrl: 'https://res.cloudinary.com/sparing/image/upload/v1725460814/btyezkihvzbftjvtgvbi.jpg',
        characterName: 'Frodo Baggins',
        id: '66d872794c811a39798c8188',
    },
    {
        bookTitle: 'Leviathan Wakes (The Expanse, #1)',
        imageUrl: 'https://res.cloudinary.com/sparing/image/upload/v1725461223/wyqq97pry2b7sbosqciz.jpg',
        characterName: 'James Holden',
        id: '66d876054c811a39798c8189',
    },
    {
        bookTitle: 'A Game of Thrones (A Song of Ice and Fire, #1)',
        imageUrl: 'https://res.cloudinary.com/sparing/image/upload/v1725478334/uwh7a7gdmvngccczmek1.jpg',
        characterName: 'Eddard Stark',
        id: '66d8b6d18e203cb6965b8335',
    },
    {
        bookTitle: 'Dune',
        imageUrl: 'https://res.cloudinary.com/sparing/image/upload/v1725483160/jwof9yfwcjkbajnozduy.jpg',
        characterName: 'Paul Atreides',
        id: '66d8c9de9f11cff9518b0a69'
    },
    {
        bookTitle: 'The Great Gatsby',
        imageUrl: 'https://res.cloudinary.com/sparing/image/upload/v1725521014/iblfffkyj1ixriaunq6g.jpg',
        characterName: 'Jay Gatsby',
        id: '66d95d6358a2c9ec13cdddd3'
    },
]
</script>