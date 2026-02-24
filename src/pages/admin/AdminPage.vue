<template>
    <div class="admin-container">
        <!-- Header -->
        <div class="page-header">
            <div class="header-left">
                <h1 class="page-title">
                    <span class="title-icon">⚙️</span>
                    Panel de Administración
                </h1>
                <p class="header-subtitle">Gestión de usuarios del sistema</p>
            </div>
            <div class="header-right">
                <div class="admin-badge">
                    <span class="badge-icon">👤</span>
                    <span class="badge-text">{{ authStore.user?.name || authStore.user?.nombre || 'Admin' }}</span>
                </div>
            </div>
        </div>

        <!-- Acceso denegado -->
        <div v-if="sinAcceso" class="access-denied-card">
            <div class="access-denied-icon">🔒</div>
            <h2 class="access-denied-title">Acceso Denegado</h2>
            <p class="access-denied-desc">
                No tienes permisos para acceder al panel de administración.<br/>
                Contacta a un administrador para obtener acceso.
            </p>
            <div class="access-denied-info">
                <span class="access-denied-user">👤 {{ authStore.user?.name || authStore.user?.nombre || authStore.user?.email }}</span>
                <span class="access-denied-role" v-if="authStore.user?.role">Rol: {{ rolesMap[authStore.user.role] || authStore.user.role }}</span>
            </div>
            <router-link to="/cotizaciones" class="btn-back">
                ← Volver a Cotizaciones
            </router-link>
        </div>

        <!-- Stats -->
        <div v-if="!sinAcceso" class="stats-row">
            <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-info">
                    <span class="stat-value">{{ usuarios.length }}</span>
                    <span class="stat-label">Usuarios totales</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">✅</div>
                <div class="stat-info">
                    <span class="stat-value">{{ usuariosActivos }}</span>
                    <span class="stat-label">Activos</span>
                </div>
            </div>
            <div class="stat-card stat-card--accent">
                <div class="stat-icon">🕐</div>
                <div class="stat-info">
                    <span class="stat-value">{{ ultimoRegistro }}</span>
                    <span class="stat-label">Último registro</span>
                </div>
            </div>
        </div>

        <!-- Mensajes -->
        <transition name="fade">
            <div v-if="mensaje" class="custom-message" :class="`message-${tipoMensaje}`">
                <div class="message-content">
                    <span class="message-text">{{ mensaje }}</span>
                    <button @click="cerrarMensaje" class="message-close">✕</button>
                </div>
            </div>
        </transition>

        <!-- Sección Usuarios -->
        <div v-if="!sinAcceso" class="section-card">
            <div class="section-header">
                <h2 class="section-title">
                    <span class="section-icon">👥</span>
                    Usuarios
                    <span v-if="usuarios.length" class="section-count">{{ usuarios.length }}</span>
                </h2>
                <div class="section-actions">
                    <div class="search-wrapper">
                        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input
                            v-model="busqueda"
                            type="text"
                            class="search-input"
                            placeholder="Buscar usuario..."
                        />
                    </div>
                    <button class="btn-primary-sm" @click="abrirModalCrear">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Nuevo Usuario
                    </button>
                </div>
            </div>

            <!-- Loading -->
            <div v-if="cargando" class="loading-state">
                <div class="spinner"></div>
                <p>Cargando usuarios...</p>
            </div>

            <!-- Tabla -->
            <div v-else-if="usuariosFiltrados.length" class="table-wrapper">
                <table class="users-table">
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Correo</th>
                            <th>Rol</th>
                            <th>Registro</th>
                            <th class="th-actions">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="u in usuariosFiltrados" :key="u.id" class="user-row">
                            <td>
                                <div class="user-cell">
                                    <div class="user-avatar">{{ getInitials(u.name || u.nombre) }}</div>
                                    <div class="user-name-info">
                                        <span class="user-name">{{ u.name || u.nombre || 'Sin nombre' }}</span>
                                        <span class="user-id">#{{ u.id }}</span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="user-email">{{ u.email || '—' }}</span>
                            </td>
                            <td>
                                <span class="role-badge" :class="`role-${u.role || 'viewer'}`">
                                    {{ rolesMap[u.role] || rolesMap['viewer'] }}
                                </span>
                            </td>
                            <td>
                                <span class="user-date">{{ formatDate(u.created_at) }}</span>
                            </td>
                            <td class="td-actions">
                                <button class="btn-action btn-permisos" @click="abrirModalPermisos(u)" title="Permisos">
                                    🛡️
                                </button>
                                <button class="btn-action btn-edit" @click="abrirModalEditar(u)" title="Editar">
                                    ✏️
                                </button>
                                <button
                                    class="btn-action btn-delete"
                                    @click="confirmarEliminar(u)"
                                    title="Eliminar"
                                    :disabled="u.id === authStore.user?.id"
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Empty -->
            <div v-else class="empty-state">
                <span class="empty-icon">👥</span>
                <p class="empty-title">{{ busqueda ? 'Sin resultados' : 'No hay usuarios' }}</p>
                <p class="empty-desc">{{ busqueda ? 'Intenta con otro término de búsqueda' : 'Crea el primer usuario del sistema' }}</p>
            </div>
        </div>

        <!-- Modal Crear/Editar -->
        <Teleport to="body">
            <transition name="modal">
                <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
                    <div class="modal-card">
                        <div class="modal-header">
                            <h3 class="modal-title">{{ editando ? 'Editar Usuario' : 'Nuevo Usuario' }}</h3>
                            <button class="modal-close" @click="cerrarModal">×</button>
                        </div>

                        <form @submit.prevent="guardarUsuario" class="modal-body">
                            <div class="form-group">
                                <label class="form-label">Nombre <span class="required">*</span></label>
                                <input
                                    v-model="formUsuario.name"
                                    type="text"
                                    class="form-input"
                                    placeholder="Nombre completo"
                                    required
                                />
                            </div>

                            <div class="form-group">
                                <label class="form-label">Correo electrónico <span class="required">*</span></label>
                                <input
                                    v-model="formUsuario.email"
                                    type="email"
                                    class="form-input"
                                    placeholder="correo@ejemplo.com"
                                    required
                                />
                            </div>

                            <div class="form-group">
                                <label class="form-label">Rol <span class="required">*</span></label>
                                <div class="role-selector">
                                    <button
                                        v-for="r in rolesDisponibles"
                                        :key="r.value"
                                        type="button"
                                        class="role-option"
                                        :class="{ 'role-option--active': formUsuario.role === r.value }"
                                        @click="formUsuario.role = r.value"
                                    >
                                        <span class="role-option-icon">{{ r.icon }}</span>
                                        <span class="role-option-label">{{ r.label }}</span>
                                        <span class="role-option-desc">{{ r.desc }}</span>
                                    </button>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">
                                    Contraseña
                                    <span v-if="!editando" class="required">*</span>
                                    <span v-else class="hint">(dejar vacío para no cambiar)</span>
                                </label>
                                <input
                                    v-model="formUsuario.password"
                                    type="password"
                                    class="form-input"
                                    :placeholder="editando ? '••••••••' : 'Mínimo 8 caracteres'"
                                    :required="!editando"
                                    minlength="8"
                                />
                            </div>

                            <div v-if="formUsuario.password" class="form-group">
                                <label class="form-label">Confirmar contraseña <span class="required">*</span></label>
                                <input
                                    v-model="formUsuario.password_confirmation"
                                    type="password"
                                    class="form-input"
                                    placeholder="Repetir contraseña"
                                    required
                                    minlength="8"
                                />
                                <span v-if="formUsuario.password && formUsuario.password_confirmation && formUsuario.password !== formUsuario.password_confirmation" class="error-text">
                                    Las contraseñas no coinciden
                                </span>
                            </div>

                            <transition name="fade">
                                <div v-if="errorModal" class="modal-error">
                                    <span>⚠️ {{ errorModal }}</span>
                                </div>
                            </transition>

                            <div class="modal-actions">
                                <button type="button" class="btn-secondary" @click="cerrarModal">Cancelar</button>
                                <button type="submit" class="btn-primary" :disabled="guardando || passwordMismatch">
                                    <span v-if="guardando" class="btn-loading-inline">
                                        <span class="spinner-sm"></span> Guardando...
                                    </span>
                                    <span v-else>{{ editando ? 'Guardar Cambios' : 'Crear Usuario' }}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </transition>
        </Teleport>

        <!-- Modal Permisos -->
        <Teleport to="body">
            <transition name="modal">
                <div v-if="mostrarModalPermisos" class="modal-overlay" @click.self="cerrarModalPermisos">
                    <div class="modal-card modal-card--lg">
                        <div class="modal-header modal-header--permisos">
                            <div class="modal-header-info">
                                <h3 class="modal-title">Permisos de {{ usuarioPermisos?.name || usuarioPermisos?.nombre }}</h3>
                                <span class="role-badge" :class="`role-${formPermisos.role}`">{{ rolesMap[formPermisos.role] || 'Viewer' }}</span>
                            </div>
                            <button class="modal-close" @click="cerrarModalPermisos">×</button>
                        </div>

                        <div class="modal-body permisos-body">
                            <!-- Rol -->
                            <div class="permisos-section">
                                <h4 class="permisos-section-title">Rol del usuario</h4>
                                <div class="role-selector role-selector--compact">
                                    <button
                                        v-for="r in rolesDisponibles"
                                        :key="r.value"
                                        type="button"
                                        class="role-option"
                                        :class="{ 'role-option--active': formPermisos.role === r.value }"
                                        @click="seleccionarRol(r.value)"
                                    >
                                        <span class="role-option-icon">{{ r.icon }}</span>
                                        <span class="role-option-label">{{ r.label }}</span>
                                    </button>
                                </div>
                                <p v-if="formPermisos.role === 'admin'" class="admin-notice">
                                    🛡️ Los administradores tienen acceso completo a todas las funciones.
                                </p>
                            </div>

                            <!-- Permisos granulares -->
                            <div v-if="formPermisos.role !== 'admin'" class="permisos-section">
                                <div class="permisos-header-row">
                                    <h4 class="permisos-section-title">Permisos específicos</h4>
                                    <div class="permisos-bulk-actions">
                                        <button type="button" class="btn-link" @click="seleccionarTodos">Seleccionar todos</button>
                                        <span class="bulk-sep">|</span>
                                        <button type="button" class="btn-link" @click="deseleccionarTodos">Quitar todos</button>
                                    </div>
                                </div>

                                <div class="permisos-grid">
                                    <div v-for="grupo in permisosAgrupados" :key="grupo.entidad" class="permiso-grupo">
                                        <div class="permiso-grupo-header">
                                            <span class="permiso-grupo-icon">{{ grupo.icon }}</span>
                                            <span class="permiso-grupo-name">{{ grupo.label }}</span>
                                            <button
                                                type="button"
                                                class="btn-toggle-grupo"
                                                @click="toggleGrupo(grupo.entidad)"
                                                :title="grupoCompleto(grupo.entidad) ? 'Quitar todos' : 'Seleccionar todos'"
                                            >
                                                {{ grupoCompleto(grupo.entidad) ? '✓' : '○' }}
                                            </button>
                                        </div>
                                        <div class="permiso-acciones">
                                            <label
                                                v-for="accion in acciones"
                                                :key="`${grupo.entidad}.${accion.value}`"
                                                class="permiso-check"
                                                :class="{ 'permiso-check--active': formPermisos.permissions.includes(`${grupo.entidad}.${accion.value}`) }"
                                            >
                                                <input
                                                    type="checkbox"
                                                    :value="`${grupo.entidad}.${accion.value}`"
                                                    v-model="formPermisos.permissions"
                                                    class="permiso-checkbox"
                                                />
                                                <span class="permiso-accion-icon">{{ accion.icon }}</span>
                                                <span class="permiso-accion-label">{{ accion.label }}</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div class="permisos-summary">
                                    <span class="permisos-count">
                                        {{ formPermisos.permissions.length }} de {{ totalPermisos }} permisos seleccionados
                                    </span>
                                </div>
                            </div>

                            <transition name="fade">
                                <div v-if="errorPermisos" class="modal-error">
                                    <span>⚠️ {{ errorPermisos }}</span>
                                </div>
                            </transition>

                            <div class="modal-actions">
                                <button type="button" class="btn-secondary" @click="cerrarModalPermisos">Cancelar</button>
                                <button type="button" class="btn-primary" @click="guardarPermisos" :disabled="guardandoPermisos">
                                    <span v-if="guardandoPermisos" class="btn-loading-inline">
                                        <span class="spinner-sm"></span> Guardando...
                                    </span>
                                    <span v-else>Guardar Permisos</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>

        <!-- Modal Confirmar Eliminar -->
        <Teleport to="body">
            <transition name="modal">
                <div v-if="mostrarConfirmacion" class="modal-overlay" @click.self="mostrarConfirmacion = false">
                    <div class="modal-card modal-card--sm">
                        <div class="modal-header modal-header--danger">
                            <h3 class="modal-title">Eliminar Usuario</h3>
                            <button class="modal-close" @click="mostrarConfirmacion = false">×</button>
                        </div>
                        <div class="modal-body">
                            <p class="confirm-text">
                                ¿Estás seguro de eliminar a <strong>{{ usuarioAEliminar?.name || usuarioAEliminar?.nombre }}</strong>?
                            </p>
                            <p class="confirm-warning">Esta acción no se puede deshacer.</p>
                            <div class="modal-actions">
                                <button class="btn-secondary" @click="mostrarConfirmacion = false">Cancelar</button>
                                <button class="btn-danger" @click="eliminarUsuario" :disabled="eliminando">
                                    {{ eliminando ? 'Eliminando...' : 'Sí, Eliminar' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </transition>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useUsuariosStore } from '@/stores/usuarios';

const router = useRouter();
const authStore = useAuthStore();
const usuariosStore = useUsuariosStore();

const usuarios = ref([]);
const cargando = ref(true);
const sinAcceso = ref(false);
const busqueda = ref('');
const mensaje = ref(null);
const tipoMensaje = ref(null);

// Roles
const rolesMap = {
    admin: 'Administrador',
    editor: 'Editor',
    viewer: 'Visualizador',
};

const rolesDisponibles = [
    { value: 'admin', label: 'Admin', icon: '🛡️', desc: 'Acceso total al sistema' },
    { value: 'editor', label: 'Editor', icon: '✏️', desc: 'Crear y editar registros' },
    { value: 'viewer', label: 'Viewer', icon: '👁️', desc: 'Solo lectura' },
];

// Permisos
const permisosAgrupados = [
    { entidad: 'cotizaciones', label: 'Cotizaciones', icon: '📋' },
    { entidad: 'modulos', label: 'Módulos', icon: '🧩' },
    { entidad: 'componentes', label: 'Componentes', icon: '🔧' },
    { entidad: 'estructuras', label: 'Estructuras', icon: '🏗️' },
    { entidad: 'acabado_tablero', label: 'Acabado Tablero', icon: '🎨' },
    { entidad: 'acabado_cubre_canto', label: 'Acabado Cubre Canto', icon: '🧵' },
    { entidad: 'correderas', label: 'Correderas', icon: '🎚️' },
    { entidad: 'compases_abatibles', label: 'Compases Abatibles', icon: '🔀' },
    { entidad: 'puertas', label: 'Puertas', icon: '🚪' },
    { entidad: 'accesorios', label: 'Accesorios', icon: '🔩' },
    { entidad: 'usuarios', label: 'Usuarios', icon: '👥' },
];

const acciones = [
    { value: 'ver', label: 'Ver', icon: '👁️' },
    { value: 'crear', label: 'Crear', icon: '➕' },
    { value: 'editar', label: 'Editar', icon: '✏️' },
    { value: 'eliminar', label: 'Eliminar', icon: '🗑️' },
];

const totalPermisos = computed(() => permisosAgrupados.length * acciones.length);

// Modal crear/editar
const mostrarModal = ref(false);
const editando = ref(false);
const editandoId = ref(null);
const guardando = ref(false);
const errorModal = ref(null);
const formUsuario = ref({
    name: '',
    email: '',
    role: 'viewer',
    password: '',
    password_confirmation: '',
});

// Modal permisos
const mostrarModalPermisos = ref(false);
const usuarioPermisos = ref(null);
const guardandoPermisos = ref(false);
const errorPermisos = ref(null);
const cargandoPermisos = ref(false);
const formPermisos = ref({
    role: 'viewer',
    permissions: [],
});

// Modal confirmar eliminar
const mostrarConfirmacion = ref(false);
const usuarioAEliminar = ref(null);
const eliminando = ref(false);

const passwordMismatch = computed(() => {
    if (!formUsuario.value.password) return false;
    return formUsuario.value.password_confirmation && formUsuario.value.password !== formUsuario.value.password_confirmation;
});

const usuariosFiltrados = computed(() => {
    if (!busqueda.value.trim()) return usuarios.value;
    const q = busqueda.value.toLowerCase();
    return usuarios.value.filter(u =>
        (u.name || u.nombre || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
    );
});

const usuariosActivos = computed(() => usuarios.value.length);

const ultimoRegistro = computed(() => {
    if (!usuarios.value.length) return '—';
    const sorted = [...usuarios.value].sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    );
    return formatDate(sorted[0]?.created_at);
});

const mostrarMensajeUI = (texto, tipo = 'success', duracion = 3000) => {
    mensaje.value = texto;
    tipoMensaje.value = tipo;
    if (duracion > 0) {
        setTimeout(() => { mensaje.value = null; tipoMensaje.value = null; }, duracion);
    }
};

const cerrarMensaje = () => {
    mensaje.value = null;
    tipoMensaje.value = null;
};

const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
        return new Date(dateStr).toLocaleDateString('es-MX', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    } catch {
        return dateStr;
    }
};

