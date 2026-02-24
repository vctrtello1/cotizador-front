<template>
    <div class="correderas-container">
        <!-- Header -->
        <div class="page-header">
            <h1 class="page-title">🎚️ Correderas</h1>
            <button v-if="canWrite" class="btn-primary" @click="$router.push('/nueva-corredera')">✨ Nueva Corredera</button>
        </div>

        <div class="search-bar">
            <input
                v-model="searchTerm"
                type="text"
                class="search-input"
                placeholder="Buscar por nombre, código o descripción..."
            />
            <button
                v-if="searchTerm"
                class="search-clear"
                @click="searchTerm = ''"
                aria-label="Limpiar búsqueda"
            >
                ✕
            </button>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="error-message">
            <span>⚠️ {{ error }}</span>
            <button @click="error = null" class="error-close">✕</button>
        </div>

        <!-- Mensaje de éxito -->
        <div v-if="exito" class="success-message">
            <span>✓ {{ exito }}</span>
            <button @click="exito = null" class="error-close">✕</button>
        </div>

        <!-- Loading -->
        <div v-if="cargando" class="loading-state">
            <p>Cargando correderas...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredCorrederas.length === 0" class="empty-state">
            <p>No hay correderas registradas.</p>
            <button v-if="canWrite" class="btn-primary" @click="$router.push('/nueva-corredera')">✨ Crear Primera Corredera</button>
        </div>

        <!-- Correderas Grid -->
        <div v-else class="correderas-grid">
            <div v-for="corredera in filteredCorrederas" :key="corredera.id" class="corredera-card">
                <div class="corredera-header">
                    <h3 class="corredera-nombre">{{ corredera.nombre }}</h3>
                    <span class="corredera-badge" :class="getTipoBadgeClass(corredera.tipo)">{{ getTipoLabel(corredera.tipo) }}</span>
                </div>

                <div class="corredera-specs">
                    <div class="spec-item">
                        <span class="spec-icon">⚖️</span>
                        <span class="spec-text">{{ corredera.capacidad_carga }}kg</span>
                    </div>
                    <div v-if="corredera.incluye_varilla" class="spec-item">
                        <span class="spec-icon">🔧</span>
                        <span class="spec-text">Con varilla</span>
                    </div>
                </div>

                <div class="corredera-info">
                    <div class="info-item">
                        <label>💰 Precio Base</label>
                        <span>${{ formatCurrency(corredera.precio_base || 0) }}</span>
                    </div>
                    <div class="info-item">
                        <label>🔗 Con Acoplamiento</label>
                        <span>${{ formatCurrency(corredera.precio_con_acoplamiento || 0) }}</span>
                    </div>
                </div>

                <div v-if="canWrite" class="card-actions">
                    <button class="btn-edit" @click="editarCorredera(corredera.id)">Editar</button>
                    <button class="btn-delete" @click="confirmarEliminar(corredera.id)">Eliminar</button>
                </div>
            </div>
        </div>

        <!-- Modal de confirmación de eliminación -->
        <div v-if="canWrite && modalEliminar" class="modal-overlay" @click.self="modalEliminar = false">
            <div class="modal-content">
                <h3>Confirmar eliminación</h3>
                <p>¿Estás seguro de que deseas eliminar esta corredera?</p>
                <div class="modal-actions">
                    <button class="btn-secondary" @click="modalEliminar = false">Cancelar</button>
                    <button class="btn-delete" @click="eliminarCorredera">Eliminar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCorrederasStore } from '@/stores/correderas.js';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const correderasStore = useCorrederasStore();
const authStore = useAuthStore();

// Estado
const cargando = ref(true);
const error = ref(null);
const exito = ref(null);
const modalEliminar = ref(false);
const correderaAEliminar = ref(null);
const searchTerm = ref('');
const canWrite = computed(() => authStore.hasPermission('catalogs.write'));

// Cargar correderas
const cargarCorrederas = async () => {
    try {
        cargando.value = true;
        error.value = null;
        await correderasStore.fetchCorrederas();
    } catch (err) {
        error.value = 'Error al cargar las correderas';
        console.error(err);
    } finally {
        cargando.value = false;
    }
};

// Editar corredera
const editarCorredera = (id) => {
    router.push(`/editar-corredera/${id}`);
};

// Confirmar eliminación
const confirmarEliminar = (id) => {
    correderaAEliminar.value = id;
    modalEliminar.value = true;
};

// Eliminar corredera
const eliminarCorredera = async () => {
    try {
        await correderasStore.eliminarCorredera(correderaAEliminar.value);
        exito.value = 'Corredera eliminada correctamente';
        modalEliminar.value = false;
        setTimeout(() => {
            exito.value = null;
        }, 3000);
    } catch (err) {
        error.value = 'Error al eliminar la corredera';
        console.error(err);
        modalEliminar.value = false;
    }
};

