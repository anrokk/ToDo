import { defineStore } from 'pinia';
import { todoApiService } from '@/services/todoApiService';
import { useProhibitedWordStore } from './prohibitedWordStore';
import type {
    TodoTask,
    TodoTaskCreate,
    TodoTaskUpdate,
    TodoCategory,
    TodoCategoryCreate,
    TodoCategoryEdit,
    TodoPriority,
    TodoPriorityCreate
} from '@/types';

export interface TodoFilter {
    completed: boolean | null;
    archived: boolean | null;
}

export interface TodoState {
    tasks: TodoTask[];
    categories: TodoCategory[];
    priorities: TodoPriority[];
    currentFilter: TodoFilter;
    selectedTaskForEdit: TodoTask | null;
    isLoadingTasks: boolean;
    isLoadingCategories: boolean;
    isLoadingPriorities: boolean;
    error: string | null;
}

export const useTodoStore = defineStore('todos', {
    state: (): TodoState => ({
        tasks: [],
        categories: [],
        priorities: [],
        currentFilter: { completed: null, archived: null },
        selectedTaskForEdit: null,
        isLoadingTasks: false,
        isLoadingCategories: false,
        isLoadingPriorities: false,
        error: null,
    }),

    getters: {
        filteredTasks(state): TodoTask[] {
            return state.tasks.filter(task => {
                const completedMatch = state.currentFilter.completed === null || task.isCompleted === state.currentFilter.completed;
                const archivedMatch = state.currentFilter.archived === null || task.isArchived === state.currentFilter.archived;
                return completedMatch && archivedMatch;
            }).sort((a, b) => a.taskSort - b.taskSort || new Date(a.createdDt).getTime() - new Date(b.createdDt).getTime());
        },

        getCategoryById: (state) => (id: string): TodoCategory | undefined => {
            return state.categories.find(category => category.id === id);
        },

        getPriorityById: (state) => (id: string): TodoPriority | undefined => {
            return state.priorities.find(priority => priority.id === id);
        }
    },

    actions: {
        clearError(){
            this.error = null;
        },

        clearUserTodosAndCategories() {
            this.tasks = [];
            this.categories = [];
            this.priorities = [];
            this.selectedTaskForEdit = null;
            this.error = null;
        },

        setFilter(filter: Partial<TodoFilter>) {
            this.currentFilter = { ...this.currentFilter, ...filter };
        },

        async fetchTodoTasks() {
            this.isLoadingTasks = true;
            this.error = null;
            try {
                this.tasks = await todoApiService.getTodoTasks();
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch todo tasks.';
                this.tasks = [];
            } finally {
                this.isLoadingTasks = false;
            }
        },

        async fetchTodoCategories() {
            this.isLoadingCategories = true;
            this.error = null;
            try {
                this.categories = await todoApiService.getTodoCategories();
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch todo categories.';
                this.categories = [];
            } finally {
                this.isLoadingCategories = false;
            }
        },

        async fetchTodoPriorities() {
            this.isLoadingPriorities = true;
            this.error = null;
            try {
                this.priorities = await todoApiService.getTodoPriorities();
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch priorities.';
                this.priorities = [];
            } finally {
                this.isLoadingPriorities = false;
            }
        },

        async fetchInitialTodoData() {
            this.isLoadingTasks = true,
            this.isLoadingCategories = true,
            this.isLoadingPriorities = true;
            this.error = null;
            try {
                await Promise.all([
                    this.fetchTodoTasks(),
                    this.fetchTodoCategories(),
                    this.fetchTodoPriorities()
                ]);
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch initial todo data.';
            } finally {

            }
        },

        async createTask(taskData: TodoTaskCreate) {
            const prohibitedWordStore = useProhibitedWordStore();
            if (prohibitedWordStore.isProhibited(taskData.taskName)) {
                this.error = "Task name contains prohibited words.";
                return null;
            }

            this.isLoadingTasks = true;
            this.error = null;
            try {
                const newTask = await todoApiService.createTodoTask(taskData);
                this.tasks.push(newTask);
                return newTask;
            } catch (err: any) {
                this.error = err.message || 'Failed to create todo task.';
                return null;
            } finally {
                this.isLoadingTasks = false;
            }
        },

        async getTaskForEdit(taskId: string) {
            this.isLoadingTasks = true;
            this.error = null;
            this.selectedTaskForEdit = null;
            try {
                const task = await todoApiService.getTodoTaskById(taskId);
                this.selectedTaskForEdit = task;
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch task for edit.';
            } finally {
                this.isLoadingTasks = false;
            }
        },

        async updateTask(taskId: string, taskUpdateData: TodoTaskUpdate): Promise<TodoTask | null> {
            const prohibitedWordStore = useProhibitedWordStore();
            if (taskUpdateData.taskName && prohibitedWordStore.isProhibited(taskUpdateData.taskName)) {
                this.error = "Task name contains prohibited words.";
                return null;
            }

            this.isLoadingTasks = true;
            this.error = null;
            try {
                const updatedTask = await todoApiService.updateTodoTask(taskId, taskUpdateData);
                const index = this.tasks.findIndex(t => t.id === taskId);
                if (index !== -1) {
                    this.tasks[index] = { ...this.tasks[index], ...updatedTask };
                }
                if (this.selectedTaskForEdit && this.selectedTaskForEdit.id === taskId) {
                    this.selectedTaskForEdit = { ...this.selectedTaskForEdit, ...updatedTask };
                }
                return updatedTask;
            } catch (err: any) {
                this.error = err.message || 'Failed to update todo task.';
                return null;
            } finally {
                this.isLoadingTasks = false;
            }
        },

        async deleteTask(taskId: string): Promise<boolean> {
            this.isLoadingTasks = true;
            this.error = null;
            try {
                await todoApiService.deleteTodoTask(taskId);
                this.tasks = this.tasks.filter(task => task.id !== taskId);
                if (this.selectedTaskForEdit && this.selectedTaskForEdit.id === taskId) {
                    this.selectedTaskForEdit = null;
                }
                return true;
            } catch (err: any) {
                this.error = err.message || 'Failed to delete todo task.';
                return false;
            } finally {
                this.isLoadingTasks = false;
            }
        },

        async toggleTaskCompleted(taskId: string) {
            const task = this.tasks.find(t => t.id === taskId);
            if (!task) {
                this.error = 'Task not found.';
                return;
            }
            const originalCompletedState = task.isCompleted;
            task.isCompleted = !task.isCompleted;

            try {
                const updateData: TodoTaskUpdate = {
                    id: taskId,
                    isCompleted: task.isCompleted,
                    taskName: task.taskName,
                    todoCategoryId: task.todoCategoryId,
                    todoPriorityId: task.todoPriorityId,
                    dueDt: task.dueDt,
                    isArchived: task.isArchived,
                    taskSort: task.taskSort
                };
                await todoApiService.updateTodoTask(taskId, updateData);
            } catch (error){
                task.isCompleted = originalCompletedState; 
            }
        },

        async toggleTaskArchived(taskId: string) {
            const task = this.tasks.find(t => t.id === taskId);
            if (!task) {
                this.error = 'Task not found.';
                return;
            }
            const originalArchivedState = task.isArchived;
            task.isArchived = !task.isArchived;

            try {
                const updateData: TodoTaskUpdate = {
                    id: task.id,
                    isArchived: task.isArchived,
                    taskName: task.taskName,
                    todoCategoryId: task.todoCategoryId,
                    todoPriorityId: task.todoPriorityId,
                    dueDt: task.dueDt,
                    isCompleted: task.isCompleted,
                    taskSort: task.taskSort,
                };
                await this.updateTask(taskId, updateData);
            } catch (error) {
                task.isArchived = originalArchivedState;            
            }
        },

        async createCategory(categoryData: TodoCategoryCreate): Promise<TodoCategory | null> {
            const prohibitedWordStore = useProhibitedWordStore();
            if (categoryData.categoryName && prohibitedWordStore.isProhibited(categoryData.categoryName)){
                this.error = "Category name contains prohibited words.";
                return null;
            }
            this.isLoadingCategories = true;
            try {
                const newCategory = await todoApiService.createTodoCategory(categoryData);
                this.categories.push(newCategory);
                return newCategory;
            } catch (err: any) {
                this.error = err.message || 'Failed to create todo category.';
                return null; 
            } finally {
                this.isLoadingCategories = false;
            }
        },

        async createPriority(priorityData: TodoPriorityCreate): Promise<TodoPriority | null> {
            const prohibitedWordStore = useProhibitedWordStore();
            if (prohibitedWordStore.isProhibited(priorityData.priorityName)) {
                this.error = "Priority name contains prohibited words.";
                return null;
            }
            this.isLoadingPriorities = true;
            this.error = null;
            try {
                const newPriority = await todoApiService.createTodoPriority(priorityData);
                this.priorities.push(newPriority);
                return newPriority;
            } catch (err: any) {
                this.error = err.message || 'Failed to create todo priority.';
                return null;
            } finally {
                this.isLoadingPriorities = false;
            }
        }    
    
    }
});