<template>
    <div class="componentes-container">
        <!-- Header -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-text">
                    <h1 class="page-title">Componentes</h1>
                    <p class="header-subtitle">Gestiona y visualiza todos tus componentes</p>
                </div>
                <button v-if="canWrite" class="btn-primary btn-new" @click="$router.push('/nuevo-componente')">
                    <span class="btn-icon">+</span>
                    Nuevo Componente
                </button>
            </div>
        </div>

        <!-- Mensaje de error -->
        <transition name="fade">
            <div v-if="error" class="alert alert-error">
                <span class="alert-icon">⚠️</span>
                <span class="alert-text">{{ error }}</span>
                <button @click="error = null" class="alert-close">×</button>
            </div>
        </transition>

        <!-- Mensaje de éxito -->
        <transition name="fade">
            <div v-if="exito" class="alert alert-success">
                <span class="alert-icon">✓</span>
                <span class="alert-text">{{ exito }}</span>
                <button @click="exito = null" class="alert-close">×</button>
            </div>
        </transition>

        <!-- Loading -->
        <div v-if="cargando" class="loading-state">
            <div class="spinner"></div>
            <p>Cargando componentes...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="componentes.length === 0" class="empty-state">
            <div class="empty-icon">📦</div>
            <h2>No hay componentes</h2>
            <p>Comienza creando tu primer componente</p>
            <button v-if="canWrite" class="btn-primary" @click="$router.push('/nuevo-componente')">Crear Componente</button>
        </div>

        <!-- Toolbar con búsqueda -->
        <div v-else class="toolbar">
            <div class="search-box">
                <input 
                    v-model="searchQuery" 
                    type="text" 
                    placeholder="🔍 Buscar componentes..."
                    class="search-input"
                >
            </div>
            <div class="view-toggle">
                <button 
                    :class="['view-btn', { active: viewMode === 'table' }]"
                    @click="viewMode = 'table'"
                    title="Vista tabla"
                >
                    ≡
                </button>
                <button 
                    :class="['view-btn', { active: viewMode === 'grid' }]"
                    @click="viewMode = 'grid'"
                    title="Vista grid"
                >
                    ⊞
                </button>
            </div>
        </div>

        <!-- Componentes Vista Tabla -->
        <div v-if="viewMode === 'table' && filteredComponentes.length > 0" class="table-container">
            <table class="componentes-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Código</th>
                        <th>Descripción</th>
                        <th class="text-right">Precio</th>
                        <th v-if="canWrite" class="text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="componente in filteredComponentes" :key="componente.id" class="table-row">
                        <td class="cell-nombre">{{ componente.nombre }}</td>
                        <td class="cell-codigo">{{ componente.codigo }}</td>
                        <td class="cell-descripcion">{{ componente.descripcion || '—' }}</td>
                        <td class="cell-precio">${{ formatCurrency(componente.costo_total) }}</td>
                        <td v-if="canWrite" class="cell-actions">
                            <button 
                                class="btn-action btn-edit" 
                                @click="editarComponente(componente.id)"
                                title="Editar"
                            >
                                ✏️
                            </button>
                            <button 
                                class="btn-action btn-delete" 
                                @click="confirmarEliminar(componente.id)"
                                title="Eliminar"
                            >
                                🗑️
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Componentes Vista Grid -->
        <div v-else-if="viewMode === 'grid' && filteredComponentes.length > 0" class="componentes-grid">
            <div v-for="componente in filteredComponentes" :key="componente.id" class="componente-card">
                <div class="card-header">
                    <h3 class="componente-nombre">{{ componente.nombre }}</h3>
                    <span class="componente-codigo">{{ componente.codigo }}</span>
                </div>

                <p class="componente-descripcion">{{ componente.descripcion || 'Sin descripción' }}</p>

                <div class="componente-info">
                    <div class="info-item">
                        <label>Precio</label>
                        <span class="price">${{ formatCurrency(componente.costo_total) }}</span>
                    </div>
                </div>

                <div v-if="canWrite" class="card-actions">
                    <button class="btn-edit" @click="editarComponente(componente.id)">
                        <span>✏️</span> Editar
                    </button>
                    <button class="btn-delete-secondary" @click="confirmarEliminar(componente.id)">
                        <span>🗑️</span> Eliminar
                    </button>
                </div>
            </div>
        </div>

        <!-- No hay resultados de búsqueda -->
        <div v-else-if="!cargando && filteredComponentes.length === 0" class="empty-state">
            <div class="empty-icon">🔍</div>
            <h2>No se encontraron resultados</h2>
            <p>Intenta con otra búsqueda</p>
        </div>

        <!-- Modal de confirmación de eliminación -->
        <transition name="modal">
            <div v-if="canWrite && modalEliminar" class="modal-overlay" @click.self="modalEliminar = false">
                <div class="modal-content">
                    <div class="modal-icon">⚠️</div>
                    <h3>Confirmar eliminación</h3>
                    <p>¿Estás seguro de que deseas eliminar este componente? Esta acción no se puede deshacer.</p>
                    <div class="modal-actions">
                        <button class="btn-secondary" @click="modalEliminar = false">Cancelar</button>
                        <button class="btn-delete" @click="eliminarComponenteFunc">Eliminar</button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { fetchComponentes, eliminarComponente } from '@/http/componentes-api';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// Estado