const cargarUsuarios = async () => {
    if (!authStore.hasPermission('users.read')) {
        sinAcceso.value = true;
        return;
    }

    cargando.value = true;
    sinAcceso.value = false;
    try {
        const data = await usuariosStore.fetchUsuarios();
        usuarios.value = data;
    } catch (err) {
        const status = err?.response?.status;
        if (status === 403) {
            sinAcceso.value = true;
        } else {
            mostrarMensajeUI('Error al cargar usuarios', 'error');
        }
    } finally {
        cargando.value = false;
    }
};

const abrirModalCrear = () => {
    editando.value = false;
    editandoId.value = null;
    errorModal.value = null;
    formUsuario.value = { name: '', email: '', role: 'viewer', password: '', password_confirmation: '' };
    mostrarModal.value = true;
};

const abrirModalEditar = (u) => {
    editando.value = true;
    editandoId.value = u.id;
    errorModal.value = null;
    formUsuario.value = {
        name: u.name || u.nombre || '',
        email: u.email || '',
        role: u.role || 'viewer',
        password: '',
        password_confirmation: '',
    };
    mostrarModal.value = true;
};

// === Permisos ===
const abrirModalPermisos = async (u) => {
    usuarioPermisos.value = u;
    errorPermisos.value = null;
    cargandoPermisos.value = true;

    // Cargar permisos actuales del usuario
    const data = await usuariosStore.fetchPermisosUsuario(u.id);
    formPermisos.value = {
        role: data.role || u.role || 'viewer',
        permissions: Array.isArray(data.permissions) ? [...data.permissions] : [],
    };
    cargandoPermisos.value = false;
    mostrarModalPermisos.value = true;
};

