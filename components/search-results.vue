<template>
    <div class="grid grid-cols-1 gap-4">
        <UCard v-for="book in books" :key="book.ID">
            <div class="flex flex-col md:flex-row">
                <div class="w-full md:w-1/3">
                    <!-- TODO: use image proxy instead of referrerpolicy="no-referrer" -->
                    <img :src="book.coverUrl" :alt="book.title" referrerpolicy="no-referrer" class="w-full h-64 object-contain">
                </div>
                <div class="w-full md:w-2/3 p-4 flex flex-col justify-between">
                    <div>
                        <h3 class="text-lg font-semibold">{{ book.title }}</h3>
                        <p class="text-sm text-gray-600">{{ book.author }}</p>
                    </div>
                    <div class="flex flex-col md:flex-row mt-4 space-y-2 md:space-y-0 md:space-x-2">
                        <!-- TODO: wishlist logic -->
                        <!-- <UTooltip text="The most wishlisted books may be illustrated by donors." :popper="{ arrow: true }">
                            <UButton
                                class="w-full md:w-auto"
                                color="rose"
                                variant="soft"
                                icon="i-heroicons-heart"
                                :disabled="loadingBook === book.ID"
                            >
                                Add to wishlist
                            </UButton>
                        </UTooltip> -->
                        <UButton
                            class="w-full md:w-auto"
                            color="primary"
                            variant="solid"
                            icon="i-heroicons-sparkles"
                            @click="openStripeCheckout(book)"
                            :loading="loadingBook === book.ID"
                            :disabled="loadingBook !== null"
                        >
                            {{ loadingBook === book.id ? 'Processing...' : 'Illustrate book for $2' }}
                        </UButton>
                    </div>
                </div>
            </div>
        </UCard>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    books: {
        type: Array,
        required: true
    }
});

const loadingBook = ref(null);

const openStripeCheckout = async (book) => {
    loadingBook.value = book.ID;
    try {
        const { url } = await $fetch('/api/create-checkout-session', {
            method: 'POST',
            body: JSON.stringify({
                book,
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
            console.error('Failed to create checkout session');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        loadingBook.value = null;
    }
};
</script>