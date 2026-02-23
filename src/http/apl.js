import axios from "axios";

const enableHttpDebug = import.meta.env.DEV && import.meta.env.VITE_HTTP_DEBUG === 'true';
const debugLog = (...args) => {
  if (enableHttpDebug) {
    console.log(...args);
  }
};
const debugWarn = (...args) => {
  if (enableHttpDebug) {
    console.warn(...args);
  }
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true,
});

// Función para obtener token CSRF del servidor
export async function obtenerTokenCsrf() {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  
  try {
    // Intentar con sanctum csrf-cookie (sin baseURL duplicado)
    const response = await axios.get(
      baseUrl.replace('/api/v1', '') + "/sanctum/csrf-cookie",
      { withCredentials: true }
    );
    debugLog('Token CSRF obtenido via /sanctum/csrf-cookie');
    return true;
  } catch (err) {
    debugWarn('Sanctum CSRF no disponible en /sanctum/csrf-cookie');
    
    try {
      // Intentar endpoint sin /api/v1
      const response = await axios.get(
        baseUrl.replace('/api/v1', '') + "/api/sanctum/csrf-cookie",
        { withCredentials: true }
      );
      debugLog('Token CSRF obtenido via /api/sanctum/csrf-cookie');
      return true;
    } catch (err2) {
      debugWarn('Sanctum CSRF no disponible');
      
      try {
        // Intentar endpoint personalizado sin baseURL duplicado
        const response = await axios.get(
          baseUrl.replace('/api/v1', '') + "/api/v1/csrf-token",
          { withCredentials: true }
        );
        if (response.data?.token) {
          localStorage.setItem('csrf_token', response.data.token);
          debugLog('Token CSRF obtenido del servidor personalizado');
        }
        return true;
      } catch (err3) {
        debugWarn('No se pudo obtener token CSRF automáticamente');
        return false;
      }
    }
  }
}

// Request interceptor para agregar token CSRF
api.interceptors.request.use(
  (config) => {
    // Para operaciones POST/PUT/DELETE, enviar token CSRF si está disponible
    if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
      const csrfToken = getCsrfFromCookie();
      
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
        config.headers['X-XSRF-TOKEN'] = csrfToken;
        debugLog('Token CSRF enviado en header:', csrfToken.substring(0, 20) + '...');
      } else {
        debugWarn('No se encontró token CSRF en cookies para enviar');
      }
      
      // Log del payload enviado
      if (enableHttpDebug && config.data) {
        debugLog(`📤 ${config.method.toUpperCase()} ${config.url}:`);
        debugLog('Payload completo:', JSON.stringify(config.data, null, 2));
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Función para obtener token CSRF de las cookies
function getCsrfFromCookie() {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'XSRF-TOKEN') {
      debugLog('Token XSRF encontrado en cookie:', value.substring(0, 20) + '...');
      return decodeURIComponent(value);
    }
  }
  debugWarn('Token XSRF no encontrado en cookies');
  return null;
}

// Response interceptor para limpiar respuestas que incluyan HTML antes del JSON
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es texto que contiene JSON, extrae el JSON
    if (typeof response.data === 'string') {
      // Busca el inicio del JSON válido (empieza con { o [)
      const jsonMatch = response.data.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          response.data = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("Error parsing JSON from response:", e);
        }
      }
    }
    return response;
  },
  (error) => {
    // Log detallado de errores
    if (error.response) {
      console.error(`❌ Error ${error.response.status}:`, error.response.data);
      if (error.response.data?.errors) {
        console.error('Errores de validación:', error.response.data.errors);
      }
      if (error.response.data?.message) {
        console.error('Mensaje del servidor:', error.response.data.message);
      }
    }
    return Promise.reject(error);
  }
);

export default api;    