const componentes = ref([]);
const cargando = ref(true);
const error = ref(null);
const exito = ref(null);
const modalEliminar = ref(false);
const componenteAEliminar = ref(null);
const searchQuery = ref('');
const viewMode = ref('grid');
const canWrite = computed(() => authStore.hasPermission('catalogs.write'));

// Componentes filtrados por búsqueda
const filteredComponentes = computed(() => {
    if (!searchQuery.value) return componentes.value;
    
    const query = searchQuery.value.toLowerCase();
    return componentes.value.filter(c =>
        c.nombre.toLowerCase().includes(query) ||
        c.codigo.toLowerCase().includes(query) ||
        (c.descripcion && c.descripcion.toLowerCase().includes(query))
    );
});

// Cargar componentes
const cargarComponentes = async () => {
    cargando.value = true;
    error.value = null;
    try {
        const response = await fetchComponentes();
        console.log('Componentes cargados:', response);
        if (Array.isArray(response) && response.length > 0) {
            console.log('Primer componente:', response[0]);
        }
        componentes.value = Array.isArray(response) ? response : (response.data || []);
    } catch (err) {
        console.error('Error cargando componentes:', err);
        error.value = 'Error al cargar los componentes';
    } finally {
        cargando.value = false;
    }
};

// Editar componente
const editarComponente = (id) => {
    router.push(`/editar-componente/${id}`);
};

// Confirmar eliminación
const confirmarEliminar = (id) => {
    componenteAEliminar.value = id;
    modalEliminar.value = true;
};

// Eliminar componente
const eliminarComponenteFunc = async () => {
    try {
        error.value = null;
        await eliminarComponente(componenteAEliminar.value);
        exito.value = '✓ Componente eliminado exitosamente';
        modalEliminar.value = false;
        componenteAEliminar.value = null;
        // Recargar la lista de componentes
        await cargarComponentes();
        setTimeout(() => {
            exito.value = null;
        }, 3000);
    } catch (err) {
        console.error('Error eliminando componente:', err);
        error.value = err.response?.data?.message || 'Error al eliminar el componente';
        modalEliminar.value = false;
    }
};

