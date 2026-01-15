<script setup>
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const isActive = (path) => {
  return route.path.startsWith(path);
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
          to="/cotizaciones" 
          class="nav-link"
          :class="{ active: isActive('/cotizaciones') && !isActive('/nueva-') }"
        >
          <span class="nav-icon">📋</span>
          Cotizaciones
        </router-link>
        <router-link 
          to="/modulos" 
          class="nav-link"
          :class="{ active: isActive('/modulos') && !isActive('/nuevo-') }"
        >
          <span class="nav-icon">⬜</span>
          Módulos
        </router-link>
        <router-link 
          to="/componentes" 
          class="nav-link"
          :class="{ active: isActive('/componentes') && !isActive('/nuevo-') }"
        >
          <span class="nav-icon">🔧</span>
          Componentes
        </router-link>
        <router-link 
          to="/materiales" 
          class="nav-link"
          :class="{ active: isActive('/materiales') && !isActive('/nuevo-') }"
        >
          <span class="nav-icon">📦</span>
          Materiales
        </router-link>
        <router-link 
          to="/tipo-de-material" 
          class="nav-link"
          :class="{ active: isActive('/tipo-de-material') }"
        >
          <span class="nav-icon">🏷️</span>
          Tipo de Material
        </router-link>
        <router-link 
          to="/mano-de-obra" 
          class="nav-link"
          :class="{ active: isActive('/mano-de-obra') && !isActive('/nuevo-') }"
        >
          <span class="nav-icon">👷</span>
          Mano de Obra
        </router-link>
        <router-link 
          to="/acabados" 
          class="nav-link"
          :class="{ active: isActive('/acabados') && !isActive('/nuevo-') }"
        >
          <span class="nav-icon">✨</span>
          Acabados
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
  transition: all 0.2s;
  white-space: nowrap;
  position: relative;
}

.nav-icon {
  font-size: 18px;
}

.nav-link:hover {
  color: #d4a574;
  background: rgba(212, 165, 116, 0.1);
}

.nav-link.active {
  color: #d4a574;
  background: rgba(212, 165, 116, 0.15);
  font-weight: 600;
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
