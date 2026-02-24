import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api, { obtenerTokenCsrf } from "@/http/apl";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(JSON.parse(localStorage.getItem("auth_user") || "null"));
  const token = ref(localStorage.getItem("auth_token") || null);
  const permissions = ref(JSON.parse(localStorage.getItem("auth_permissions") || "[]"));
  const loading = ref(false);
  const error = ref(null);
  const initialized = ref(false);

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => {
    const role = user.value?.role || user.value?.rol;
    return role === 'admin' || role === 'administrador';
  });
  const hasPermission = (permission) => {
    // Admins have all permissions
    if (isAdmin.value) return true;
    return permissions.value.includes(permission);
  };

  const login = async (credentials) => {
    loading.value = true;
    error.value = null;

    try {
      // Obtener token CSRF antes del login
      await obtenerTokenCsrf();

      const response = await api.post("/auth/login", credentials);
      const data = response.data?.data || response.data;

      const authToken = data.token || data.access_token || response.data?.token;
      const authUser = data.user || data.usuario || data;
      const authPermissions = data.permissions || response.data?.permissions || [];
      const authRole = data.role || data.rol || authUser?.role || authUser?.rol;

      if (authToken) {
        token.value = authToken;
        localStorage.setItem("auth_token", authToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
      }

      if (authUser) {
        // Ensure role is on the user object
        if (authRole && !authUser.role) {
          authUser.role = authRole;
        }
        user.value = authUser;
        localStorage.setItem("auth_user", JSON.stringify(authUser));
      }

      permissions.value = Array.isArray(authPermissions) ? authPermissions : [];
      localStorage.setItem("auth_permissions", JSON.stringify(permissions.value));

      return data;
    } catch (err) {
      error.value = err?.response?.data?.message || "Error al iniciar sesión";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignorar error en logout
    } finally {
      token.value = null;
      user.value = null;
      permissions.value = [];
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_permissions");
      delete api.defaults.headers.common["Authorization"];
    }
  };

  const initializeAuth = async () => {
    if (initialized.value) return;

    initialized.value = true;
    error.value = null;

    if (!token.value) {
      user.value = null;
      permissions.value = [];
      return;
    }

    api.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;

    try {
      const response = await api.get('/auth/me');
      const meData = response.data?.data || response.data;
      user.value = meData?.user || meData || null;
      permissions.value = meData?.permissions || response.data?.permissions || [];
      // Ensure role is on the user object
      const meRole = meData?.role || meData?.rol || user.value?.role || user.value?.rol;
      if (user.value && meRole && !user.value.role) {
        user.value.role = meRole;
      }
      if (user.value) {
        localStorage.setItem('auth_user', JSON.stringify(user.value));
      }
      localStorage.setItem('auth_permissions', JSON.stringify(permissions.value));
    } catch {
      token.value = null;
      user.value = null;
      permissions.value = [];
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_permissions');
      delete api.defaults.headers.common['Authorization'];
    }
  };

  // Restaurar token al inicializar
  if (token.value) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
  }

  return {
    user,
    token,
    loading,
    error,
    initialized,
    isAuthenticated,
    isAdmin,
    permissions,
    hasPermission,
    login,
    logout,
    initializeAuth,
  };
});
