<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; 
import { useProhibitedWordStore } from '@/stores/prohibitedWordStore';

const authStore = useAuthStore();
const prohibitedWordStore = useProhibitedWordStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => authStore.isAdmin);
const userDisplayName = computed(() => authStore.userDisplayName);

onMounted(() => {
  authStore.initializeAuthFromStorage();
  prohibitedWordStore.initializeWords();
});

const handleLogout = () => {
  authStore.logout();
};
</script>

<template>
  <div id="app-layout">
    <header class="app-header">
      <div class="logo-container">
        <RouterLink to="/" class="app-title">ToDo</RouterLink>
      </div>
      <nav class="navigation-links">
        <RouterLink to="/">Home</RouterLink>
        <template v-if="isAuthenticated">
          <RouterLink to="/todos">My ToDo's</RouterLink>
          <RouterLink v-if="isAdmin" to="/admin/prohibited-words" class="admin-link">Admin</RouterLink>
          <span class="user-greeting" v-if="authStore.user">Hi, {{ userDisplayName }}!</span>
          <button @click="handleLogout" class="logout-button">Logout</button>
        </template>
        <template v-else>
          <RouterLink to="/login">Login</RouterLink>
          <RouterLink to="/register">Register</RouterLink>
        </template>
      </nav>
    </header>

    <main class="main-content">
      <RouterView />
    </main>

    <footer class="app-footer">
      <p>&copy; {{ new Date().getFullYear() }} ToDoApp</p>
    </footer>
  </div>
</template>

<style scoped>
#app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background-image: linear-gradient(to right, #4f46e5 0%, #7c3aed 100%); 
  color: #ffffff; 
  padding: 0.75rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15); 
}

.app-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff; 
  text-decoration: none;
}

.navigation-links a,
.navigation-links .user-greeting {
  margin-left: 1.25rem;
  text-decoration: none;
  color: #e0e0ff; 
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
  font-size: 0.9rem;
  font-weight: 500;
}

.navigation-links a:hover {
  color: #ffffff; 
  background-color: rgba(255, 255, 255, 0.1); 
}

.navigation-links .router-link-exact-active {
  color: #ffffff;
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.2); 
}

.navigation-links button.logout-button {
  background-color: transparent;
  border: 1px solid #ffc107; 
  color: #ffc107; 
  cursor: pointer;
  font-weight: 500;
  padding: 0.4rem 0.8rem; 
  border-radius: 6px; 
  margin-left: 1.25rem;
  font-size: 0.9rem;
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
}

.navigation-links button.logout-button:hover {
  background-color: #ffc107; 
  color: #2d3748; 
}

.user-greeting {
  color: #e0e0ff; 
  padding-right: 0;
  font-size: 0.9rem;
}

.main-content {
  flex-grow: 1;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.main-content > :deep(div) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.app-footer {
  text-align: center;
  padding: 1.5rem 1rem;
  background-image: linear-gradient(to right, #4f46e5 0%, #7c3aed 100%); 
  color: #e0e0ff; 
  font-size: 0.875rem;
  width: 100%;
  box-sizing: border-box;
  margin-top: auto;
  flex-shrink: 0;
}

.admin-link {
    color: #f1c40f !important; 
    font-weight: bold;
}
.admin-link:hover {
    background-color: rgba(241, 196, 15, 0.1) !important;
}
.admin-link.router-link-exact-active {
    background-color: #f1c40f !important;
    color: #2c3e50 !important;
}
</style>
