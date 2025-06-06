<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
const userDisplayName = computed(() => authStore.userDisplayName);
</script>

<template>
  <div class="home-view-container">
    <div class="hero-section">
      <h1 class="app-main-title">Welcome to ToDo!</h1>

      <p class="lead-text" v-if="!isAuthenticated">
        Organize your life, one task at a time. Simple, intuitive, and always in sync.
        <br />
        Please log in or register to start managing your tasks.
      </p>
      <p class="lead-text" v-if="isAuthenticated">
        Hello, {{ userDisplayName }}! Ready to tackle your day?
        <br />
        Let's get some ToDo's organized or create new ones.
      </p>
    </div>

    <div class="action-buttons-container" v-if="!isAuthenticated">
      <RouterLink :to="{ name: 'login' }" class="action-button primary">Login</RouterLink>
      <RouterLink :to="{ name: 'register' }" class="action-button secondary">Register</RouterLink>
    </div>

    <div class="action-buttons-container" v-if="isAuthenticated">
      <RouterLink :to="{ name: 'todos' }" class="action-button primary">View My ToDo's</RouterLink>
      <RouterLink :to="{ name: 'todos' }" class="action-button">Add a New ToDo</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.home-view-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem 1.5rem;
  flex-grow: 1; 
}

.hero-section {
  margin-bottom: 2.5rem;
  max-width: 700px; 
}

.app-main-title {
  font-size: 2.8rem;
  font-weight: 700;
  color: #34495e; 
  margin-bottom: 1rem;
  line-height: 1.2;
}

.lead-text {
  font-size: 1.15rem;
  color: #55595c; 
  margin-bottom: 2rem;
  line-height: 1.7;
}

.action-buttons-container {
  display: flex;
  gap: 1rem; 
  justify-content: center;
  margin-bottom: 2.5rem;
}

.action-button {
  padding: 0.8rem 2rem;
  text-decoration: none;
  border-radius: 8px; 
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.action-button.primary {
  background-image: linear-gradient(to right, #4f46e5 0%, #7c3aed 100%); 
  color: white;
}

.action-button.primary:hover {
  background-image: linear-gradient(to right, #4338ca 0%, #6d28d9 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.action-button.secondary {
  background-color: #6c757d; 
  color: white;
}
.action-button.secondary:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.action-button:not(.primary):not(.secondary) { 
  background-color: #e9ecef;
  color: #2d3748;
  border: 1px solid #ced4da;
}
.action-button:not(.primary):not(.secondary):hover {
  background-color: #dee2e6;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}


.features-section {
  margin-top: 2rem;
  text-align: left;
  max-width: 600px; 
  width: 100%;
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.features-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #34495e;
  font-size: 1.5rem;
  font-weight: 600;
}

.features-list {
  list-style-type: none;
  padding-left: 0;
  color: #4a5568;
}

.features-list li {
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  font-size: 0.95rem;
}

.feature-icon {
  color: #28a745; 
  margin-right: 0.75rem;
  font-style: normal; 
  font-weight: bold;
}
</style>
