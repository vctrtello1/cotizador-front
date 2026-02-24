<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Navbar from '@/components/Navbar.vue';

const router = useRouter();
const route = useRoute();

const isLoginPage = computed(() => route.name === 'Login');

const getTransitionName = (route) => {
  // Si es una página de detalle o edición, usa slide
  if (route.path.includes('/editar-') || route.path.includes('/nuevo-') || /\/\d+$/.test(route.path)) {
    return 'slide-left';
  }
  // Para navegación entre páginas principales, usa fade
  return 'fade-slide';
};
</script>

<template>
  <div class="app">
    <Navbar v-if="!isLoginPage" />

    <main class="app-main">
      <router-view v-slot="{ Component, route }">
        <transition :name="getTransitionName(route)" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>

    <footer v-if="!isLoginPage" class="app-footer">
      <p>&copy; 2026 Cotizador de Muebles. Todos los derechos reservados.</p>
    </footer>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #fafbfc 0%, #f5f3f0 100%);
  color: #2c2c2c;
}

.app-main {
  flex: 1;
  padding: 0;
  background: linear-gradient(135deg, #fafbfc 0%, #f5f3f0 100%);
}

.app-footer {
  background: linear-gradient(135deg, #2c2c2c 0%, #3a3a3a 100%);
  color: #c0bbb4;
  text-align: center;
  padding: 20px;
  font-size: 13px;
  border-top: 1px solid #4a4a4a;
  margin-top: auto;
}

.app-footer p {
  margin: 0;
  font-weight: 500;
}

/* ============================================
   TRANSICIONES DE NAVEGACIÓN
   ============================================ */

/* Fade slide para navegación principal */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Slide para páginas de detalle/edición */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(40px);
}

.slide-left-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.slide-left-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}

/* Asegurar que las transiciones no afecten el layout */
.app-main {
  position: relative;
}

.fade-slide-enter-active,
.fade-slide-leave-active,
.slide-left-enter-active,
.slide-left-leave-active {
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
}

.fade-slide-enter-to,
.slide-left-enter-to {
  position: relative;
}
</style>
