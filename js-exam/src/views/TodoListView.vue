<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useTodoStore, type TodoFilter } from '@/stores/todoStore'; 
import { useAuthStore } from '@/stores/auth';
import { useRouter, RouterLink } from 'vue-router';
import type { TodoTask, TodoCategory, TodoPriority, TodoTaskCreate } from '@/types';

const todoStore = useTodoStore();
const authStore = useAuthStore();
const router = useRouter();

const showAddForm = ref(false);
const newTaskName = ref('');
const newSelectedCategoryId = ref<string>('');
const newSelectedPriorityId = ref<string>('');
const newDueDt = ref<string | null>(null);

const filteredTasks = computed(() => todoStore.filteredTasks);
const categories = computed(() => todoStore.categories);
const priorities = computed(() => todoStore.priorities);
const isLoadingTasks = computed(() => todoStore.isLoadingTasks);
const isLoadingCategories = computed(() => todoStore.isLoadingCategories);
const isLoadingPriorities = computed(() => todoStore.isLoadingPriorities);
const error = computed(() => todoStore.error);

const filterCompleted = ref<boolean | null>(null); 
const filterArchived = ref<boolean>(false);     

onMounted(() => {
    filterCompleted.value = todoStore.currentFilter.completed;
    filterArchived.value = todoStore.currentFilter.archived ?? false;
});

const applyFilters = () => {
    todoStore.setFilter({
        completed: filterCompleted.value,
        archived: filterArchived.value
    });
};

watch([filterCompleted, filterArchived], () => {
    applyFilters();
});

onMounted(async () => {
    todoStore.clearError(); 
    if (authStore.isAuthenticated) {
        if (todoStore.tasks.length === 0) await todoStore.fetchTodoTasks();
        if (todoStore.categories.length === 0) await todoStore.fetchTodoCategories();
        if (todoStore.priorities.length === 0) await todoStore.fetchTodoPriorities();
    } else {
        router.push({ name: 'login' }); 
    }
});

const getCategoryName = (categoryId: string): string => {
    const category = categories.value.find(cat => cat.id === categoryId);
    return category?.categoryName || 'N/A';
};

const getPriorityName = (priorityId: string): string => {
    const priority = priorities.value.find(p => p.id === priorityId);
    return priority?.priorityName || 'N/A';
};

const handleToggleComplete = async (task: TodoTask) => {
    await todoStore.toggleTaskCompleted(task.id);
};

const handleToggleArchive = async (task: TodoTask) => {
    await todoStore.toggleTaskArchived(task.id);
};

const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
        await todoStore.deleteTask(taskId);
    }
};

const handleAddTask = async () => {
    if (!newTaskName.value.trim()) {
        todoStore.error = "Task name cannot be empty.";
        return;
    }
    if (!newSelectedCategoryId.value) {
        todoStore.error = "Please select a category.";
        return;
    }
    if (!newSelectedPriorityId.value) {
        todoStore.error = "Please select a priority.";
        return;
    }

    const taskData: TodoTaskCreate = {
        taskName: newTaskName.value.trim(),
        todoCategoryId: newSelectedCategoryId.value,
        todoPriorityId: newSelectedPriorityId.value,
        dueDt: newDueDt.value ? new Date(newDueDt.value).toISOString() : null,
    };

    const createdTask = await todoStore.createTask(taskData);
    if (createdTask) {
        newTaskName.value = '';
        newSelectedCategoryId.value = '';
        newSelectedPriorityId.value = '';
        newDueDt.value = null;
        showAddForm.value = false;
        todoStore.clearError(); 
    }
};

const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
};
</script>