const cerrarModalPermisos = () => {
    mostrarModalPermisos.value = false;
    usuarioPermisos.value = null;
    errorPermisos.value = null;
};

const seleccionarRol = (role) => {
    formPermisos.value.role = role;
    if (role === 'admin') {
        // Admin tiene todo, limpiamos permisos granulares
        formPermisos.value.permissions = [];
    }
};

const toggleGrupo = (entidad) => {
    const permsGrupo = acciones.map(a => `${entidad}.${a.value}`);
    const todosActivos = permsGrupo.every(p => formPermisos.value.permissions.includes(p));
    if (todosActivos) {
        formPermisos.value.permissions = formPermisos.value.permissions.filter(p => !permsGrupo.includes(p));
    } else {
        const nuevos = permsGrupo.filter(p => !formPermisos.value.permissions.includes(p));
        formPermisos.value.permissions.push(...nuevos);
    }
};

const grupoCompleto = (entidad) => {
    return acciones.every(a => formPermisos.value.permissions.includes(`${entidad}.${a.value}`));
};

const seleccionarTodos = () => {
    const todos = [];
    permisosAgrupados.forEach(g => {
        acciones.forEach(a => todos.push(`${g.entidad}.${a.value}`));
    });
    formPermisos.value.permissions = todos;
};

