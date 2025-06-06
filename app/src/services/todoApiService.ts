import axios from 'axios';
import type { 
    TodoTask, 
    TodoTaskUpdate, 
    TodoTaskCreate, 
    TodoCategory, 
    TodoCategoryCreate,
    TodoCategoryEdit, 
    TodoPriority, 
    ProblemDetails, 
    ApiMessage, 
    TodoPriorityCreate
} from '@/types';
import { useAuthStore } from '@/stores/auth';

const API_BASE_URL = "https://taltech.akaver.com/api/v1"

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

apiClient.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore();
        if (authStore.token && config.headers) {
            config.headers.Authorization = `Bearer ${authStore.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const getApiErrorMessage = (error: any, defaultMessage: string): string => {
    if (axios.isAxiosError(error) && error.response) {
        const problemDetails = error.response.data as ProblemDetails;
        if (problemDetails) {
            if (problemDetails.title && problemDetails.errors) {
                const errorMessages = Object.values(problemDetails.errors).flat();
                return `${problemDetails.title}: ${errorMessages.join(' ')}`;
            }
            return problemDetails.title || problemDetails.detail || defaultMessage;
        }
        const apiMessage = error.response.data as ApiMessage;
        if (apiMessage && apiMessage.messages && apiMessage.messages.length > 0) {
            return apiMessage.messages.join(' ');
        }
        return error.response.data?.message || error.message || defaultMessage;
    }
    return error.message || defaultMessage;
};

export const todoApiService = {

    //TODO TASKS
    getTodoTasks: async (): Promise<TodoTask[]> => {
        try {
            const response = await apiClient.get<TodoTask[]>('/TodoTasks');
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error, 'Failed to fetch todo tasks.'));
        }
    },

    getTodoTaskById: async (id: string): Promise<TodoTask> => {
        try {
            const response = await apiClient.get<TodoTask>(`/TodoTasks/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error, `Failed to fetch todo task with ID ${id}.`));
        }
    },

    createTodoTask: async (data: TodoTaskCreate): Promise<TodoTask> => {
        try {
            const response = await apiClient.post<TodoTask>('/TodoTasks', data);
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error, 'Failed to create todo task.'));
        }
    },

    updateTodoTask: async (id: string, data: TodoTaskUpdate): Promise<TodoTask> => {
        try {
            const response = await apiClient.put<TodoTask>(`/TodoTasks/${id}`, data);
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error, `Failed to update todo task with ID ${id}.`));
        }
    },

    deleteTodoTask: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/TodoTasks/${id}`);
        } catch (error) {
            throw new Error(getApiErrorMessage(error, `Failed to delete todo task with ID ${id}.`));
        }
    },

    //TODO CATEGORIES
    getTodoCategories: async (): Promise<TodoCategory[]> => {
        try {
            const response = await apiClient.get<TodoCategory[]>('/TodoCategories');
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error, 'Failed to fetch todo categories.'));
        }
    },

    createTodoCategory: async (data: TodoCategoryCreate): Promise<TodoCategory> => {
        try {
            const response = await apiClient.post<TodoCategory>('/TodoCategories', data);
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error, 'Failed to create todo category.'));
        }
    },

    updateTodoCategory: async (id: string, data: TodoCategoryEdit): Promise<TodoCategory> => {
        try {
            const response = await apiClient.put<TodoCategory>(`/TodoCategories/${id}`, data);
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error, `Failed to update todo category with ID ${id}.`));
        }
    },

    deleteTodoCategory: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/TodoCategories/${id}`);
        } catch (error) {
            throw new Error(getApiErrorMessage(error, `Failed to delete todo category with ID ${id}.`));
        }
    },

    //TODO PRIORITIES
    getTodoPriorities: async (): Promise<TodoPriority[]> => {
        try {
            const response = await apiClient.get<TodoPriority[]>('/TodoPriorities');
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error, 'Failed to fetch todo priorities.'));
        }
    },
    
    createTodoPriority: async (data: TodoPriorityCreate): Promise<TodoPriority> => {
        try {
            const response = await apiClient.post<TodoPriority>('/TodoPriorities', data);
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error, 'Failed to create todo priority.'));
        }
    }
}