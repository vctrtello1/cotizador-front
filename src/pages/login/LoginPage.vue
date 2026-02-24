<template>
    <div class="login-page">
        <div class="login-background">
            <div class="bg-shape bg-shape--1"></div>
            <div class="bg-shape bg-shape--2"></div>
            <div class="bg-shape bg-shape--3"></div>
        </div>

        <div class="login-card">
            <div class="login-header">
                <div class="login-logo">
                    <span class="logo-icon">📐</span>
                </div>
                <h1 class="login-title">Cotizador</h1>
                <p class="login-subtitle">Inicia sesión para continuar</p>
            </div>

            <transition name="fade">
                <div v-if="error" class="login-alert">
                    <span class="alert-icon">⚠️</span>
                    <span class="alert-text">{{ error }}</span>
                    <button @click="error = null" class="alert-close">×</button>
                </div>
            </transition>

            <form @submit.prevent="handleLogin" class="login-form">
                <div class="form-group">
                    <label for="email" class="form-label">Correo electrónico</label>
                    <div class="input-wrapper">
                        <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        <input
                            v-model="form.email"
                            type="email"
                            id="email"
                            class="form-input"
                            placeholder="tu@correo.com"
                            required
                            autocomplete="email"
                            :disabled="loading"
                        />
                    </div>
                </div>

                <div class="form-group">
                    <label for="password" class="form-label">Contraseña</label>
                    <div class="input-wrapper">
                        <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0110 0v4"/>
                        </svg>
                        <input
                            v-model="form.password"
                            :type="showPassword ? 'text' : 'password'"
                            id="password"
                            class="form-input"
                            placeholder="••••••••"
                            required
                            autocomplete="current-password"
                            :disabled="loading"
                        />
                        <button
                            type="button"
                            class="toggle-password"
                            @click="showPassword = !showPassword"
                            tabindex="-1"
                            :title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                        >
                            <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                            </svg>
                            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                                <line x1="1" y1="1" x2="23" y2="23"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <button type="submit" class="btn-login" :disabled="loading || !isFormValid">
                    <span v-if="loading" class="btn-loading">
                        <span class="spinner"></span>
                        Iniciando sesión...
                    </span>
                    <span v-else class="btn-content">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
                            <polyline points="10 17 15 12 10 7"/>
                            <line x1="15" y1="12" x2="3" y2="12"/>
                        </svg>
                        Iniciar Sesión
                    </span>
                </button>
            </form>

            <div class="login-footer">
                <p class="footer-text">Cotizador de Muebles &copy; 2026</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
    email: '',
    password: '',
});

const showPassword = ref(false);
const loading = ref(false);
const error = ref(null);

const isFormValid = computed(() => {
    return form.value.email.trim() && form.value.password.trim();
});

const handleLogin = async () => {
    if (!isFormValid.value) return;

    try {
        loading.value = true;
        error.value = null;

        await authStore.login({
            email: form.value.email.trim(),
            password: form.value.password,
        });

        router.push('/cotizaciones');
    } catch (err) {
        const msg = err?.response?.data?.message
            || err?.response?.data?.error
            || err?.message
            || 'Error al iniciar sesión';
        error.value = msg;
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
/* ========== Page ========== */
.login-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #2c2c2c 0%, #3a3a3a 50%, #4a4035 100%);
    position: relative;
    overflow: hidden;
    padding: 20px;
}

/* ========== Background shapes ========== */
.login-background {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
}

.bg-shape {
    position: absolute;
    border-radius: 50%;
    opacity: 0.06;
}

.bg-shape--1 {
    width: 600px;
    height: 600px;
    background: #d4a574;
    top: -200px;
    right: -150px;
    animation: float1 20s ease-in-out infinite;
}

.bg-shape--2 {
    width: 400px;
    height: 400px;
    background: #c89564;
    bottom: -100px;
    left: -100px;
    animation: float2 25s ease-in-out infinite;
}

.bg-shape--3 {
    width: 300px;
    height: 300px;
    background: #8b7355;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: float3 18s ease-in-out infinite;
}

@keyframes float1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(-40px, 30px) scale(1.05); }
}

