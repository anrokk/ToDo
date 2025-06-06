<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTodoStore } from '@/stores/todoStore';
import { useProhibitedWordStore } from '@/stores/prohibitedWordStore';
import { useRouter } from 'vue-router';
import type { TodoPriorityCreate } from '@/types';

const todoStore = useTodoStore();
const prohibitedWordStore = useProhibitedWordStore();
const router = useRouter();

const priorityName = ref('');

const isLoading = computed(() => todoStore.isLoadingPriorities);
const error = computed(() => todoStore.error);

onMounted(() => {
    todoStore.clearError();
});

const handleSubmit = async () => {
    if (!priorityName.value.trim()) {
        todoStore.error = "Priority name cannot be empty.";
        return;
    }
    if (prohibitedWordStore.isProhibited(priorityName.value)) {
        todoStore.error = "Priority name contains prohibited words. Please choose a different name.";
        return;
    }

    const priorityData: TodoPriorityCreate = {
        priorityName: priorityName.value.trim(),
        prioritySort: Math.floor(Date.now() / 1000), 
    };

    const createdPriority = await todoStore.createPriority(priorityData);
    if (createdPriority) {
        priorityName.value = ''; 
        todoStore.clearError();
        router.push({ name: 'todos'})
    }
};
</script>

<template>
    <div class="create-view">
        <div class="form-container">
            <h2 class="view-title">Add a New Priority</h2>
            <form @submit.prevent="handleSubmit" class="item-form">
                <div class="form-group">
                    <label for="priorityName">Priority Name</label>
                    <input
                        type="text"
                        id="priorityName"
                        v-model="priorityName"
                        required
                        :disabled="isLoading"
                    />
                </div>

                <div v-if="error" class="error-message">
                    <p>{{ error }}</p>
                </div>

                <button type="submit" class="submit-button" :disabled="isLoading">
                    <span v-if="isLoading" class="spinner"></span>
                    <span v-else>Add Priority</span>
                </button>
            </form>
            <div class="back-link-container">
                <RouterLink :to="{ name: 'todos' }" class="back-link">&laquo; Back to ToDo List</RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.create-view {
  display: flex;
  justify-content: center;
  align-items: center; 
  padding: 2rem;
  background-color: #f4f7f6;
  flex-grow: 1;
}

.form-container {
  background-color: #ffffff;
  padding: 2.5rem 3rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 500px;
  border: 1px solid #e2e8f0;
}

.view-title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  font-weight: 600;
  color: #2d3748;
}

.item-form .form-group {
  margin-bottom: 2rem;
}

.item-form label {
  display: block;
  margin-bottom: 0.6rem;
  color: #4a5568;
  font-weight: 500;
  font-size: 0.875rem;
}

.item-form input[type="text"] {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 0.95rem;
  color: #2d3748;
  background-color: #f7fafc;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.item-form input::placeholder {
  color: #a0aec0;
}

.item-form input:focus {
  border-color: #4299e1;
  background-color: #fff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.submit-button {
  width: 100%;
  padding: 0.9rem 1rem;
  background-image: linear-gradient(to right, #38a169 0%, #2f855a 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-image 0.3s ease, transform 0.1s ease;
  margin-top: 1rem;
}

.submit-button:hover {
  background-image: linear-gradient(to right, #2f855a 0%, #276749 100%);
  transform: translateY(-1px);
}

.submit-button:disabled {
  background-image: none;
  background-color: #a0aec0;
  cursor: not-allowed;
}

.spinner {
  display: inline-block; width: 1.2em; height: 1.2em; border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%; border-top-color: #fff; animation: spin 1s ease-in-out infinite;
  margin-right: 0.5em; vertical-align: middle;
}
@keyframes spin { to { transform: rotate(360deg); } }

.error-message {
  background-color: #fed7d7; color: #c53030; border: 1px solid #fbb6ce;
  padding: 0.8rem 1rem; border-radius: 6px; margin-top: 1rem; margin-bottom: 1rem;
  text-align: center; font-size: 0.875rem;
}
.error-message p { margin: 0; }

.back-link-container {
    margin-top: 2rem;
    text-align: center;
}
.back-link {
    color: #4f46e5; font-weight: 500; text-decoration: none; font-size: 0.9rem;
}
.back-link:hover { text-decoration: underline; }
</style>