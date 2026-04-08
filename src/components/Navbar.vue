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
  { path: '/componentes', icon: '🔧', label: 'Componentes', excludeNew: true },
  { path: '/acabados', icon: '🎨', label: 'Acabados', excludeNew: true, roles: ['admin', 'editor'] },
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
    <!-- Top bar: logo + user -->
    <div class="top-bar">
      <router-link to="/" class="logo-link">
        <span class="logo-icon">📐</span>
        <h1 class="logo-text">Cotizador</h1>
      </router-link>
      <div class="user-section">
        <div class="user-info" v-if="authStore.user">
          <span class="user-avatar">{{ (authStore.user.name || authStore.user.nombre || 'U')[0].toUpperCase() }}</span>
          <span class="user-name">{{ authStore.user.name || authStore.user.nombre || 'Usuario' }}</span>
          <span class="user-role">{{ userRole }}</span>
        </div>
        <button class="btn-logout" @click="cerrarSesion" title="Cerrar sesión">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span class="logout-text">Salir</span>
        </button>
      </div>
    </div>
    <!-- Navigation bar -->
    <nav class="nav-bar">
      <div class="nav-scroll">
        <router-link 
          v-for="item in visibleNavItems"
          :key="item.path"
          :to="item.path" 
          class="nav-link"
          :class="{ active: isActive(item.path, item.excludeNew) }"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </div>
    </nav>
  </header>
</template>

<style scoped>
/* ========== Header container ========== */
.app-header {
  background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
}

/* ========== Top bar: logo + user ========== */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 56px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
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
  opacity: 0.85;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #d4a574;
  letter-spacing: -0.5px;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.user-name {
  color: #e0dbd4;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.user-role {
  color: #888;
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
  background: rgba(255, 255, 255, 0.06);
  padding: 2px 8px;
  border-radius: 10px;
}

/* ========== Navigation bar ========== */
.nav-bar {
  position: relative;
  padding: 0 24px;
}

.nav-scroll {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 8px 0;
}

.nav-scroll::-webkit-scrollbar {
  display: none;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  color: #999;
  text-decoration: none;
  font-weight: 500;
  font-size: 13px;
  border-radius: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;
  position: relative;
  flex-shrink: 0;
}

.nav-icon {
  font-size: 16px;
  transition: transform 0.2s ease;
}

.nav-label {
  pointer-events: none;
}

.nav-link:hover {
  color: #d4a574;
  background: rgba(212, 165, 116, 0.08);
}

.nav-link:hover .nav-icon {
  transform: scale(1.1);
}

.nav-link.active {
  color: #d4a574;
  background: rgba(212, 165, 116, 0.12);
  font-weight: 600;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 12px;
  right: 12px;
  height: 2px;
  background: #d4a574;
  border-radius: 2px 2px 0 0;
}

/* ========== Logout button ========== */
.btn-logout {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: #999;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  white-space: nowrap;
}

.btn-logout:hover {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
  color: #fca5a5;
}

.btn-logout:active {
  transform: scale(0.96);
}

.logout-text {
  pointer-events: none;
}

/* ========== Responsive ========== */

/* Tablet */
@media (max-width: 1024px) {
  .nav-link {
    padding: 8px 12px;
    font-size: 12px;
    gap: 5px;
  }

  .nav-icon {
    font-size: 15px;
  }
}

/* Tablet small */
@media (max-width: 768px) {
  .top-bar {
    padding: 0 16px;
    height: 50px;
  }

  .nav-bar {
    padding: 0 16px;
  }

  .user-name,
  .user-role {
    display: none;
  }

  .nav-link {
    padding: 8px 10px;
    font-size: 11px;
    gap: 4px;
  }

  .nav-icon {
    font-size: 14px;
  }
}

/* Mobile */
@media (max-width: 640px) {
  .top-bar {
    padding: 0 12px;
    height: 46px;
  }

  .logo-icon {
    font-size: 20px;
  }

  .logo-text {
    font-size: 17px;
  }

  .nav-bar {
    padding: 0 12px;
  }

  .nav-scroll {
    padding: 6px 0;
    gap: 2px;
  }

  .nav-link {
    padding: 6px 8px;
  }

  .nav-label {
    display: none;
  }

  .nav-icon {
    font-size: 18px;
  }

  .nav-link.active::after {
    left: 6px;
    right: 6px;
  }

  .logout-text {
    display: none;
  }

  .btn-logout {
    padding: 8px;
    border-radius: 8px;
  }
}
</style>
