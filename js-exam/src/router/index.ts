import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import TodoListView from '@/views/TodoListView.vue'

import { useAuthStore } from '@/stores/auth'
import CreateCategoryView from '@/views/CreateCategoryView.vue'
import CreatePriorityView from '@/views/CreatePriorityView.vue'
import AdminProhibitedWordsView from '@/views/AdminProhibitedWordsView.vue'

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
  },
  {
    path: '/admin/prohibited-words',
    name: 'adminProhibitedWords',
    component: AdminProhibitedWordsView,
    meta: { requiresAuth: true, requiresAdmin: true }
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

  const requiresAdmin = to.meta.requiresAdmin as boolean;
  const requiresAuth = to.meta.requiresAuth as boolean;
  const requiresGuest = to.meta.requiresGuest as boolean;

  if (requiresAdmin && !authStore.isAdmin) {
    return next({ name: 'home' });
  }

  if (requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }

  if (requiresGuest && authStore.isAuthenticated) {
    return next({ name: 'todos' });
  }

  next();
});

export default router