<template>
    <div class="todo-list-view">
        <h1 class="view-title">My ToDo List</h1>

        <div class="controls-container">
          <div class="add-task-controls">
            <button @click="showAddForm = !showAddForm" class="btn btn-primary add-task-btn">
              {{ showAddForm ? 'Cancel Add Task' : 'Add New Task' }}
            </button>
          </div>
          <div class="management-links">
            <RouterLink :to="{ name: 'createCategory' }" class="btn btn-outline-secondary btn-sm">
              Add Category
            </RouterLink>
            <RouterLink :to="{ name: 'createPriority' }" class="btn btn-outline-secondary btn-sm">
              Add Priority
            </RouterLink>
          </div>
        </div>

        <div v-if="showAddForm" class="add-task-form card shadow-sm mb-4">
            <div class="card-body">
                <h3 class="card-title">New Task</h3>
                <form @submit.prevent="handleAddTask">
                    <div class="form-group">
                        <label for="newTaskName" class="form-label">Task Name</label>
                        <input type="text" class="form-control" id="newTaskName" v-model="newTaskName" required />
                    </div>
                    <div class="row">
                        <div class="col-md-6 form-group">
                            <label for="newSelectedCategoryId" class="form-label">Category</label>
                            <select class="form-select" id="newSelectedCategoryId" v-model="newSelectedCategoryId" required>
                                <option disabled value="">Select category</option>
                                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                                    {{ cat.categoryName }}
                                </option>
                            </select>
                             <div v-if="isLoadingCategories" class="loading-small">Loading categories...</div>
                        </div>
                        <div class="col-md-6 form-group"> 
                            <label for="newSelectedPriorityId" class="form-label">Priority</label>
                            <select class="form-select" id="newSelectedPriorityId" v-model="newSelectedPriorityId" required>
                                <option disabled value="">Select priority</option>
                                <option v-for="prio in priorities" :key="prio.id" :value="prio.id">
                                    {{ prio.priorityName }}
                                </option>
                            </select>
                            <div v-if="isLoadingPriorities" class="loading-small">Loading priorities...</div>
                        </div>
                    </div>
                    <div class="form-group"> 
                        <label for="newDueDt" class="form-label">Due Date (Optional)</label>
                        <input type="date" class="form-control" id="newDueDt" v-model="newDueDt" />
                    </div>
                    <button type="submit" class="btn btn-success add-task-submit-btn" :disabled="isLoadingTasks">
                        <span v-if="isLoadingTasks" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Add Task
                    </button>
                </form>
            </div>
        </div>

        <div class="filters card shadow-sm mb-4">
            <div class="card-body">
                <h4 class="card-title">Filters</h4>
                <div class="row">
                    <div class="col-md-6 form-group"> 
                        <label for="filterCompleted" class="form-label">Completion Status:</label>
                        <select id="filterCompleted" v-model="filterCompleted" class="form-select">
                            <option :value="null">All</option>
                            <option :value="false">Not Completed</option>
                            <option :value="true">Completed</option>
                        </select>
                    </div>
                    <div class="col-md-6 form-group"> 
                        <label for="filterArchived" class="form-label">Archive Status:</label>
                        <select id="filterArchived" v-model="filterArchived" class="form-select">
                            <option :value="false">Show Active</option>
                            <option :value="true">Show Archived</option>
                            <option :value="null">Show All (Active & Archived)</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="isLoadingTasks && filteredTasks.length === 0" class="loading-message">Loading tasks...</div>
        <div v-if="error" class="alert alert-danger error-message" role="alert">{{ error }}</div>

        <div v-if="!isLoadingTasks && filteredTasks.length === 0 && !error" class="info-message">
            No ToDo's found matching your criteria. Try adjusting filters or adding a new task!
        </div>

        <div class="task-list row" v-if="filteredTasks.length > 0">
            <div v-for="task in filteredTasks" :key="task.id" class="col-md-6 col-lg-4 mb-3">
                <div class="card task-item shadow-sm" :class="{ 'task-completed': task.isCompleted, 'task-archived': task.isArchived }">
                    <div class="card-body">
                        <h5 class="card-title" :style="{ 'text-decoration': task.isCompleted ? 'line-through' : 'none' }">
                            {{ task.taskName }}
                        </h5>
                        <p class="card-text">
                            <small>Category: {{ getCategoryName(task.todoCategoryId!) }}</small><br/>
                            <small>Priority: {{ getPriorityName(task.todoPriorityId!) }}</small><br/>
                            <small v-if="task.dueDt">Due: {{ formatDate(task.dueDt) }}</small>
                            <small v-else>No due date</small>
                        </p>
                        <div class="task-actions">
                            <button @click="handleToggleComplete(task)" class="btn btn-sm me-1" :class="task.isCompleted ? 'btn-warning' : 'btn-success'">
                                {{ task.isCompleted ? 'Undo' : 'Complete' }}
                            </button>
                            <button @click="handleToggleArchive(task)" class="btn btn-sm btn-secondary me-1">
                                {{ task.isArchived ? 'Unarchive' : 'Archive' }}
                            </button>
                            <button @click="handleDeleteTask(task.id)" class="btn btn-sm btn-danger">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.todo-list-view {
  padding: 1.5rem 2rem;
  max-width: 1200px; 
  margin: 0 auto;   
  width: 100%;     
}

.view-title {
  text-align: center;
  margin-bottom: 2.5rem;
  font-size: 2.25rem;
  font-weight: 600;
  color: #2d3748;
}

.controls-container {
    display: flex;
    justify-content: space-between; 
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap; 
}

