<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

const navItems = [
  { path: '/cotizaciones', icon: '📋', label: 'Cotizaciones', excludeNew: true },
  { path: '/modulos', icon: '🧩', label: 'Módulos', excludeNew: true },
  { path: '/componentes', icon: '🔧', label: 'Componentes', excludeNew: true },
  { path: '/estructuras', icon: '🏗️', label: 'Estructuras', excludeNew: true },
  { path: '/acabado-tablero', icon: '🎨', label: 'Acabado Tablero', excludeNew: true },
  { path: '/acabado-cubre-canto', icon: '🧵', label: 'Acabado Cubre Canto', excludeNew: false },
  { path: '/correderas', icon: '🎚️', label: 'Correderas', excludeNew: true }
];

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
          v-for="item in navItems"
          :key="item.path"
          :to="item.path" 
          class="nav-link"
          :class="{ active: isActive(item.path, item.excludeNew) }"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          {{ item.label }}
        </router-link>
      </nav>
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

@media (max-width: 768px) {
  .header-content {
    gap: 20px;
    height: auto;
    padding: 12px 16px;
    flex-direction: column;
    align-items: flex-start;
  }

  .nav-menu {
    width: 100%;
    gap: 4px;
    flex-wrap: wrap;
  }

  .nav-link {
    padding: 8px 12px;
    font-size: 13px;
    flex: 0 1 auto;
  }

  .nav-link.active::after {
    display: none;
  }

  .logo-text {
    font-size: 18px;
  }
}
</style>
