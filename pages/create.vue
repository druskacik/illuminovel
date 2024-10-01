<template>
  <div>
    <UContainer>
      <div v-if="isLoading">Loading...</div>
      <div v-else>
        <div class="pt-10 pb-10">
          <UContainer>
            <h1 class="text-3xl font-bold text-center mb-12">Character Illustrations For <i>{{ bookInfo.title }}</i></h1>
            <div v-if="isPending">
              <p>The generation of first character might take a few minutes, please be patient. The url with results was sent to the email address you provided in the checkout process.</p>
            </div>
            <div>
              <ImageGallery :characters="characters" :loading="isPending"/>
            </div>
          </UContainer>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup>
const route = useRoute();
const sessionId = route.query.session_id;

const characters = ref([]);
const isLoading = ref(true);
const isPending = ref(true);
const bookInfo = ref(null);

const fetchCheckoutSession = async () => {
  let retry = false;
  try {
    const response = await $fetch('/api/checkout-session-success', {
      query: { session_id: sessionId },
    });

    if (response.status === 'completed') {
      console.log('session completed', response)
      characters.value = response.characters
      bookInfo.value = response.bookInfo
    } else {
      console.log('session pending', response)
      bookInfo.value = response.bookInfo;
      isLoading.value = false;
      const streamResponse = await $fetch('/api/stream-session-images', {
        query: { session_id: sessionId },
        responseType: 'stream'
      });
      const reader = streamResponse.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        let chunkParts = chunk.split('\n');
        chunkParts = chunkParts.filter(part => part.trim() !== '');

        for (const chunkPart of chunkParts) {
          console.log('chunkPart', chunkPart)
          const obj = JSON.parse(chunkPart);

          if (obj.status === 'failed')  {
            retry = true;
          } else {
            characters.value.push(obj);
          }
        }
      }
    }
  } catch (err) {
    console.log(err)
  } finally {
    if (!retry) {
      isLoading.value = false;
      isPending.value = false;
    } else {
      return await fetchCheckoutSession();
    }
  }
};

onMounted(() => {
  if (sessionId) {
    fetchCheckoutSession();
  }
});

// You might want to redirect if there's no session ID
if (!sessionId) {
  navigateTo('/');
}
</script>
