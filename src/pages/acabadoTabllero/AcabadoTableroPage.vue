<template>
    <div class="acabado-tableros-container">
        <!-- Header -->
        <div class="page-header">
            <h1 class="page-title">Acabados de Tablero</h1>
            <button class="btn-primary" @click="$router.push('/nuevo-acabado-tablero')">✨ Nuevo Acabado de Tablero</button>
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
            <p>Cargando acabados de tablero...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredAcabadoTableros.length === 0" class="empty-state">
            <p>No hay acabados de tablero registrados.</p>
            <button class="btn-primary" @click="$router.push('/nuevo-acabado-tablero')">✨ Crear Primer Acabado de Tablero</button>
        </div>

        <!-- Acabados Tablero Grid -->
        <div v-else class="acabado-tableros-grid">
            <div v-for="acabadoTablero in filteredAcabadoTableros" :key="acabadoTablero.id" class="acabado-tablero-card">
                <div class="acabado-tablero-header">
                    <h3 class="acabado-tablero-nombre">{{ acabadoTablero.nombre }}</h3>
            
                </div>

                

                <div class="acabado-tablero-info">
                    <div class="info-item">
                        <label>💰 Costo</label>
                        <span>${{ formatCurrency(acabadoTablero.costo_unitario || 0) }}</span>
                    </div>
                </div>

                <div class="card-actions">
                    <button class="btn-edit" @click="editarAcabadoTablero(acabadoTablero.id)">Editar</button>
                    <button class="btn-delete" @click="confirmarEliminar(acabadoTablero.id)">Eliminar</button>
                </div>
            </div>
        </div>

        <!-- Modal de confirmación de eliminación -->
        <div v-if="modalEliminar" class="modal-overlay" @click.self="modalEliminar = false">
            <div class="modal-content">
                <h3>Confirmar eliminación</h3>
                <p>¿Estás seguro de que deseas eliminar este acabado de tablero?</p>
                <div class="modal-actions">
                    <button class="btn-secondary" @click="modalEliminar = false">Cancelar</button>
                    <button class="btn-delete" @click="eliminarAcabadoTablero">Eliminar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { fetchAcabadoTableros, eliminarAcabadoTablero as deleteAcabadoTableroAPI } from '@/http/acabado_tablero-api.js';

const router = useRouter();

// Estado
const acabadoTableros = ref([]);
const cargando = ref(true);
const error = ref(null);
const exito = ref(null);
const modalEliminar = ref(false);
const acabadoTableroAEliminar = ref(null);
const searchTerm = ref('');

// Cargar acabados de tablero
const cargarAcabadoTableros = async () => {
    try {
        cargando.value = true;
        error.value = null;
        const response = await fetchAcabadoTableros();
        const data = Array.isArray(response) ? response : (response.data || response || []);
        acabadoTableros.value = data;
    } catch (err) {
        error.value = 'Error al cargar los acabados de tablero';
        console.error(err);
        acabadoTableros.value = [];
    } finally {
        cargando.value = false;
    }
};

// Editar acabado de tablero
const editarAcabadoTablero = (id) => {
    router.push(`/editar-acabado-tablero/${id}`);
};

// Confirmar eliminación
const confirmarEliminar = (id) => {
    acabadoTableroAEliminar.value = id;
    modalEliminar.value = true;
};

// Eliminar acabado de tablero
const eliminarAcabadoTablero = async () => {
    try {
        const response = await deleteAcabadoTableroAPI(acabadoTableroAEliminar.value);
        exito.value = 'Acabado de tablero eliminado correctamente';
        modalEliminar.value = false;
        await cargarAcabadoTableros();
    } catch (err) {
        error.value = 'Error al eliminar el acabado de tablero';
        console.error(err);
    }
};

// Formatear moneda
const formatCurrency = (value) => {
    if (!value) return '0.00';
    return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const filteredAcabadoTableros = computed(() => {
    const term = searchTerm.value.trim().toLowerCase();
    if (!term) return acabadoTableros.value;

    return acabadoTableros.value.filter((acabado) => {
        const nombre = (acabado.nombre || '').toLowerCase();
        const codigo = (acabado.codigo || '').toLowerCase();
        const descripcion = (acabado.descripcion || '').toLowerCase();
        return nombre.includes(term) || codigo.includes(term) || descripcion.includes(term);
    });
});

// Cargar datos al montar
onMounted(() => {
    cargarAcabadoTableros();
});
</script>

<style scoped>
.acabado-tableros-container {
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

.acabado-tableros-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.acabado-tablero-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1.5rem;
    transition: box-shadow 0.3s, transform 0.3s;
    display: flex;
    flex-direction: column;
}

.acabado-tablero-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.acabado-tablero-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1rem;
}

.acabado-tablero-nombre {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin: 0;
    flex: 1;
}

.acabado-tablero-codigo {
    background-color: #e8f5e9;
    color: #2e7d32;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
    margin-left: 0.5rem;
}

.acabado-tablero-descripcion {
    color: #666;
    font-size: 0.95rem;
    margin: 0.5rem 0 1rem 0;
    line-height: 1.4;
    flex-grow: 1;
}

.acabado-tablero-info {
    display: grid;
    grid-template-columns: 1fr;
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
