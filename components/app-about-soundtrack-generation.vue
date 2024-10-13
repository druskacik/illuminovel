<template>
    <section class="mt-16">
        <h2 class="text-3xl font-bold mb-6 text-center">How does it work?</h2>
        <p class="text-lg mb-4">
            The most important of the soundtrack generation is a sufficiently large database of music tracks described in natural language. Currently, the database contains 15103 mostly classical music pieces by 436 different composers. Expanding the database will be the main focus of the further development of this project.
        </p>
        <p class="text-lg mb-4">
            The tracks descriptions are encoded as vector embeddings.
            When generating a „soundtrack“, an LLM is tasked to suggest what kind of music would be suitable for the book in question,
            and this description is transformed into embeddings as well.
            Since the LLM is provided only the name and author of the literary work,
            it is expected that this process will work well only for famous-enough books that are sufficiently represented in the training corpus.
            For less known or recent books, the LLM will be prone to hallucinations.
            In the future I plan to include the whole book content (e.g. <a-link href="https://ai.google.dev/gemini-api" target="_blank">Gemini</a-link> would be more than capable for this challenge),
            similarly as in the illustrations part of this project – this would overcome the under-representation issue.
        </p>
        <p class="text-lg mb-4">
            At this point, the soundtracks are very hit-or-miss, but it serves well enough the purpose of creating a suitable playlists
            for those of us who like to listen to music while reading.
            If you have any suggestions for this project, you’re welcome to contact me <a-link href="https://t.me/rdruska" target="_blank">via Telegram</a-link> or at robert dot druska at gmail dot com.
        </p>
    </section>
</template>