.add-task-controls {
  margin-bottom: 0;
}

.management-links {
    display: flex;
    gap: 0.75rem; 
}

.management-links .btn-sm { 
  font-size: 0.85rem;
  padding: 0.4rem 0.8rem;
}

.add-task-btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.95rem;
    font-weight: 500;
    border-radius: 6px;
    background-image: linear-gradient(to right, #38a169 0%, #2f855a 100%);
    color: white;
    border: none;
    cursor: pointer;
    transition: background-image 0.3s ease, transform 0.1s ease;
}
.add-task-btn:hover {
  background-image: linear-gradient(to right, #2f855a 0%, #276749 100%);
  transform: translateY(-1px);
}
.add-task-btn:disabled {
  background-image: none;
  background-color: #a0aec0;
  cursor: not-allowed;
}

.add-task-form,
.filters {
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.07);
  border: 1px solid #e2e8f0;
  margin-bottom: 2.5rem;
  width: 100%; 
  max-width: 700px; 
  margin-left: auto;   
  margin-right: auto;  
}

.add-task-form .card-title,
.filters .card-title {
    font-size: 1.4rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 1.75rem;
    text-align: center;
}

.form-group {
  margin-bottom: 1.5rem; 
}

.add-task-form .form-group {
  margin-bottom: 2rem; 
}

.form-group label {
  display: block;
  margin-bottom: 0.6rem;
  color: #4a5568;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-control,
.form-select {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 0.95rem;
  color: #2d3748;
  background-color: #f7fafc;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
.form-select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
}

.form-control::placeholder,
.form-select option[value=""] {
  color: #a0aec0;
}

.form-control:focus,
.form-select:focus {
  border-color: #4299e1;
  background-color: #fff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.25);
}

.add-task-form textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

.add-task-submit-btn {
  width: 100%;
  padding: 0.9rem 1rem;
  background-image: linear-gradient(to right, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  transition: background-image 0.3s ease, transform 0.1s ease;
}
.add-task-submit-btn:hover {
  background-image: linear-gradient(to right, #4338ca 0%, #6d28d9 100%);
  transform: translateY(-1px);
}
.add-task-submit-btn:disabled {
  background-image: none;
  background-color: #a0aec0;
}

.loading-small {
    font-size: 0.8em;
    color: #718096;
    margin-top: 0.25rem;
}

.task-list {
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.task-item {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.06);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e8f0;
}
.task-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
}
.task-item .card-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex-grow: 1;
}

.task-item.task-completed {
    opacity: 0.7;
    background-color: #f7fafc;
}
.task-item.task-completed .card-title,
.task-item.task-completed .card-text small {
  color: #718096;
}
.task-item.task-completed .card-title {
  text-decoration: line-through;
}

.task-item.task-archived {
  opacity: 0.5;
  border-left: 4px solid #a0aec0;
}
.task-item.task-archived .card-title,
.task-item.task-archived .card-text small {
  text-decoration: line-through;
  color: #a0aec0;
}

.task-item .card-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.75rem;
}

.task-item .card-text small {
  display: block;
  font-size: 0.85rem;
  color: #718096;
  margin-bottom: 0.3rem;
  line-height: 1.5;
}
.task-item .card-text small:last-child {
  margin-bottom: 0;
}

.task-actions {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid #edf2f7;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.task-actions .btn {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    font-weight: 500;
    transition: background-color 0.2s ease, color 0.2s ease, transform 0.1s ease;
}
.task-actions .btn:hover {
    transform: translateY(-1px);
}

.task-actions .btn-success { background-color: #38a169; color: white; border:none;}
.task-actions .btn-success:hover { background-color: #2f855a;}
.task-actions .btn-warning { background-color: #f6ad55; color: #2d3748; border:none;}
.task-actions .btn-warning:hover { background-color: #ed8936;}
.task-actions .btn-secondary { background-color: #a0aec0; color: white; border:none;}
.task-actions .btn-secondary:hover { background-color: #718096;}
.task-actions .btn-danger { background-color: #e53e3e; color: white; border:none;}
.task-actions .btn-danger:hover { background-color: #c53030;}

.loading-message, .info-message {
  padding: 1.5rem;
  text-align: center;
  font-size: 1.05rem;
  color: #4a5568;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  margin-top: 1rem;
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
.error-message p {
  margin: 0;
}

.spinner-border {
    display: inline-block;
    width: 1em;
    height: 1em;
    vertical-align: -0.125em;
    border: .2em solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spinner-border .75s linear infinite;
}

@keyframes spinner-border {
  to { transform: rotate(360deg); }
}
</style>