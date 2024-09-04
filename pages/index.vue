<template>
    <div class="pt-20 pb-20">
        <UContainer>
            <div class="landing-content">
                <h1 class="text-5xl font-bold text-center mb-6">
                    Bring Book Characters to Life with AI
                </h1>
                <p class="text-xl text-center mb-8">
                    Upload your favorite book and watch as AI imagines the characters for you.
                </p>
                <UCard class="max-w-md mx-auto">
                    <UForm @submit="handleSubmit">
                        <UFormGroup label="Start your journey">
                            <UInput ref="fileInput" type="file" accept=".pdf,.epub" placeholder="Choose your book file"
                                @change="onFileChange" />
                        </UFormGroup>
                        <UButton type="submit" class="w-full mt-4" color="primary" size="lg" :loading="isLoading"
                            :disabled="!selectedFile">
                            {{ isLoading ? 'Generating...' : 'Generate Illustrations' }}
                        </UButton>
                    </UForm>
                </UCard>
                <div v-if="isLoading" class="mt-4 text-center">
                    <p class="text-lg text-amber-600 font-semibold">
                        Generation in progress. This may take a few minutes.
                    </p>
                    <p class="text-md text-amber-600">
                        Please do not close this tab.
                    </p>
                </div>
                <div v-if="characters.length > 0 || isLoading" class="mt-8">
                    <h2 class="text-2xl font-semibold mb-4">Generated Illustrations</h2>
                    <div v-if="!isLoading && sharedId" class="mt-4 mb-4 flex items-center">
                        <p class="mr-2">Share:</p>
                        <UButton @click="copyShareLink" :icon="linkCopied ? 'i-heroicons-check' : 'i-heroicons-clipboard'" color="primary" variant="soft" :disabled="linkCopied">
                            {{ linkCopied ? 'Link copied' : 'Copy link' }}
                        </UButton>
                    </div>
                    <ImageGallery :characters="characters" :loading="isLoading" />
                </div>
            </div>
        </UContainer>
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
    </div>
</template>

<script setup>
import { ref } from 'vue';

const fileInput = ref(null);
const selectedFile = ref(null);
const characters = ref([]);
const isLoading = ref(false);
const sharedId = ref(null);
const linkCopied = ref(false);

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
    }
]


const onFileChange = (files) => {
    console.log('files', files);
    selectedFile.value = files[0];
};

const handleSubmit = async (event) => {
    event.preventDefault();
    characters.value = [];
    sharedId.value = null;
    if (selectedFile.value) {
        const file = selectedFile.value;
        try {
            isLoading.value = true;
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64File = e.target.result.split(',')[1];
                try {
                    const response = await $fetch('/api/get-images', {
                    // const response = await $fetch('/api/get-images-dummy', {
                        method: 'POST',
                        body: {
                            name: file.name,
                            file: base64File,
                            fileType: file.type,
                        },
                        responseType: 'stream',
                    });

                    console.log('response', response);

                    const reader = response.getReader()
                    const decoder = new TextDecoder()

                    while (true) {
                        const { done, value } = await reader.read()
                        if (done) break

                        let chunk = decoder.decode(value)
                        chunk = JSON.parse(chunk)
                        if (!chunk._id) {
                            characters.value.push(chunk)
                        } else {
                            sharedId.value = chunk._id;
                        }
                    }
                } catch (error) {
                    console.error('Error sending file to server:', error);
                } finally {
                    isLoading.value = false;
                }
            };
            reader.onerror = (error) => {
                console.error('Error reading file:', error);
                isLoading.value = false;
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error processing file:', error);
            isLoading.value = false;
        }
    } else {
        console.log('No file selected');
    }
};

const shareResults = () => {
    if (sharedId.value) {
        navigateTo(`/share/${sharedId.value}`);
    }
};

const shareLink = computed(() => {
    return sharedId.value ? `https://illuminovel.com/share/${sharedId.value}` : null;
});

const copyShareLink = () => {
    if (shareLink.value) {
        navigator.clipboard.writeText(shareLink.value);
        linkCopied.value = true;
        setTimeout(() => {
            linkCopied.value = false;
        }, 2000);
    }
};
</script>

<style scoped>

</style>