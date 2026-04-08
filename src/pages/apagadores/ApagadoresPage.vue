<template>
    <div class="apagadores-container">
        <!-- Header -->
        <div class="page-header">
            <h1 class="page-title">🔘 Apagadores</h1>
            <button v-if="canWrite" class="btn-primary" @click="$router.push('/nuevo-apagador')">✨ Nuevo Apagador</button>
        </div>

        <div class="search-bar">
            <input
                v-model="searchTerm"
                type="text"
                class="search-input"
                placeholder="Buscar por nombre..."
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
            <p>Cargando apagadores...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredApagadores.length === 0" class="empty-state">
            <p>No hay apagadores registrados.</p>
            <button v-if="canWrite" class="btn-primary" @click="$router.push('/nuevo-apagador')">✨ Crear Primer Apagador</button>
        </div>

        <!-- Apagadores Grid -->
        <div v-else class="apagadores-grid">
            <div v-for="apagador in filteredApagadores" :key="apagador.id" class="apagador-card">
                <div class="apagador-header">
                    <h3 class="apagador-nombre">{{ apagador.nombre || `Apagador #${apagador.id}` }}</h3>
                </div>

                <div class="apagador-info">
                    <div v-if="apagador.precio" class="info-item">
                        <label>💰 Precio</label>
                        <span>${{ formatCurrency(apagador.precio) }}</span>
                    </div>
                    <div v-if="apagador.unidades_por_metro" class="info-item">
                        <label>📏 Unidades por Metro</label>
                        <span>{{ apagador.unidades_por_metro }}</span>
                    </div>
                    <div v-if="apagador.porcentaje_utilizacion" class="info-item">
                        <label>📊 % Utilización</label>
                        <span>{{ apagador.porcentaje_utilizacion }}%</span>
                    </div>
                </div>

                <div v-if="canWrite" class="card-actions">
                    <button class="btn-edit" @click="editarApagador(apagador.id)">Editar</button>
                    <button class="btn-delete" @click="confirmarEliminar(apagador.id)">Eliminar</button>
                </div>
            </div>
        </div>

        <!-- Modal de confirmación de eliminación -->
        <div v-if="canWrite && modalEliminar" class="modal-overlay" @click.self="modalEliminar = false">
            <div class="modal-content">
                <h3>Confirmar eliminación</h3>
                <p>¿Estás seguro de que deseas eliminar este apagador?</p>
                <div class="modal-actions">
                    <button class="btn-secondary" @click="modalEliminar = false">Cancelar</button>
                    <button class="btn-delete" @click="eliminarApagador">Eliminar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useApagadoresStore } from '@/stores/apagadores.js';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const apagadoresStore = useApagadoresStore();
const authStore = useAuthStore();

// Estado
const cargando = ref(true);
const error = ref(null);
const exito = ref(null);
const modalEliminar = ref(false);
const apagadorAEliminar = ref(null);
const searchTerm = ref('');
const canWrite = computed(() => authStore.hasPermission('catalogs.write'));

// Cargar apagadores
const cargarApagadores = async () => {
    try {
        cargando.value = true;
        error.value = null;
        await apagadoresStore.fetchApagadores();
    } catch (err) {
        error.value = 'Error al cargar los apagadores';
        console.error(err);
    } finally {
        cargando.value = false;
    }
};

// Editar apagador
const editarApagador = (id) => {
    router.push(`/editar-apagador/${id}`);
};

// Confirmar eliminación
const confirmarEliminar = (id) => {
    apagadorAEliminar.value = id;
    modalEliminar.value = true;
};

// Eliminar apagador
const eliminarApagador = async () => {
    try {
        await apagadoresStore.eliminarApagador(apagadorAEliminar.value);
        exito.value = 'Apagador eliminado correctamente';
        modalEliminar.value = false;
        setTimeout(() => {
            exito.value = null;
        }, 3000);
    } catch (err) {
        error.value = 'Error al eliminar el apagador';
        console.error(err);
        modalEliminar.value = false;
    }
};

// Formatear moneda
const formatCurrency = (value) => {
    if (!value) return '0.00';
    return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Computed para filtrado
const filteredApagadores = computed(() => {
    const term = searchTerm.value.trim().toLowerCase();
    if (!term) return apagadoresStore.apagadores;

    return apagadoresStore.apagadores.filter((apagador) => {
        const nombre = (apagador.nombre || '').toLowerCase();
        return nombre.includes(term);
    });
});

// Cargar datos al montar
onMounted(() => {
    cargarApagadores();
});
</script>

<style scoped>
.apagadores-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    background: linear-gradient(135deg, #f5f7fa 0%, #fafbfc 100%);
    min-height: 100vh;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.page-title {
    font-size: 2rem;
    font-weight: 700;
    color: #5a4037;
    margin: 0;
}

.btn-primary {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #d4a574 0%, #c99a63 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.4);
}

.search-bar {
    position: relative;
    margin-bottom: 1.5rem;
}

.search-input {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    border: 2px solid #e8ddd0;
    border-radius: 8px;
    font-size: 1rem;
}

.search-clear {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #8b7355;
    cursor: pointer;
    font-size: 1.25rem;
}

.error-message,
.success-message {
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.error-message {
    background-color: #ffebee;
    color: #c62828;
    border: 1px solid #ef9a9a;
}

.success-message {
    background-color: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #a5d6a7;
}

.error-close {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: inherit;
}

.loading-state,
.empty-state {
    text-align: center;
    padding: 3rem;
    color: #8b7355;
}

.apagadores-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.apagador-card {
    background: white;
    border: 2px solid #e8ddd0;
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.3s ease;
}

.apagador-card:hover {
    border-color: #d4a574;
    box-shadow: 0 4px 12px rgba(90, 64, 55, 0.1);
}

.apagador-header {
    margin-bottom: 1rem;
}

.apagador-nombre {
    font-size: 1.25rem;
    font-weight: 700;
    color: #5a4037;
    margin: 0;
}

.apagador-info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.info-item label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #8b7355;
}

.info-item span {
    color: #5a4037;
}

.card-actions {
    display: flex;
    gap: 0.75rem;
}

.btn-edit,
.btn-delete {
    flex: 1;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-edit {
    background: #e3f2fd;
    color: #1976d2;
}

.btn-edit:hover {
    background: #1976d2;
    color: white;
}

.btn-delete {
    background: #ffebee;
    color: #c62828;
}

.btn-delete:hover {
    background: #c62828;
    color: white;
}

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
    padding: 2rem;
    border-radius: 12px;
    max-width: 400px;
    width: 90%;
}

.modal-content h3 {
    margin: 0 0 1rem;
    color: #5a4037;
}

.modal-content p {
    margin: 0 0 1.5rem;
    color: #8b7355;
}

.modal-actions {
    display: flex;
    gap: 1rem;
}

.btn-secondary {
    flex: 1;
    padding: 0.75rem 1.5rem;
    background: #f5f5f5;
    color: #5a4037;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
}

.modal-actions .btn-delete {
    flex: 1;
}
</style>