const deseleccionarTodos = () => {
    formPermisos.value.permissions = [];
};

const guardarPermisos = async () => {
    guardandoPermisos.value = true;
    errorPermisos.value = null;
    try {
        await usuariosStore.actualizarPermisosUsuario(usuarioPermisos.value.id, {
            role: formPermisos.value.role,
            permissions: formPermisos.value.role === 'admin' ? [] : formPermisos.value.permissions,
        });
        // Actualizar rol en la lista local
        const idx = usuarios.value.findIndex(u => u.id === usuarioPermisos.value.id);
        if (idx !== -1) {
            usuarios.value[idx] = { ...usuarios.value[idx], role: formPermisos.value.role, permissions: formPermisos.value.permissions };
        }
        cerrarModalPermisos();
        mostrarMensajeUI('Permisos actualizados correctamente');
    } catch (err) {
        const serverMsg = err?.response?.data?.message || err?.response?.data?.error;
        errorPermisos.value = serverMsg || 'Error al guardar los permisos';
    } finally {
        guardandoPermisos.value = false;
    }
};

const cerrarModal = () => {
    mostrarModal.value = false;
    errorModal.value = null;
};

const guardarUsuario = async () => {
    if (passwordMismatch.value) return;
    guardando.value = true;
    errorModal.value = null;

    try {
        const datos = {
            name: formUsuario.value.name.trim(),
            email: formUsuario.value.email.trim(),
            role: formUsuario.value.role,
        };

        if (formUsuario.value.password) {
            datos.password = formUsuario.value.password;
            datos.password_confirmation = formUsuario.value.password_confirmation;
        }

        if (editando.value) {
            await usuariosStore.actualizarUsuario(editandoId.value, datos);
            mostrarMensajeUI('Usuario actualizado correctamente');
        } else {
            await usuariosStore.crearUsuario(datos);
            mostrarMensajeUI('Usuario creado correctamente');
        }

        usuarios.value = usuariosStore.usuarios;
        cerrarModal();
    } catch (err) {
        const serverMsg = err?.response?.data?.message || err?.response?.data?.error;
        const validationErrors = err?.response?.data?.errors;
        if (validationErrors) {
            const firstError = Object.values(validationErrors)[0];
            errorModal.value = Array.isArray(firstError) ? firstError[0] : firstError;
        } else {
            errorModal.value = serverMsg || 'Error al guardar el usuario';
        }
    } finally {
        guardando.value = false;
    }
};

