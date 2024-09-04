<template>
  <div class="pt-20 pb-20">
    <UContainer>
      <h1 class="text-4xl font-bold mb-6">About</h1>
      <p class="text-lg mb-4">
        The project uses <a href="https://ai.google.dev/gemini-api" target="_blank">Gemini</a> to extract book characters with their description
        and <a href="https://getimg.ai/text-to-image?via=flux1io" target="_blank">Flux</a> to generate the illustrations.
      </p>
      <!-- <p class="text-lg mb-4">
        Simply upload your book, and watch as our advanced AI technology creates unique illustrations for the main characters, allowing you to see them as you've always imagined.
      </p>
      <h2 class="text-2xl font-semibold mt-8 mb-4">How It Works</h2>
      <ol class="list-decimal list-inside text-lg mb-6">
        <li class="mb-2">Upload your book file (PDF or EPUB format)</li>
        <li class="mb-2">Our AI analyzes the text and identifies key characters</li>
        <li class="mb-2">The AI generates detailed descriptions of each character</li>
        <li class="mb-2">These descriptions are transformed into stunning visual illustrations</li>
        <li>View and share your personalized character gallery</li>
      </ol> -->
    </UContainer>
  </div>
</template>

<script setup>
// No additional setup needed for this simple about page
</script>

<style scoped>
a {
  color: #3498db;
  text-decoration: underline;
}

a:hover {
  color: #2980b9;
}
</style>

