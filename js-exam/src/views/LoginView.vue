<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';
import { RouterLink } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');

const isLoading = computed(() => authStore.isLoading);
const loginError = computed(() => authStore.loginError);

onMounted(() => {
    if (authStore.loginError){
        authStore.loginError = null;
    }
});

const handleLogin = async () => {
    if (!email.value || !password.value) {
        authStore.loginError = 'Email and password are required.';
        return;
    }
    const success = await authStore.login({
        email: email.value,
        password: password.value
    });
    if (success) {
        const redirectPath = route.query.redirect as string || undefined;
        if (redirectPath) {
            router.push(redirectPath);
        } else {
            router.push({ name: 'todos'})
        }
    }
};
</script>


<template>
    <div class="login-view-wrapper">
        <div class="login-container">
            <h2>Login</h2>
            <p>Login to your existing account.</p>
            <form @submit.prevent="handleLogin" class="login-form">
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input 
                    type="email" 
                    id="email" 
                    v-model="email" 
                    required 
                    placeholder="Enter your email" 
                    :disabled="isLoading" 
                    autocomplete="username "
                    />
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input 
                    type="password" 
                    id="password" 
                    v-model="password" required 
                    placeholder="Enter your password"
                    :disabled="isLoading"
                    autocomplete="current-password"
                    />
                </div>
                <div v-if="loginError" class="error-message">
                    <p>{{ loginError }}</p>
                </div>
                <button type="submit" class="login-button" :disabled="isLoading">
                    <span v-if="isLoading">Logging in...</span>
                    <span v-else>Login</span>
                </button>
            </form>
            <p class="register-link">
                Don't have an account? <RouterLink :to="{ name: 'register' }">Register here</RouterLink>   
            </p>
        </div>
    </div>
</template>

<style scoped>
.login-view-wrapper {
  display: flex;
  flex-direction: column; /* Stack content if needed, or just center */
  justify-content: center; /* Vertically center if align-items is used on parent */
  align-items: center;     /* Horizontally center */
  flex-grow: 1; /* Make this wrapper take available space in App.vue's main-content */
  width: 100%;
  /* background-color: #eef2f7; /* Light background moved to global body */
  padding: 2rem; /* Padding for smaller screens */
  box-sizing: border-box;
}

.login-container {
  background-color: #ffffff;
  padding: 2.5rem 3rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 450px;
  text-align: center;
  border: 1px solid #e2e8f0;
}

.login-container {
  margin-bottom: 2rem;
}

.login-container h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.login-container p {
  font-size: 0.95rem;
  color: #718096;
}

.login-form .form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.login-form label {
  display: block;
  margin-bottom: 0.6rem;
  color: #4a5568;
  font-weight: 500;
  font-size: 0.875rem;
}

.login-form input[type="email"],
.login-form input[type="password"] {
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

.login-form input[type="email"]::placeholder,
.login-form input[type="password"]::placeholder {
  color: #a0aec0;
}

.login-form input[type="email"]:focus,
.login-form input[type="password"]:focus {
  border-color: #4299e1;
  background-color: #fff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.login-button {
  width: 100%;
  padding: 0.9rem 1rem;
  background-image: linear-gradient(to right, #4f46e5 0%, #7c3aed 100%);
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

.login-button:hover {
  background-image: linear-gradient(to right, #4338ca 0%, #6d28d9 100%);
  transform: translateY(-1px);
}

.login-button:disabled {
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

.alternative-action {
  margin-top: 2rem;
  font-size: 0.9rem;
  color: #718096;
}

.alternative-action .link {
  color: #4f46e5;
  font-weight: 500;
  text-decoration: none;
}

.alternative-action .link:hover {
  text-decoration: underline;
}
</style>