const confirmarEliminar = (u) => {
    if (u.id === authStore.user?.id) return;
    usuarioAEliminar.value = u;
    mostrarConfirmacion.value = true;
};

const eliminarUsuario = async () => {
    if (!usuarioAEliminar.value) return;
    eliminando.value = true;
    try {
        await usuariosStore.eliminarUsuario(usuarioAEliminar.value.id);
        usuarios.value = usuariosStore.usuarios;
        mostrarConfirmacion.value = false;
        mostrarMensajeUI('Usuario eliminado');
    } catch {
        mostrarMensajeUI('Error al eliminar usuario', 'error');
    } finally {
        eliminando.value = false;
        usuarioAEliminar.value = null;
    }
};

onMounted(async () => {
    await authStore.initializeAuth();

    if (!authStore.hasPermission('users.read')) {
        router.replace('/cotizaciones');
        return;
    }

    await cargarUsuarios();
});
</script>

<style scoped>
/* ========== Container ========== */
@keyframes pageEntrance {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
}

.admin-container {
    max-width: 960px;
    margin: 0 auto;
    padding: 24px 20px 40px;
    min-height: 100vh;
    animation: pageEntrance 0.4s ease-out;
}

/* ========== Header ========== */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
}

.header-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.page-title {
    font-size: 24px;
    font-weight: 700;
    color: #2c2c2c;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
}

