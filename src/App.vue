<script setup>
import Navbar from '@/components/Navbar.vue';
</script>

<template>
  <div class="app">
    <Navbar />

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
</style>
