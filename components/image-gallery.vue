<template>
  <div class="image-gallery">
    <div class="image-grid">
      <div v-for="(character, index) in characters" :key="index" class="image-tile" @click="openImage(index)">
        <img :src="character.imageUrl" :alt="`Image of ${character.name}`" />
        <div class="character-name">{{ character.name }}</div>
      </div>
      <div v-if="loading" class="image-tile loading-tile">
        <div class="loading-indicator"></div>
      </div>
    </div>
    <div v-if="selectedImageIndex !== null" class="fullscreen-overlay" @click="closeImage" @keydown="handleKeydown">
      <div class="fullscreen-image-container">
        <img :src="characters[selectedImageIndex].imageUrl" :alt="`Fullscreen image of ${characters[selectedImageIndex].name}`" />
        <div class="character-name-fullscreen">{{ characters[selectedImageIndex].name }}</div>
        <button class="close-button" @click.stop="closeImage">&times;</button>
        <button v-if="selectedImageIndex > 0" class="nav-button left" @click.stop="navigateImage(-1)">&lt;</button>
        <button v-if="selectedImageIndex < characters.length - 1" class="nav-button right" @click.stop="navigateImage(1)">&gt;</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  characters: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const selectedImageIndex = ref(null);

const openImage = (index) => {
  selectedImageIndex.value = index;
};

const closeImage = () => {
  selectedImageIndex.value = null;
};

const navigateImage = (direction) => {
  const newIndex = selectedImageIndex.value + direction;
  if (newIndex >= 0 && newIndex < props.characters.length) {
    selectedImageIndex.value = newIndex;
  }
};

const handleKeydown = (event) => {
  if (event.key === 'ArrowLeft') {
    navigateImage(-1);
  } else if (event.key === 'ArrowRight') {
    navigateImage(1);
  } else if (event.key === 'Escape') {
    closeImage();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.image-gallery {
  width: 100%;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.image-tile {
  aspect-ratio: 1 / 1;
  overflow: hidden;
  cursor: pointer;
  position: relative;
}

.image-tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-tile:hover img {
  transform: scale(1.05);
}

.character-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  padding: 0.5rem;
  text-align: center;
}

.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.fullscreen-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.fullscreen-image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.character-name-fullscreen {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  padding: 1rem;
  text-align: center;
  font-size: 1.5rem;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  font-size: 2rem;
  padding: 1rem;
  cursor: pointer;
}

.nav-button.left {
  left: 20px;
}

.nav-button.right {
  right: 20px;
}

.loading-tile {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  cursor: default;
}

.loading-indicator {
  width: 50px;
  height: 50px;
  border: 5px solid #e0e0e0;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
