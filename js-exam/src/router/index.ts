import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import TodoListView from '@/views/TodoListView.vue'

import { useAuthStore } from '@/stores/auth'
import CreateCategoryView from '@/views/CreateCategoryView.vue'
import CreatePriorityView from '@/views/CreatePriorityView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresGuest: true }
  },
  {
    path: '/todos',
    name: 'todos',
    component: TodoListView,
    meta: { requiresAuth: true }
  },
  {
    path: '/categories/create',
    name: 'createCategory',
    component: CreateCategoryView,
    meta: { requiresAuth: true }
  },
  {
    path: '/priorities/create',
    name: 'createPriority',
    component: CreatePriorityView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});


router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated && localStorage.getItem('todoAppToken')) {
    authStore.initializeAuthFromStorage();
  }

  const requiresAuth = to.meta.requiresAuth as boolean;
  const requiresGuest = to.meta.requiresGuest as boolean;

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (requiresGuest && authStore.isAuthenticated) {
    next({ name: 'home' });
  } else {
    next();
  }
})

export default router
