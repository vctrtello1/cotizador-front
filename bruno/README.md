# Colección de API - Cotizador

## 📋 Configuración

### 1. Seleccionar Environment
En Bruno (extensión de VS Code):
1. Abre el panel de Bruno (icono ⚡ en la barra lateral)
2. Haz clic en el dropdown de environments (arriba a la derecha)
3. Selecciona **"Local"**

### 2. Autenticación

#### Primer uso:
```
1. Abre: auth/Login.bru
2. Edita el body con tus credenciales reales
3. Ejecuta el request (Ctrl/Cmd + Enter)
4. El token se guarda automáticamente en {{authToken}}
```

### 3. Variables disponibles

- `{{baseUrl}}` → `http://localhost:8000/api/v1`
- `{{authToken}}` → Se establece automáticamente al hacer login

## 📁 Estructura

```
bruno/
├── auth/              → Autenticación (Login, Register, Logout, etc.)
├── tiras-led/         → CRUD completo de Tiras LED
└── environments/      → Variables de entorno
    └── Local.bru      → Configuración local
```

## 🚀 Uso rápido

1. **Login**: `auth/Login.bru` → Guarda el token automáticamente
2. **Listar Tiras LED**: `tiras-led/Get All.bru`
3. **Crear Tira LED**: `tiras-led/Create.bru`
4. **Actualizar**: `tiras-led/Update.bru` (cambiar ID en la URL)
5. **Eliminar**: `tiras-led/Delete.bru` (cambiar ID en la URL)

## ⚠️ Troubleshooting

### Error: "Unauthenticated"
**Causa**: No hay token válido o no se está enviando.

**Solución paso a paso**:
1. ✅ **Verifica que el environment "Local" esté seleccionado** (dropdown arriba a la derecha)
2. 🔑 **Ejecuta `auth/Login.bru`** con credenciales válidas
3. 📋 **Revisa la consola** (Output de Bruno) para ver si el token se guardó
4. 🔄 **Vuelve a intentar** el request que falló

**Verificación manual del token**:
- Abre `bruno/environments/Local.bru`
- Deberías ver `authToken: tu_token_aqui`
- Si está vacío, el login falló

### Error: "getaddrinfo ENOTFOUND {{baseUrl}}"
**Solución**: Verifica que el environment "Local" esté seleccionado en el dropdown de Bruno.

### Error: 401 Unauthorized
**Solución**: Ejecuta primero `auth/Login.bru` para obtener el token.

### Error: 404 Not Found
**Solución**: 
1. Verifica que el backend esté corriendo: `http://localhost:8000`
2. Ejecuta `Test Connection.bru` para probar la conexión
3. Verifica que la ruta del endpoint sea correcta
