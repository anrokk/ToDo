<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import type { RegisterInfo } from '@/types';
import { RouterLink, useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const localError = ref<string | null>(null);

const isLoading = computed(() => authStore.isLoading);
const registerErrorFromStore = computed(() => authStore.registerError);

onMounted(() => {
    if (authStore.registerError) {
        authStore.registerError = null;
    }
});

const handleRegister = async () => {
    localError.value = null;
    if (authStore.registerError) {
        authStore.registerError = null;
    }

    if (password.value !== confirmPassword.value) {
        localError.value = 'Passwords do not match.';
        return
    }

    if (!firstName.value || !lastName.value || !email.value || !password.value) {
        localError.value = 'All fields are required.';
        return;
    }

    const userInfo: RegisterInfo = {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        password: password.value
    };

    const success = await authStore.register(userInfo);
    if (success) {
        router.push({ name: 'home'});
    }
};
</script>

<template>
  <div class="register-view-wrapper">
    <div class="register-container">
      <div class="register-header">
        <h2>Create Your Account</h2>
        <p>Join ToDo to manage and create your tasks.</p>
      </div>
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            v-model="firstName"
            required
            placeholder="Enter your first name"
            :disabled="isLoading"
            autocomplete="given-name"
          />
        </div>
        <div class="form-group">
          <label for="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            v-model="lastName"
            required
            placeholder="Enter your last name"
            :disabled="isLoading"
            autocomplete="family-name"
          />
        </div>
        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="you@example.com"
            :disabled="isLoading"
            autocomplete="email"
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="Create a password"
            :disabled="isLoading"
            autocomplete="new-password"
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            required
            placeholder="Confirm your password"
            :disabled="isLoading"
            autocomplete="new-password"
          />
        </div>

        <div v-if="localError || registerErrorFromStore" class="error-message">
          <p>{{ localError || registerErrorFromStore }}</p>
        </div>

        <button type="submit" class="register-button" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>Create Account</span>
        </button>
      </form>
      <p class="alternative-action">
        Already have an account? <RouterLink :to="{ name: 'login' }" class="link">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.register-view-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  width: 100%;
  padding: 2rem;
  box-sizing: border-box;
}

.register-container {
  background-color: #ffffff;
  padding: 2.5rem 3rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 480px; 
  text-align: center;
  border: 1px solid #e2e8f0;
}

.register-header {
  margin-bottom: 2rem;
}

.register-header h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.register-header p {
  font-size: 0.95rem;
  color: #718096;
}

.register-form .form-group {
  margin-bottom: 1.25rem; 
  text-align: left;
}

.register-form label {
  display: block;
  margin-bottom: 0.6rem;
  color: #4a5568;
  font-weight: 500;
  font-size: 0.875rem;
}

.register-form input[type="text"],
.register-form input[type="email"],
.register-form input[type="password"] {
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

.register-form input::placeholder { 
  color: #a0aec0;
}

.register-form input:focus {
  border-color: #4299e1;
  background-color: #fff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.register-button {
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

.register-button:hover {
  background-image: linear-gradient(to right, #2f855a 0%, #276749 100%); 
  transform: translateY(-1px);
}

.register-button:disabled {
  background-image: none;
  background-color: #a0aec0;
  cursor: not-allowed;
  transform: translateY(0);
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
  to {
    transform: rotate(360deg);
  }
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

.alternative-action, .login-link {
  margin-top: 2rem;
  font-size: 0.9rem;
  color: #718096;
}

.alternative-action .link, .login-link .link  {
  color: #4f46e5;
  font-weight: 500;
  text-decoration: none;
}

.alternative-action .link:hover, .login-link .link:hover {
  text-decoration: underline;
}
</style>