.title-icon { font-size: 28px; }

.header-subtitle {
    font-size: 14px;
    color: #8b8b8b;
    margin: 0;
    font-weight: 500;
}

.admin-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: linear-gradient(135deg, #f5f1ed 0%, #ebe5dd 100%);
    border: 1px solid #e0dbd5;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    color: #5a4037;
}

.badge-icon { font-size: 18px; }

/* ========== Stats ========== */
.stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}

.stat-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px 20px;
    background: white;
    border: 1px solid #e8e3dd;
    border-radius: 14px;
    box-shadow: 0 1px 4px rgba(90, 64, 55, 0.06);
    transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(90, 64, 55, 0.1);
}

.stat-card--accent {
    border-color: #d4a574;
    background: linear-gradient(135deg, #fefcfa 0%, #faf5ee 100%);
}

.stat-icon { font-size: 28px; }

.stat-info {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 22px;
    font-weight: 700;
    color: #2c2c2c;
}

.stat-label {
    font-size: 12px;
    color: #8b8b8b;
    font-weight: 500;
}

/* ========== Messages ========== */
.custom-message {
    padding: 12px 16px;
    border-radius: 10px;
    margin-bottom: 16px;
    font-size: 13px;
    font-weight: 500;
}

.message-success {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
}

.message-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
}

.message-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.message-close {
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    opacity: 0.5;
    color: inherit;
}

.message-close:hover { opacity: 1; }

/* ========== Section Card ========== */
.section-card {
    background: white;
    border: 1px solid #e8e3dd;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 1px 4px rgba(90, 64, 55, 0.06);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 12px;
}

.section-title {
    font-size: 18px;
    font-weight: 700;
    color: #2c2c2c;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.section-icon { font-size: 20px; }

.section-count {
    background: #d4a574;
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 12px;
}

.section-actions {
    display: flex;
    gap: 10px;
    align-items: center;
}

.search-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: 10px;
    color: #b0a89e;
    pointer-events: none;
}

.search-input {
    padding: 8px 12px 8px 34px;
    border: 1px solid #e0dbd5;
    border-radius: 8px;
    font-size: 13px;
    background: #faf9f7;
    outline: none;
    width: 200px;
    transition: border-color 0.2s, box-shadow 0.2s;
    font-family: inherit;
}

.search-input:focus {
    border-color: #d4a574;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.15);
}

.btn-primary-sm {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s;
    font-family: inherit;
    white-space: nowrap;
}

.btn-primary-sm:hover {
    background: linear-gradient(135deg, #c89564 0%, #b8854e 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

/* ========== Table ========== */
.table-wrapper {
    overflow-x: auto;
}

.users-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 14px;
}

.users-table thead tr {
    background: #f9f7f4;
}

.users-table th {
    text-align: left;
    padding: 12px 16px;
    font-weight: 600;
    color: #8b7355;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #e8e3dd;
}

.th-actions {
    text-align: center;
    width: 150px;
    min-width: 150px;
}

.users-table td {
    padding: 14px 16px;
    border-bottom: 1px solid #f0ede8;
    color: #2c2c2c;
}

.user-row {
    transition: background 0.15s;
}

.user-row:hover {
    background: #faf9f7;
}

.user-cell {
    display: flex;
    align-items: center;
    gap: 12px;
}

.user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    flex-shrink: 0;
}

.user-name-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.user-name {
    font-weight: 600;
    color: #2c2c2c;
}

.user-id {
    font-size: 11px;
    color: #b0a89e;
}

.user-email {
    color: #6b6b6b;
    font-size: 13px;
}

.user-date {
    color: #8b8b8b;
    font-size: 13px;
}

.td-actions {
    text-align: center;
    white-space: nowrap;
}

.btn-action {
    width: 34px;
    height: 34px;
    border: 1px solid #e8e3dd;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    margin: 0 2px;
    font-size: 16px;
    line-height: 1;
    padding: 0;
}

.btn-action:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.btn-edit:hover {
    background: #eff6ff;
    border-color: #93c5fd;
}

.btn-delete:hover {
    background: #fef2f2;
    border-color: #fca5a5;
}

.btn-permisos:hover {
    background: #fef3c7;
    border-color: #f59e0b;
}