// Format currency
const formatCurrency = (value) => {
    if (!value) return '0.00';
    return parseFloat(value).toLocaleString('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

// Lifecycle
onMounted(() => {
    cargarComponentes();
});
</script>

<style scoped>
.componentes-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 40px 20px;
    min-height: calc(100vh - 140px);
}

/* ========== Header ========== */
.page-header {
    margin-bottom: 40px;
    background: linear-gradient(135deg, #ffffff 0%, #f8f7f6 100%);
    padding: 32px;
    border-radius: 12px;
    border: 1px solid #e8e3dd;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
}

.header-text {
    flex: 1;
}

.page-title {
    font-size: 36px;
    font-weight: 800;
    color: #2c2c2c;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
}

.header-subtitle {
    font-size: 15px;
    color: #888;
    margin: 0;
    font-weight: 500;
}

.btn-new {
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
    flex-shrink: 0;
}

.btn-icon {
    font-size: 20px;
    font-weight: 600;
}

/* ========== Alerts ========== */
.alert {
    padding: 16px 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 500;
    font-size: 14px;
}

.alert-icon {
    font-size: 18px;
    flex-shrink: 0;
}

.alert-text {
    flex: 1;
}

.alert-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: inherit;
    padding: 0;
    opacity: 0.6;
    transition: opacity 0.2s;
}

.alert-close:hover {
    opacity: 1;
}

.alert-error {
    background: #fff5f5;
    color: #c51c15;
    border: 1px solid #facaca;
}

.alert-success {
    background: #f0fdf4;
    color: #15803d;
    border: 1px solid #bbf7d0;
}

/* ========== Loading & Empty ========== */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    background: white;
    border-radius: 12px;
    border: 1px solid #e8e3dd;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e8e3dd;
    border-top-color: #d4a574;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    background: white;
    border-radius: 12px;
    border: 2px dashed #e8e3dd;
    text-align: center;
}

.empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
}

.empty-state h2 {
    font-size: 22px;
    color: #2c2c2c;
    margin: 0 0 8px 0;
    font-weight: 700;
}

.empty-state p {
    color: #888;
    margin: 0 0 24px 0;
    font-size: 15px;
}

/* ========== Toolbar ========== */
.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
}

.search-box {
    flex: 1;
    max-width: 500px;
}

.search-input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid #e8e3dd;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    background: white;
    transition: all 0.2s;
}

.search-input:focus {
    outline: none;
    border-color: #d4a574;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
}

.view-toggle {
    display: flex;
    gap: 8px;
    background: white;
    border: 1px solid #e8e3dd;
    border-radius: 8px;
    padding: 4px;
}

.view-btn {
    padding: 8px 12px;
    background: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    color: #999;
    transition: all 0.2s;
}

.view-btn.active {
    background: #f0ebe4;
    color: #d4a574;
    font-weight: 600;
}

/* ========== Table ========== */
.table-container {
    background: white;
    border: 1px solid #e8e3dd;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.componentes-table {
    width: 100%;
    border-collapse: collapse;
}

.componentes-table thead {
    background: linear-gradient(135deg, #f8f7f6 0%, #f0ebe4 100%);
    border-bottom: 2px solid #e8e3dd;
}

.componentes-table th {
    padding: 16px 20px;
    text-align: left;
    font-weight: 700;
    font-size: 13px;
    color: #5a4037;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.componentes-table th.text-right {
    text-align: right;
}

.componentes-table th.text-center {
    text-align: center;
}

.table-row {
    border-bottom: 1px solid #f0ebe4;
    transition: background-color 0.2s;
}

.table-row:hover {
    background-color: #fdfbf9;
}

.componentes-table td {
    padding: 16px 20px;
    font-size: 14px;
    color: #2c2c2c;
}

.cell-nombre {
    font-weight: 600;
    color: #2c2c2c;
}

.cell-codigo {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    width: fit-content;
}

.cell-descripcion {
    color: #888;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.cell-precio {
    text-align: right;
    font-weight: 700;
    color: #d4a574;
}

.cell-actions {
    text-align: center;
    display: flex;
    gap: 8px;
    justify-content: center;
}

.btn-action {
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 18px;
    transition: all 0.2s;
    background: white;
    border: 1px solid #e8e3dd;
}

.btn-action:hover {
    border-color: #d4a574;
    background: #fff9f0;
}

.btn-action.btn-delete:hover {
    border-color: #e67e22;
    background: #fff5f0;
}

/* ========== Grid ========== */
.componentes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
}

