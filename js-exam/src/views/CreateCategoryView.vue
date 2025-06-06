<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useTodoStore } from '@/stores/todoStore';
import { useProhibitedWordStore } from '@/stores/prohibitedWordStore';
import { useRouter } from 'vue-router';
import type { TodoCategoryCreate } from '@/types';

const todoStore = useTodoStore();
const prohibitedWordStore = useProhibitedWordStore();
const router = useRouter();

const categoryName = ref('');
const categorySort = ref(0);
const tag = ref<string | null>(null);

const isLoading = computed(() => todoStore.isLoadingCategories);
const error = computed(() => todoStore.error);

onMounted(() => {
    todoStore.clearError();
});

const handleSubmit = async () => {
    if (!categoryName.value.trim()) {
        todoStore.error = "Category name is required.";
        return;
    }

    if (prohibitedWordStore.isProhibited(categoryName.value)) {
        todoStore.error = "Category name contains prohibited words.";
        return;
    }

    const categoryData: TodoCategoryCreate = {
        categoryName: categoryName.value.trim(),
        categorySort: categorySort.value,
        tag: tag.value || undefined
    };

    const createdCategory = await todoStore.createCategory(categoryData);
    if (createdCategory) {
        categoryName.value = '';
        categorySort.value = 0;
        tag.value = null;
        todoStore.clearError();
        router.push({ name: 'todos' })
    }
}

</script>

<template>
    <div class="create-category-view">
        <div class="form-container">
            <h2 class="view-title">Add New ToDo Category</h2>
            <form @submit.prevent="handleSubmit" class="category-form">
                <div class="form-group">
                    <label for="categoryName">Category Name</label>
                    <input
                        type="text"
                        id="categoryName"
                        v-model="categoryName"
                        required
                        placeholder="Category"
                        :disabled="isLoading"
                    />
                </div>

                <div class="form-group">
                    <label for="categorySort">Sort Order</label>
                    <input
                        type="number"
                        id="categorySort"
                        v-model.number="categorySort"
                        required
                        :disabled="isLoading"
                    />
                    <small class="form-text text-muted">Determines the order in lists (lower numbers first).</small>
                </div>

                <div class="form-group">
                    <label for="tag">Tag (Optional)</label>
                    <input
                        type="text"
                        id="tag"
                        v-model="tag"
                        placeholder=""
                        :disabled="isLoading"
                    />
                </div>

                <div v-if="error" class="error-message">
                    <p>{{ error }}</p>
                </div>

                <button type="submit" class="submit-button" :disabled="isLoading">
                    <span v-if="isLoading" class="spinner"></span>
                    <span v-else>Add Category</span>
                </button>
            </form>
             <div class="back-link-container">
                <RouterLink :to="{ name: 'todos' }" class="back-link">&laquo; Back to Todos</RouterLink>
            </div>
        </div>
    </div>
</template>


<style scoped>
.create-category-view {
  display: flex;
  justify-content: center;
  align-items: flex-start; 
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
  max-width: 600px; 
  margin-left: auto;
  margin-right: auto;
  border: 1px solid #e2e8f0;
}

.view-title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  font-weight: 600;
  color: #2d3748;
}

.category-form .form-group {
  margin-bottom: 1.75rem;
}

.category-form label {
  display: block;
  margin-bottom: 0.6rem;
  color: #4a5568;
  font-weight: 500;
  font-size: 0.875rem;
}

.category-form input[type="text"],
.category-form input[type="number"] {
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

.category-form input::placeholder {
  color: #a0aec0;
}

.category-form input:focus {
  border-color: #4299e1;
  background-color: #fff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.form-text.text-muted {
    font-size: 0.8rem;
    color: #718096;
    margin-top: 0.25rem;
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
  letter-spacing: 0.025em;
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
  display: inline-block;
  width: 1.2em;
  height: 1.2em;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5em;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  background-color: #fed7d7;
  color: #c53030;
  border: 1px solid #fbb6ce;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  margin-top: 1rem;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.875rem;
}
.error-message p { margin: 0; }

.back-link-container {
    margin-top: 2rem;
    text-align: center;
}
.back-link {
    color: #4f46e5;
    font-weight: 500;
    text-decoration: none;
    font-size: 0.9rem;
}
.back-link:hover {
    text-decoration: underline;
}
</style>