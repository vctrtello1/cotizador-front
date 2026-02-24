import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { routes } from './routes';

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  await authStore.initializeAuth();

  const isPublic = to.meta?.public === true;
  const isAuthenticated = authStore.isAuthenticated;

  if (!isPublic && !isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.name === 'Login' && isAuthenticated) {
    next('/cotizaciones');
  } else {
    next();
  }
});

export default router;