import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Request interceptor para agregar token CSRF
api.interceptors.request.use(
  (config) => {
    // Obtener token CSRF del localStorage, cookie o meta tag
    const csrfToken = 
      localStorage.getItem('csrf_token') ||
      document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
      getCsrfFromCookie();
    
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
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
      return decodeURIComponent(value);
    }
  }
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
    return Promise.reject(error);
  }
);

export default api;    