.componente-card {
    background: white;
    border: 1px solid #e8e3dd;
    border-radius: 12px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    transition: all 0.3s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.componente-card:hover {
    border-color: #d4a574;
    box-shadow: 0 8px 24px rgba(212, 165, 116, 0.15);
    transform: translateY(-4px);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    width: 100%;
}

.componente-nombre {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #2c2c2c;
    line-height: 1.3;
    flex: 1;
    word-break: break-word;
}

.componente-codigo {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
    white-space: nowrap;
    flex-shrink: 0;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    align-self: center;
}

.componente-descripcion {
    color: #888;
    font-size: 14px;
    margin: 0;
    line-height: 1.5;
    flex: 1;
}

.componente-info {
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    border: 1px solid #f0ebe4;
    border-radius: 8px;
    padding: 16px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.info-item label {
    font-size: 11px;
    font-weight: 700;
    color: #8b7355;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-item .price {
    font-size: 20px;
    font-weight: 800;
    color: #d4a574;
}

.card-actions {
    display: flex;
    gap: 12px;
    margin-top: auto;
}

.btn-edit,
.btn-delete-secondary {
    flex: 1;
    padding: 12px 16px;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.btn-edit {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
}

.btn-edit:hover {
    background: linear-gradient(135deg, #c89564 0%, #b8844c 100%);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.btn-delete-secondary {
    background: #fff5f0;
    color: #e67e22;
    border: 1px solid #facaca;
}

.btn-delete-secondary:hover {
    background: #fff0e6;
    border-color: #f0a555;
    color: #d46f1f;
}

/* ========== Buttons ========== */
.btn-primary {
    padding: 12px 24px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.2);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(212, 165, 116, 0.3);
}

.btn-secondary {
    padding: 10px 24px;
    background: white;
    color: #2c2c2c;
    border: 1px solid #e8e3dd;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s;
}

.btn-secondary:hover {
    background: #f8f7f6;
    border-color: #d4a574;
}

.btn-delete {
    background: #fff5f0;
    color: #e67e22;
    border: 1px solid #facaca;
}

.btn-delete:hover {
    background: #ffe8d6;
    border-color: #e67e22;
}

/* ========== Modal ========== */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 12px;
    padding: 32px;
    max-width: 420px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    text-align: center;
}

.modal-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.modal-content h3 {
    margin: 0 0 12px 0;
    color: #2c2c2c;
    font-size: 22px;
    font-weight: 700;
}

.modal-content p {
    margin: 0 0 32px 0;
    color: #888;
    font-size: 14px;
    line-height: 1.6;
}

.modal-actions {
    display: flex;
    gap: 12px;
}

.modal-actions button {
    flex: 1;
}

/* ========== Transitions ========== */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
    transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
    transform: scale(0.95);
}

/* ========== Responsive ========== */
@media (max-width: 768px) {
    .componentes-container {
        padding: 24px 16px;
    }

    .page-header {
        padding: 24px;
    }

    .header-content {
        flex-direction: column;
        align-items: flex-start;
    }

    .btn-new {
        width: 100%;
        justify-content: center;
    }

    .toolbar {
        flex-direction: column;
        align-items: stretch;
    }

    .search-box {
        max-width: 100%;
    }

    .view-toggle {
        justify-content: center;
    }

    .componentes-grid {
        grid-template-columns: 1fr;
    }

    .table-container {
        overflow-x: auto;
    }

    .componentes-table {
        min-width: 600px;
    }

    .page-title {
        font-size: 28px;
    }
}
</style>