.btn-delete:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.btn-delete:disabled:hover {
    background: white;
    border-color: #e8e3dd;
    transform: none;
    box-shadow: none;
}

/* ========== Empty ========== */
.empty-state {
    text-align: center;
    padding: 48px 20px;
}

.empty-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 12px;
}

.empty-title {
    font-size: 16px;
    font-weight: 600;
    color: #5a4037;
    margin: 0 0 4px;
}

.empty-desc {
    font-size: 13px;
    color: #8b8b8b;
    margin: 0;
}

/* ========== Loading ========== */
.loading-state {
    text-align: center;
    padding: 48px 20px;
    color: #8b8b8b;
}

.spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e8e3dd;
    border-top-color: #d4a574;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    margin: 0 auto 12px;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ========== Modal ========== */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    backdrop-filter: blur(4px);
}

.modal-card {
    background: white;
    border-radius: 16px;
    width: 100%;
    max-width: 480px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    overflow: hidden;
}

.modal-card--sm { max-width: 400px; }

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #f0ede8;
    background: #faf9f7;
}

.modal-header--danger {
    background: #fef2f2;
    border-bottom-color: #fecaca;
}

.modal-title {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
    color: #2c2c2c;
}

.modal-close {
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    font-size: 22px;
    color: #8b8b8b;
    cursor: pointer;
    border-radius: 8px;
    transition: background 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-close:hover {
    background: #f0ede8;
    color: #2c2c2c;
}

.modal-body {
    padding: 24px;
}

.form-group {
    margin-bottom: 18px;
}

.form-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #5a4037;
    margin-bottom: 6px;
}

.required { color: #dc2626; }

.hint {
    font-weight: 400;
    color: #8b8b8b;
    font-size: 12px;
}

.form-input {
    width: 100%;
    padding: 10px 14px;
    font-size: 14px;
    border: 1.5px solid #e0dbd5;
    border-radius: 10px;
    background: #faf9f7;
    color: #2c2c2c;
    transition: all 0.25s;
    outline: none;
    font-family: inherit;
    box-sizing: border-box;
}

.form-input:focus {
    border-color: #d4a574;
    background: white;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.15);
}

.error-text {
    font-size: 12px;
    color: #dc2626;
    margin-top: 4px;
    display: block;
}

.modal-error {
    padding: 10px 14px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    font-size: 13px;
    color: #991b1b;
    margin-bottom: 16px;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}

.btn-secondary {
    padding: 10px 20px;
    background: white;
    border: 1px solid #e0dbd5;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    color: #5a4037;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
}

.btn-secondary:hover {
    background: #f5f1ed;
    border-color: #d4a574;
}

.btn-primary {
    padding: 10px 20px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    color: white;
    cursor: pointer;
    transition: all 0.25s;
    font-family: inherit;
}

.btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #c89564 0%, #b8854e 100%);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.btn-primary:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

.btn-danger {
    padding: 10px 20px;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    color: white;
    cursor: pointer;
    transition: all 0.25s;
    font-family: inherit;
}

