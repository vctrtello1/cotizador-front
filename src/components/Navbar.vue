<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const cerrarSesion = async () => {
  await authStore.logout();
  router.push('/login');
};

const navItems = [
  { path: '/cotizaciones', icon: '📋', label: 'Cotizaciones', excludeNew: true },
  { path: '/modulos', icon: '🧩', label: 'Módulos', excludeNew: true },
  { path: '/componentes', icon: '🔧', label: 'Componentes', excludeNew: true, roles: ['admin', 'editor'] },
  { path: '/estructuras', icon: '🏗️', label: 'Estructuras', excludeNew: true, roles: ['admin', 'editor'] },
  { path: '/acabado-tablero', icon: '🎨', label: 'Acabado Tablero', excludeNew: true, roles: ['admin', 'editor'] },
  { path: '/acabado-cubre-canto', icon: '🧵', label: 'Acabado Cubre Canto', excludeNew: false, roles: ['admin', 'editor'] },
  { path: '/correderas', icon: '🎚️', label: 'Correderas', excludeNew: true, roles: ['admin', 'editor'] },
  { path: '/compases-abatibles', icon: '🔀', label: 'Compases Abatibles', excludeNew: true, roles: ['admin', 'editor'] },
  { path: '/puertas', icon: '🚪', label: 'Puertas', excludeNew: true, roles: ['admin', 'editor'] },
  { path: '/accesorios', icon: '🔩', label: 'Accesorios', excludeNew: true, roles: ['admin', 'editor'] },
  { path: '/admin', icon: '⚙️', label: 'Admin', excludeNew: false, roles: ['admin'] }
];

const userRole = computed(() => authStore.user?.role || authStore.user?.rol || 'viewer');

const visibleNavItems = computed(() =>
  navItems.filter((item) => {
    if (item.roles && !item.roles.includes(userRole.value)) return false;
    if (item.permission && !authStore.hasPermission(item.permission)) return false;
    return true;
  })
);

const isActive = (path, excludeNew) => {
  if (!route.path.startsWith(path)) return false;
  if (!excludeNew) return true;
  return !route.path.includes('/nueva-') && !route.path.includes('/nuevo-');
};
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo-section">
        <router-link to="/" class="logo-link">
          <span class="logo-icon">📐</span>
          <h1 class="logo-text">Cotizador</h1>
        </router-link>
      </div>
      <nav class="nav-menu">
        <router-link 
          v-for="item in visibleNavItems"
          :key="item.path"
          :to="item.path" 
          class="nav-link"
          :class="{ active: isActive(item.path, item.excludeNew) }"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          {{ item.label }}
        </router-link>
      </nav>
      <button class="btn-logout" @click="cerrarSesion" title="Cerrar sesión">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span class="logout-text">Salir</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #2c2c2c 0%, #3a3a3a 100%);
  padding: 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
  height: 70px;
}

.logo-section {
  flex-shrink: 0;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s;
}

.logo-link:hover {
  opacity: 0.8;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #d4a574;
  letter-spacing: -0.5px;
}

.nav-menu {
  display: flex;
  gap: 8px;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  color: #c0bbb4;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.nav-icon {
  font-size: 18px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link:hover .nav-icon {
  transform: scale(1.1) translateY(-2px);
}

.nav-link:hover {
  color: #d4a574;
  background: rgba(212, 165, 116, 0.1);
  transform: translateY(-2px);
}

.nav-link.active {
  color: #d4a574;
  background: rgba(212, 165, 116, 0.15);
  font-weight: 600;
}

.nav-link.active .nav-icon {
  transform: scale(1.15);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 3px;
  background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
  border-radius: 2px 2px 0 0;
  animation: slideInBottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link.active::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(212, 165, 116, 0.1) 0%, rgba(200, 149, 100, 0.1) 100%);
  opacity: 0;
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes slideInBottom {
  from {
    transform: scaleX(0);
    opacity: 0;
  }
  to {
    transform: scaleX(1);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Tablets y pantallas medianas */
@media (max-width: 1024px) {
  .header-content {
    gap: 30px;
    padding: 0 16px;
  }

  .nav-menu {
    gap: 6px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .nav-link {
    padding: 10px 16px;
    font-size: 13px;
  }

  .nav-icon {
    font-size: 16px;
  }
}

/* Tablets pequeños */
@media (max-width: 768px) {
  .header-content {
    gap: 16px;
    height: auto;
    padding: 12px;
    flex-direction: column;
    align-items: stretch;
  }

  .logo-section {
    width: 100%;
  }

  .logo-link {
    justify-content: center;
  }

  .logo-text {
    font-size: 20px;
  }

  .logo-icon {
    font-size: 24px;
  }

  .nav-menu {
    width: 100%;
    gap: 6px;
    justify-content: center;
  }

  .nav-link {
    padding: 10px 14px;
    font-size: 12px;
    gap: 6px;
  }

  .nav-link.active::after {
    left: 14px;
    right: 14px;
  }

  .nav-icon {
    font-size: 16px;
  }
}

/* Móviles */
@media (max-width: 640px) {
  .header-content {
    padding: 10px;
    gap: 12px;
  }

  .logo-text {
    font-size: 18px;
  }

  .logo-icon {
    font-size: 22px;
  }

  .nav-menu {
    gap: 4px;
  }

  .nav-link {
    padding: 8px 10px;
    font-size: 11px;
    gap: 5px;
    flex: 1 1 calc(50% - 4px);
    min-width: 0;
    justify-content: center;
  }

  .nav-icon {
    font-size: 14px;
  }

  .nav-link.active::after {
    height: 2px;
    left: 10px;
    right: 10px;
  }
}

/* Móviles muy pequeños - solo iconos */
@media (max-width: 480px) {
  .header-content {
    padding: 8px;
    gap: 10px;
  }

  .logo-section {
    padding: 4px 0;
  }

  .logo-text {
    font-size: 16px;
  }

  .logo-icon {
    font-size: 20px;
  }

  .nav-menu {
    gap: 6px;
    justify-content: space-around;
  }

  .nav-link {
    padding: 10px 8px;
    font-size: 0;
    gap: 0;
    flex: 0 1 auto;
    min-width: 44px;
  }

  .nav-icon {
    font-size: 20px;
    margin: 0;
  }

  .nav-link span:not(.nav-icon) {
    display: none;
  }

  .nav-link.active::after {
    display: none;
  }

  .nav-link.active {
    background: rgba(212, 165, 116, 0.25);
  }

  .btn-logout {
    position: fixed;
    bottom: 16px;
    right: 16px;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    padding: 0;
    justify-content: center;
  }

  .logout-text {
    display: none;
  }
}

/* ========== Logout button ========== */
.btn-logout {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #c0bbb4;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.25s;
  flex-shrink: 0;
  white-space: nowrap;
}

.btn-logout:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.btn-logout:active {
  transform: scale(0.96);
}

.logout-text {
  pointer-events: none;
}
</style>
