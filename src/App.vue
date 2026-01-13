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
</style>
