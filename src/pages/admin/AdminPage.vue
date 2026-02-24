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

        <!-- Stats -->
        <div class="stats-row">
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
        <div class="section-card">
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
                                <span class="user-date">{{ formatDate(u.created_at) }}</span>
                            </td>
                            <td class="td-actions">
                                <button class="btn-icon btn-edit" @click="abrirModalEditar(u)" title="Editar">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </button>
                                <button
                                    class="btn-icon btn-delete"
                                    @click="confirmarEliminar(u)"
                                    title="Eliminar"
                                    :disabled="u.id === authStore.user?.id"
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
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
import { useAuthStore } from '@/stores/auth';
import { useUsuariosStore } from '@/stores/usuarios';

const authStore = useAuthStore();
const usuariosStore = useUsuariosStore();

const usuarios = ref([]);
const cargando = ref(true);
const busqueda = ref('');
const mensaje = ref(null);
const tipoMensaje = ref(null);

// Modal crear/editar
const mostrarModal = ref(false);
const editando = ref(false);
const editandoId = ref(null);
const guardando = ref(false);
const errorModal = ref(null);
const formUsuario = ref({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
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
    cargando.value = true;
    try {
        const data = await usuariosStore.fetchUsuarios();
        usuarios.value = data;
    } catch {
        mostrarMensajeUI('Error al cargar usuarios', 'error');
    } finally {
        cargando.value = false;
    }
};

const abrirModalCrear = () => {
    editando.value = false;
    editandoId.value = null;
    errorModal.value = null;
    formUsuario.value = { name: '', email: '', password: '', password_confirmation: '' };
    mostrarModal.value = true;
};

const abrirModalEditar = (u) => {
    editando.value = true;
    editandoId.value = u.id;
    errorModal.value = null;
    formUsuario.value = {
        name: u.name || u.nombre || '',
        email: u.email || '',
        password: '',
        password_confirmation: '',
    };
    mostrarModal.value = true;
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

onMounted(cargarUsuarios);
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
    width: 100px;
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
}

.btn-icon {
    width: 34px;
    height: 34px;
    border: 1px solid #e8e3dd;
    border-radius: 8px;
    background: white;
    color: #8b7355;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    margin: 0 3px;
}

.btn-icon:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.btn-edit:hover {
    background: #eff6ff;
    border-color: #93c5fd;
    color: #2563eb;
}

.btn-delete:hover {
    background: #fef2f2;
    border-color: #fca5a5;
    color: #dc2626;
}

.btn-delete:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.btn-delete:disabled:hover {
    background: white;
    border-color: #e8e3dd;
    color: #8b7355;
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
    .users-table td:nth-child(3) {
        display: none;
    }
}
</style>