.btn-danger:hover:not(:disabled) {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-danger:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

.confirm-text {
    font-size: 14px;
    color: #2c2c2c;
    margin: 0 0 8px;
    line-height: 1.5;
}

.confirm-warning {
    font-size: 13px;
    color: #dc2626;
    margin: 0 0 8px;
}

.btn-loading-inline {
    display: flex;
    align-items: center;
    gap: 6px;
}

.spinner-sm {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
}

/* ========== Transitions ========== */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.modal-enter-active { transition: all 0.3s ease-out; }
.modal-leave-active { transition: all 0.2s ease-in; }
.modal-enter-from { opacity: 0; }
.modal-enter-from .modal-card { transform: translateY(20px) scale(0.95); }
.modal-leave-to { opacity: 0; }
.modal-leave-to .modal-card { transform: translateY(10px) scale(0.97); }

/* ========== Responsive ========== */
@media (max-width: 640px) {
    .page-header { flex-direction: column; align-items: flex-start; }
    .section-header { flex-direction: column; align-items: flex-start; }
    .section-actions { width: 100%; flex-direction: column; }
    .search-input { width: 100%; }
    .stats-row { grid-template-columns: 1fr; }

    .users-table th:nth-child(3),
    .users-table td:nth-child(3),
    .users-table th:nth-child(4),
    .users-table td:nth-child(4) {
        display: none;
    }
}

/* ========== Role Badges ========== */
.role-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.role-admin {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    color: #92400e;
    border: 1px solid #f59e0b;
}

.role-editor {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    color: #1e40af;
    border: 1px solid #60a5fa;
}

.role-viewer {
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    color: #4b5563;
    border: 1px solid #9ca3af;
}

/* ========== Role Selector ========== */
.role-selector {
    display: flex;
    gap: 10px;
}

.role-selector--compact {
    gap: 8px;
    margin-bottom: 12px;
}

.role-option {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px 10px;
    border: 2px solid #e8e3dd;
    border-radius: 12px;
    background: #faf9f7;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
}

.role-option:hover {
    border-color: #d4a574;
    background: #fdf8f3;
}

.role-option--active {
    border-color: #d4a574;
    background: linear-gradient(135deg, #fdf8f3 0%, #faf1e6 100%);
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.15);
}

.role-option-icon { font-size: 22px; }

.role-option-label {
    font-size: 13px;
    font-weight: 700;
    color: #2c2c2c;
}

.role-option-desc {
    font-size: 11px;
    color: #8b8b8b;
    text-align: center;
    line-height: 1.3;
}

.admin-notice {
    font-size: 13px;
    color: #92400e;
    background: #fef3c7;
    border: 1px solid #fde68a;
    border-radius: 8px;
    padding: 10px 14px;
    margin-top: 8px;
}

/* ========== Permissions Modal ========== */
.modal-card--lg {
    max-width: 680px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
}

.modal-header--permisos {
    background: linear-gradient(135deg, #f5f1ed 0%, #ebe5dd 100%);
}

.modal-header-info {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

.permisos-body {
    overflow-y: auto;
    max-height: calc(90vh - 80px);
}

.permisos-section {
    margin-bottom: 24px;
}

.permisos-section-title {
    font-size: 15px;
    font-weight: 700;
    color: #2c2c2c;
    margin: 0 0 12px;
}

.permisos-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 8px;
}

.permisos-header-row .permisos-section-title {
    margin: 0;
}

.permisos-bulk-actions {
    display: flex;
    align-items: center;
    gap: 6px;
}

.btn-link {
    background: none;
    border: none;
    color: #d4a574;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    padding: 2px 4px;
    transition: color 0.2s;
    font-family: inherit;
}

.btn-link:hover {
    color: #b8854e;
    text-decoration: underline;
}

.bulk-sep { color: #d4d0ca; font-size: 12px; }

.permisos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
}

.permiso-grupo {
    border: 1px solid #e8e3dd;
    border-radius: 12px;
    padding: 14px;
    background: #faf9f7;
    transition: border-color 0.2s;
}

.permiso-grupo:hover {
    border-color: #d4c8b8;
}

.permiso-grupo-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ede8e1;
}

.permiso-grupo-icon { font-size: 18px; }

.permiso-grupo-name {
    font-size: 13px;
    font-weight: 700;
    color: #2c2c2c;
    flex: 1;
}

.btn-toggle-grupo {
    width: 24px;
    height: 24px;
    border: 1.5px solid #d4c8b8;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #8b7355;
    transition: all 0.2s;
    font-family: inherit;
}

.btn-toggle-grupo:hover {
    border-color: #d4a574;
    background: #fdf8f3;
}

.permiso-acciones {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
}

.permiso-check {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
    font-size: 12px;
    color: #6b6b6b;
    background: white;
    border: 1px solid transparent;
}

.permiso-check:hover {
    background: #f0ede8;
}

.permiso-check--active {
    background: #fdf8f3;
    border-color: #d4a574;
    color: #5a4037;
}

.permiso-checkbox {
    display: none;
}

.permiso-accion-icon {
    font-size: 13px;
}

.permiso-accion-label {
    font-weight: 500;
}

.permisos-summary {
    text-align: center;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid #ede8e1;
}

.permisos-count {
    font-size: 13px;
    color: #8b7355;
    font-weight: 600;
}

/* ========== Access Denied ========== */
.access-denied-card {
    max-width: 460px;
    margin: 40px auto;
    text-align: center;
    background: white;
    border: 1px solid #e8e3dd;
    border-radius: 16px;
    padding: 48px 32px;
    box-shadow: 0 1px 4px rgba(90, 64, 55, 0.06);
}

.access-denied-icon {
    font-size: 56px;
    margin-bottom: 16px;
}

.access-denied-title {
    font-size: 22px;
    font-weight: 700;
    color: #2c2c2c;
    margin: 0 0 12px;
}

.access-denied-desc {
    font-size: 14px;
    color: #6b6b6b;
    line-height: 1.6;
    margin: 0 0 20px;
}

.access-denied-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 14px;
    background: #faf9f7;
    border: 1px solid #e8e3dd;
    border-radius: 10px;
    margin-bottom: 24px;
}

.access-denied-user {
    font-size: 14px;
    font-weight: 600;
    color: #5a4037;
}

.access-denied-role {
    font-size: 12px;
    color: #8b7355;
}

.btn-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 24px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.25s;
}

.btn-back:hover {
    background: linear-gradient(135deg, #c89564 0%, #b8854e 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

@media (max-width: 640px) {
    .role-selector { flex-direction: column; gap: 8px; }
    .permisos-grid { grid-template-columns: 1fr; }
}
</style>