@keyframes float2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(30px, -40px) scale(1.08); }
}

@keyframes float3 {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.1); }
}

/* ========== Card ========== */
.login-card {
    width: 100%;
    max-width: 420px;
    background: white;
    border-radius: 20px;
    padding: 40px 36px 32px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05);
    position: relative;
    z-index: 1;
    animation: cardEntrance 0.5s ease-out;
}

@keyframes cardEntrance {
    from { opacity: 0; transform: translateY(20px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}

/* ========== Header ========== */
.login-header {
    text-align: center;
    margin-bottom: 32px;
}

.login-logo {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    box-shadow: 0 4px 16px rgba(212, 165, 116, 0.3);
}

.logo-icon {
    font-size: 28px;
}

.login-title {
    font-size: 24px;
    font-weight: 700;
    color: #2c2c2c;
    margin: 0 0 6px;
    letter-spacing: -0.3px;
}

.login-subtitle {
    font-size: 14px;
    color: #8b8b8b;
    margin: 0;
    font-weight: 500;
}

/* ========== Alert ========== */
.login-alert {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 10px;
    margin-bottom: 20px;
    font-size: 13px;
    color: #b91c1c;
    animation: shakeAlert 0.4s ease-out;
}

@keyframes shakeAlert {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
}

.alert-icon {
    flex-shrink: 0;
    font-size: 16px;
}

.alert-text {
    flex: 1;
    line-height: 1.4;
}

.alert-close {
    background: none;
    border: none;
    color: #b91c1c;
    font-size: 18px;
    cursor: pointer;
    padding: 0 2px;
    opacity: 0.6;
    transition: opacity 0.2s;
}

.alert-close:hover {
    opacity: 1;
}

/* ========== Form ========== */
.login-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-label {
    font-size: 13px;
    font-weight: 600;
    color: #5a4037;
    letter-spacing: 0.2px;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.input-icon {
    position: absolute;
    left: 14px;
    color: #b0a89e;
    pointer-events: none;
    transition: color 0.2s;
}

.form-input {
    width: 100%;
    padding: 12px 14px 12px 44px;
    font-size: 14px;
    border: 1.5px solid #e0dbd5;
    border-radius: 10px;
    background: #faf9f7;
    color: #2c2c2c;
    transition: all 0.25s;
    outline: none;
    font-family: inherit;
}

.form-input:focus {
    border-color: #d4a574;
    background: white;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.15);
}

.form-input:focus ~ .input-icon,
.form-input:focus + .input-icon {
    color: #d4a574;
}

.input-wrapper:focus-within .input-icon {
    color: #d4a574;
}

.form-input::placeholder {
    color: #c0bbb4;
}

.form-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.toggle-password {
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    color: #b0a89e;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    transition: color 0.2s;
}

.toggle-password:hover {
    color: #8b7355;
}

/* ========== Button ========== */
.btn-login {
    width: 100%;
    padding: 14px 20px;
    font-size: 15px;
    font-weight: 600;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    transition: all 0.3s;
    font-family: inherit;
    margin-top: 4px;
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.btn-login:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(212, 165, 116, 0.4);
    background: linear-gradient(135deg, #c89564 0%, #b8854e 100%);
}

.btn-login:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.3);
}

.btn-login:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
}

.btn-content,
.btn-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.spinner {
    width: 18px;
    height: 18px;
    border: 2.5px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* ========== Footer ========== */
.login-footer {
    text-align: center;
    margin-top: 28px;
    padding-top: 20px;
    border-top: 1px solid #f0ede8;
}

.footer-text {
    font-size: 12px;
    color: #b0a89e;
    margin: 0;
    font-weight: 500;
}

/* ========== Transitions ========== */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* ========== Responsive ========== */
@media (max-width: 480px) {
    .login-card {
        padding: 32px 24px 24px;
        border-radius: 16px;
    }

    .login-logo {
        width: 56px;
        height: 56px;
        border-radius: 14px;
    }

    .logo-icon {
        font-size: 24px;
    }

    .login-title {
        font-size: 22px;
    }
}
</style>
