<script setup lang="ts">
import { useProhibitedWordStore } from '@/stores/prohibitedWordStore';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { computed, ref, onMounted } from 'vue';


const prohibitedWordStore = useProhibitedWordStore();
const authStore = useAuthStore();
const router = useRouter();

const newWord = ref('');

const prohibitedWords = computed(() => prohibitedWordStore.getProhibitedWords);
const addWordAction = (word: string) => prohibitedWordStore.addProhibitedWord(word);
const removeWordAction = (word: string) => prohibitedWordStore.removeProhibitedWord(word);
const resetAction = () => prohibitedWordStore.resetToDefault();

onMounted(() => {
    if (!authStore.isAdmin){
        router.push({ name: 'home' });
    }
});

const handleAddWord = () => {
    if (newWord.value.trim()) {
        addWordAction(newWord.value);
        newWord.value = '';
    }
};

const handleRemoveWord = (word: string) => {
    removeWordAction(word);
};

const handleReset = () => {
    resetAction();
}


</script>

<template>
    <div class="admin-view">
        <div class="container">
            <h1 class="view-title">Manage Prohibited Words</h1>
            <p class="view-subtitle">Words added here will be blocked from task, category & priority names (case-insensitive). Changes are saved to local storage.</p>

            <div class="card shadow-sm mb-4">
                <div class="card-body">
                    <h5 class="card-title">Add a New Prohibited Word</h5>
                    <form @submit.prevent="handleAddWord" class="add-word-form">
                        <div class="input-group">
                            <input
                                type="text"
                                class="form-control"
                                v-model="newWord"
                                placeholder="Enter a word to prohibit"
                            />
                            <button type="submit" class="btn btn-primary">Add Word</button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="card shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="card-title mb-0">Current List</h5>
                        <button @click="handleReset" class="btn btn-sm btn-outline-warning">Reset to Default</button>
                    </div>

                    <ul v-if="prohibitedWords.length > 0" class="list-group list-group-flush">
                        <li v-for="word in prohibitedWords" :key="word" class="list-group-item d-flex justify-content-between align-items-center">
                            <span class="word-text">{{ word }}</span>
                            <button @click="handleRemoveWord(word)" class="btn btn-sm btn-danger">&times;</button>
                        </li>
                    </ul>
                    <p v-else class="text-muted">The prohibited word list is currently empty.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.admin-view {
  padding: 2rem;
  background-color: #f8f9fa; 
  flex-grow: 1;
}

.container {
  max-width: 800px; 
  margin-left: auto;
  margin-right: auto;
}

.view-title {
  text-align: center;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #343a40;
}

.view-subtitle {
  text-align: center;
  color: #6c757d;
  margin-bottom: 2.5rem;
}

.card-title {
  font-weight: 500;
}

.add-word-form .input-group {
    display: flex;
}
.add-word-form .form-control {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    flex-grow: 1;
}
.add-word-form .btn {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

.list-group-item {
    padding-left: 0;
    padding-right: 0;
}
.word-text {
    font-family: 'Courier New', Courier, monospace;
    font-size: 1.05rem;
}

</style>
