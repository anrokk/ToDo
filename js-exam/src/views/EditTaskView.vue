<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useTodoStore } from '@/stores/todoStore';
import { useAuthStore } from '@/stores/auth';
import { useProhibitedWordStore } from '@/stores/prohibitedWordStore';
import type { TodoTaskUpdate, TodoTask } from '@/types';

const route = useRoute();
const router = useRouter();
const todoStore = useTodoStore();
const authStore = useAuthStore();
const prohibitedWordStore = useProhibitedWordStore();

const taskId = ref<string | null>(null);

const taskName = ref('');
const selectedCategoryId = ref<string>('');
const selectedPriorityId = ref<string>('');
const dueDt = ref<string>('');

const taskToEdit = computed(() => todoStore.selectedTaskForEdit);
const isLoading = computed(() => todoStore.isLoadingTasks);
const error = computed(() => todoStore.error);
const categories = computed(() => todoStore.categories);
const priorities = computed(() => todoStore.priorities);

const loadFormData = (task: TodoTask | null) => {
    if (task) {
        taskName.value = task.taskName || '';
        selectedCategoryId.value = task.todoCategoryId;
        selectedPriorityId.value = task.todoPriorityId;
        dueDt.value = task.dueDt ? new Date(task.dueDt).toISOString().split('T')[0] : '';
    }
};

onMounted(async () => {
  const idFromRoute = route.params.id;
  if (typeof idFromRoute === 'string') {
    taskId.value = idFromRoute;
    if (authStore.isAuthenticated) {
      await todoStore.getTaskForEdit(taskId.value); 
      if (todoStore.categories.length === 0) await todoStore.fetchTodoCategories();
      if (todoStore.priorities.length === 0) await todoStore.fetchTodoPriorities();
    } else {
      router.push({ name: 'login' });
    }
  } else {
    todoStore.error = "Invalid task ID provided.";
    router.push({ name: 'todos' });
  }
});

watch(taskToEdit, (newTaskData) => {
    if (newTaskData && newTaskData.id == taskId.value) {
        loadFormData(newTaskData);
    }
}, { immediate: true });

const handleSubmit = async () => {
    if (!taskId.value) {
        todoStore.error = "Task ID is not set.";
        return;
    }

    if (!taskName.value.trim()) {
        todoStore.error = "Task name cannot be empty.";
        return;
    }

    if (prohibitedWordStore.isProhibited(taskName.value)) {
        todoStore.error = "Task name contains prohibited words.";
    }

    if (!selectedCategoryId.value || !selectedPriorityId.value) {
        todoStore.error = "Category and Priority must be selected.";
        return;
    }

    if (!taskToEdit.value) {
        todoStore.error = "No task data available for editing.";
        return;
    }

    const taskUpdateData: TodoTaskUpdate = {
    id: taskId.value,
    taskName: taskName.value,
    todoCategoryId: selectedCategoryId.value,
    todoPriorityId: selectedPriorityId.value,
    dueDt: dueDt.value ? new Date(dueDt.value).toISOString() : null,
    isCompleted: taskToEdit.value.isCompleted,
    isArchived: taskToEdit.value.isArchived,
    taskSort: taskToEdit.value.taskSort, };

    try {
        const updatedTask = await todoStore.updateTask(taskId.value, taskUpdateData);
        if (updatedTask) {
            router.push({ name: 'todos' });
        }
    } catch (error) {
        console.error("Error updating task:", error);
    }
};
</script>


<template>
    <div class="edit-task-view">
        <div class="form-container">
            <h2 class="view-title">Edit Task</h2>
            <div v-if="isLoading && !taskToEdit" class="loading-message">Loading task details...</div>

            <form @submit.prevent="handleSubmit" class="item-form" v-if="taskToEdit && !isLoading">
                 <div class="form-group">
                    <label for="taskName">Task Name</label>
                    <input
                        type="text"
                        id="taskName"
                        v-model="taskName"
                        required
                        :disabled="isLoading"
                        class="form-control"
                    />
                </div>

                <div class="row">
                    <div class="col-md-6 form-group">
                        <label for="editSelectedCategoryId">Category</label>
                        <select class="form-select" id="editSelectedCategoryId" v-model="selectedCategoryId" required :disabled="isLoading">
                            <option disabled value="">Select category</option>
                            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                                {{ cat.categoryName }}
                            </option>
                        </select>
                    </div>
                    <div class="col-md-6 form-group">
                        <label for="editSelectedPriorityId">Priority</label>
                        <select class="form-select" id="editSelectedPriorityId" v-model="selectedPriorityId" required :disabled="isLoading">
                            <option disabled value="">Select priority</option>
                            <option v-for="prio in priorities" :key="prio.id" :value="prio.id">
                                {{ prio.priorityName }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="editDueDt">Due Date (Optional)</label>
                    <input type="date" class="form-control" id="editDueDt" v-model="dueDt" />
                </div>

                <div v-if="error" class="error-message">
                    <p>{{ error }}</p>
                </div>

                <button type="submit" class="submit-button" :disabled="isLoading">
                    <span v-if="isLoading" class="spinner"></span>
                    <span v-else>Save Changes</span>
                </button>
            </form>

            <div v-if="!taskToEdit && !isLoading && error" class="error-message">
               <p>{{ error || "Could not load task data for editing." }}</p>
               <p><RouterLink :to="{ name: 'todos' }" class="back-link">Back to Todo List</RouterLink></p>
            </div>
             <div class="back-link-container" v-if="taskToEdit && !isLoading">
                <RouterLink :to="{ name: 'todos' }" class="back-link">&laquo; Back to Todo List</RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.edit-task-view {
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
  max-width: 700px; 
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

.item-form .form-control,
.item-form .form-select {
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
.item-form .form-select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
}

.item-form input:focus,
.item-form select:focus {
  border-color: #4299e1;
  background-color: #fff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.submit-button {
  width: 100%;
  padding: 0.9rem 1rem;
  background-image: linear-gradient(to right, #4f46e5 0%, #7c3aed 100%);
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
  background-image: linear-gradient(to right, #4338ca 0%, #6d28d9 100%);
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

.loading-message {
  padding: 1rem;
  text-align: center;
  color: #555;
}

.back-link-container {
    margin-top: 2rem;
    text-align: center;
}
.back-link {
    color: #4f46e5; font-weight: 500; text-decoration: none; font-size: 0.9rem;
}
.back-link:hover { text-decoration: underline; }
</style>