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
                <UTabs :items="items" class="w-full">
                    <template #item="{ item }">
                        <div class="mt-8">
                            <template v-if="item.key === 'search'">
                                <UCard class="max-w-md mx-auto">
                                    <UForm @submit="handleSearch">
                                        <UInput v-model="searchQuery" placeholder="Search for a book..." />
                                        <UButton icon="i-heroicons-magnifying-glass" type="submit" class="w-full mt-4"
                                            color="primary" size="lg" :loading="isLoading">
                                            {{ isLoading ? 'Searching...' : 'Search Libgen Library' }}
                                        </UButton>
                                    </UForm>
                                </UCard>
                                <div v-if="books">
                                    <h2 class="text-2xl font-semibold mt-4 mb-4">Search Results for <i>{{
                                            searchQuerySubmitted }}</i></h2>
                                    <p v-if="books.length === 0">No books found :(</p>
                                    <SearchResults v-else :books="books" />
                                </div>
                            </template>
                            <template v-if="item.key === 'upload'">
                                <UCard class="max-w-md mx-auto">
                                    <UForm @submit="openStripeCheckout">
                                        <UFormGroup label="Supported formats: PDF, EPUB">
                                            <UInput ref="fileInput" type="file" accept=".pdf,.epub"
                                                placeholder="Choose your book file" @change="onFileChange" />
                                        </UFormGroup>
                                        <div v-if="!isValidFileType && selectedFile"
                                            class="mt-2 text-center text-red-500">
                                            Please select a PDF or EPUB file.
                                        </div>
                                        <UButton icon="i-heroicons-sparkles" type="submit" class="w-full mt-4"
                                            color="primary" size="lg" :loading="isLoading"
                                            :disabled="!selectedFile || !isValidFileType">
                                            {{ isLoading ? 'Processing...' : 'Illustrate book for $2' }}
                                        </UButton>
                                    </UForm>
                                </UCard>
                            </template>
                        </div>
                    </template>
                </UTabs>
            </div>
        </UContainer>
        <FeaturedCreations />
    </div>
    <UNotifications />
</template>

<script setup>
useSeoMeta({
    title: 'Illuminovel - AI Book Illustrations',
    ogTitle: 'Illuminovel - AI Book Illustrations',
    description: 'Generate AI illustrations of your favorite book characters.',
    ogDescription: 'Generate AI illustrations of your favorite book characters.',
})

const toast = useToast()

const searchQuery = ref('');
const searchQuerySubmitted = ref('');
const books = ref(null);
const fileInput = ref(null);
const selectedFile = ref(null);
const isLoading = ref(false);
const isValidFileType = ref(false);

const items = [
    {
        key: 'search',
        label: 'Search Libgen Library',
        icon: 'i-heroicons-magnifying-glass',
        description: 'Search for a book and generate illustrations for it.',
    },
    {
        key: 'upload',
        label: 'Upload your own book',
        icon: 'i-heroicons-paper-clip',
        description: 'Upload a PDF or EPUB file and generate illustrations for it.',
    }
]

const onFileChange = (files) => {
    selectedFile.value = files[0];
    isValidFileType.value = validateFileType(selectedFile.value);
};

const validateFileType = (file) => {
    if (!file) return false;
    const validTypes = ['application/pdf', 'application/epub+zip'];
    return validTypes.includes(file.type);
};

const handleSearch = async () => {
    isLoading.value = true;
    const title = searchQuery.value;
    searchQuerySubmitted.value = title;

    try {
        const response = await $fetch(`/api/search-book?query=${encodeURIComponent(title)}`, {
            method: 'GET',
        });

        books.value = response;
    } catch (error) {
        toast.add({
            title: 'Error',
            description: error.message,
            color: 'rose',
            timeout: 0,
        });
    } finally {
        isLoading.value = false;
    }
}

const openStripeCheckout = async (event) => {
    event.preventDefault();
    if (!isValidFileType.value) {
        console.log('Invalid file type');
        return;
    }
    isLoading.value = true;
    if (selectedFile.value) {
        isLoading.value = true;
        const file = selectedFile.value;
        try {
            const extension = getFileExtension(file.type);
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const base64File = e.target.result.split(',')[1];
                    await $fetch('/api/upload-book', {
                        method: 'POST',
                        body: {
                            name: file.name,
                            file: base64File,
                            extension: extension,
                        },
                    });
                    
                    const { url } = await $fetch('/api/create-checkout-session', {
                        method: 'POST',
                        body: JSON.stringify({
                            book: {
                                filename: file.name,
                                title: file.name,
                                extension: extension,
                            }
                        }),
                    });
    
                    if (url) {
                        await navigateTo(url, {
                            external: true,
                            open: {
                                target: '_blank',
                            }
                        });
                    } else {
                        throw new Error('Failed to create checkout session');
                    }
                } catch (error) {
                    console.error('Error processing file:', error);
                    toast.add({
                        title: 'Error',
                        description: 'An error occurred while processing your file.',
                        color: 'rose',
                    });
                } finally {
                    isLoading.value = false;
                }
            };
            reader.onerror = (error) => {
                console.error('Error reading file:', error);
                isLoading.value = false;
                toast.add({
                    title: 'Error',
                    description: 'An error occurred while reading your file.',
                    color: 'rose',
                });
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error processing file:', error);
            isLoading.value = false;
            toast.add({
                title: 'Error',
                description: 'An error occurred while preparing to read your file.',
                color: 'rose',
            });
        }
    }
};

const getFileExtension = (fileType) => {
    if (fileType === 'application/pdf') {
        return 'pdf';
    } else if (fileType === 'application/epub+zip') {
        return 'epub';
    }
    return null;
}
</script>

<style scoped></style>