// Formatear moneda
const formatCurrency = (value) => {
    if (!value) return '0.00';
    return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Funciones auxiliares
const getTipoLabel = (tipo) => {
    const labels = {
        'PARCIAL': 'Parcial',
        'TOTAL': 'Total',
        'TOTAL_TIP_ON': 'Total Tip-On'
    };
    return labels[tipo] || tipo;
};

const getTipoBadgeClass = (tipo) => {
    return {
        'badge-parcial': tipo === 'PARCIAL',
        'badge-total': tipo === 'TOTAL',
        'badge-tipon': tipo === 'TOTAL_TIP_ON'
    };
};

// Computed para filtrado
const filteredCorrederas = computed(() => {
    const term = searchTerm.value.trim().toLowerCase();
    if (!term) return correderasStore.correderas;

    return correderasStore.correderas.filter((corredera) => {
        const nombre = (corredera.nombre || '').toLowerCase();
        const tipo = (corredera.tipo || '').toLowerCase();
        const capacidad = String(corredera.capacidad_carga || '');
        return nombre.includes(term) || tipo.includes(term) || capacidad.includes(term);
    });
});

// Cargar datos al montar
onMounted(() => {
    cargarCorrederas();
});
</script>

<style scoped>
.correderas-container {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid #e0e0e0;
}

.page-title {
    font-size: 2rem;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.search-bar {
    position: relative;
    margin-bottom: 1.5rem;
}

.search-input {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.15);
}

.search-clear {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    background: #f5f5f5;
    color: #666;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s, color 0.2s;
}

.search-clear:hover {
    background: #e0e0e0;
    color: #333;
}

.btn-primary {
    background-color: #4CAF50;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
}

.btn-primary:hover {
    background-color: #45a049;
}

.error-message,
.success-message {
    padding: 1rem;
    margin-bottom: 1.5rem;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.error-message {
    background-color: #ffebee;
    color: #c62828;
    border: 1px solid #ef5350;
}

.success-message {
    background-color: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #66bb6a;
}

.error-close {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 1.2rem;
}

.loading-state,
.empty-state {
    text-align: center;
    padding: 3rem 2rem;
    background-color: #f5f5f5;
    border-radius: 4px;
    color: #666;
}

.loading-state p,
.empty-state p {
    margin: 0 0 1.5rem 0;
    font-size: 1.1rem;
}

.correderas-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.corredera-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1.5rem;
    transition: box-shadow 0.3s, transform 0.3s;
    display: flex;
    flex-direction: column;
}

.corredera-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.corredera-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1rem;
}

.corredera-nombre {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin: 0;
    flex: 1;
}

.corredera-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 600;
    white-space: nowrap;
    margin-left: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.badge-parcial {
    background-color: #e3f2fd;
    color: #1976d2;
}

.badge-total {
    background-color: #e8f5e9;
    color: #2e7d32;
}

.badge-tipon {
    background-color: #fff3e0;
    color: #e65100;
}

.corredera-specs {
    display: flex;
    gap: 1rem;
    margin: 0.75rem 0;
    padding: 0.75rem;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-radius: 6px;
    border: 1px solid #e8e8e8;
}

.spec-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.spec-icon {
    font-size: 1.1rem;
}

.spec-text {
    font-size: 0.9rem;
    color: #555;
    font-weight: 500;
}

.corredera-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin: 1rem 0;
    padding: 1.2rem;
    background: linear-gradient(135deg, #f5f5f5 0%, #f9f9f9 100%);
    border: 2px solid #d4a574;
    border-radius: 8px;
}

.info-item {
    display: flex;
    flex-direction: column;
}

.info-item label {
    font-size: 0.85rem;
    color: #999;
    font-weight: 600;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-item span {
    font-size: 1.3rem;
    color: #d4a574;
    font-weight: 700;
}

.card-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
}

.btn-edit,
.btn-delete {
    flex: 1;
    padding: 0.6rem 1rem;
    border: none;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: opacity 0.3s;
}

.btn-edit {
    background-color: #2196F3;
    color: white;
}

.btn-edit:hover {
    opacity: 0.8;
}

.btn-delete {
    background-color: #f44336;
    color: white;
}

.btn-delete:hover {
    opacity: 0.8;
}

.btn-secondary {
    background-color: #9e9e9e;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.btn-secondary:hover {
    background-color: #757575;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
    margin: 0 0 1rem 0;
    color: #333;
}

.modal-content p {
    color: #666;
    margin: 0 0 1.5rem 0;
}

.modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.modal-actions button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
}

.modal-actions .btn-secondary {
    background-color: #9e9e9e;
    color: white;
    flex: 1;
}

.modal-actions .btn-delete {
    background-color: #f44336;
    color: white;
    flex: 1;
}
</style>
