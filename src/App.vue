<script setup>
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const isActive = (path) => {
  return route.path.startsWith(path);
};
</script>

<template>
  <div class="app">
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <h1 class="logo-text">🍍 Cotizador</h1>
        </div>
        <nav class="nav-menu">
          <router-link 
            to="/cotizaciones" 
            class="nav-link"
            :class="{ active: isActive('/cotizaciones') && !isActive('/nueva-') }"
          >
            Cotizaciones
          </router-link>
          <router-link 
            to="/modulos" 
            class="nav-link"
            :class="{ active: isActive('/modulos') && !isActive('/nuevo-') }"
          >
            Módulos
          </router-link>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <router-view />
    </main>

    <footer class="app-footer">
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
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
  background: #faf7f2;
}

.app-header {
  background: linear-gradient(135deg, #5a4037 0%, #6d4c41 100%);
  padding: 20px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
}

.logo-section {
  flex-shrink: 0;
}

.logo-text {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #d4a574;
  text-decoration: none;
  letter-spacing: 1px;
}

.nav-menu {
  display: flex;
  gap: 30px;
  flex: 1;
}

.nav-link {
  padding: 8px 16px;
  color: #d4a574;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
}

.nav-link:hover {
  color: #e8bb87;
  border-bottom-color: #d4a574;
}

.nav-link.active {
  color: #e8bb87;
  border-bottom-color: #d4a574;
}

.app-main {
  flex: 1;
  padding: 0;
}

.app-footer {
  background: #5a4037;
  color: #d4a574;
  text-align: center;
  padding: 20px;
  margin-top: 40px;
  border-top: 1px solid #d4a574;
}

.app-footer p {
  margin: 0;
  font-size: 13px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .nav-menu {
    flex-direction: column;
    gap: 0;
    width: 100%;
  }

  .nav-link {
    padding: 10px 0;
    border-bottom: none;
    border-left: 3px solid transparent;
    padding-left: 10px;
  }

  .nav-link:hover,
  .nav-link.active {
    border-left-color: #d4a574;
    border-bottom: none;
  }
}
</style>
