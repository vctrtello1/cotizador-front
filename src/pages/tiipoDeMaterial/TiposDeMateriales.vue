<template>
    <div class="tipos-container">
        <!-- Header -->
        <div class="page-header">
            <h1 class="page-title">Tipos de Material</h1>
            <button class="btn-primary" @click="irAlNuevoTipo">🏷️ Nuevo Tipo</button>
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
            <p>Cargando tipos de material...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="tipos.length === 0" class="empty-state">
            <p>No hay tipos de material registrados.</p>
            <button class="btn-primary" @click="irAlNuevoTipo">Crear Primer Tipo</button>
        </div>

        <!-- Tipos Grid -->
        <div v-else class="tipos-grid">
            <div v-for="tipo in tipos" :key="tipo.id" class="tipo-card">
                <div class="tipo-header">
                    <h3 class="tipo-nombre">{{ tipo.nombre }}</h3>
                    <span class="tipo-codigo">{{ tipo.codigo }}</span>
                </div>

                <p class="tipo-descripcion">{{ tipo.descripcion || 'Sin descripción' }}</p>

                <div class="card-actions">
                    <button class="btn-edit" @click="editarTipo(tipo.id)">✏️ Editar</button>
                    <button class="btn-delete" @click="confirmarEliminar(tipo.id)">🗑️ Eliminar</button>
                </div>
            </div>
        </div>

        <!-- Modal de confirmación de eliminación -->
        <div v-if="modalEliminar" class="modal-overlay" @click.self="cancelarEliminacion">
            <div class="modal-content">
                <h3>Confirmar eliminación</h3>
                <p>¿Estás seguro de que deseas eliminar este tipo de material?</p>
                <div class="modal-actions">
                    <button class="btn-secondary" @click="cancelarEliminacion">Cancelar</button>
                    <button class="btn-delete" @click="eliminarTipo">Eliminar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { fetchTiposDeMaterial, eliminarTipoAPI } from '@/http/tipo_de_material-api';

const router = useRouter();

// Estado
const tipos = ref([]);
const cargando = ref(true);
const error = ref(null);
const exito = ref(null);
const modalEliminar = ref(false);
const tipoAEliminar = ref(null);

// Métodos
const cargarTipos = async () => {
    cargando.value = true;
    error.value = null;
    try {
        const response = await fetchTiposDeMaterial();
        tipos.value = Array.isArray(response) ? response : (response.data || []);
    } catch (err) {
        console.error('Error cargando tipos:', err);
        error.value = 'Error al cargar los tipos de material';
    } finally {
        cargando.value = false;
    }
};

const irAlNuevoTipo = () => {
    router.push('/nuevo-tipo-material');
};

const editarTipo = (id) => {
    router.push(`/editar-tipo-material/${id}`);
};

const confirmarEliminar = (id) => {
    tipoAEliminar.value = id;
    modalEliminar.value = true;
};

const cancelarEliminacion = () => {
    modalEliminar.value = false;
    tipoAEliminar.value = null;
};

const eliminarTipo = async () => {
    try {
        await eliminarTipoAPI(tipoAEliminar.value);
        exito.value = '✓ Tipo de material eliminado exitosamente';
        cargarTipos();
        cancelarEliminacion();
    } catch (err) {
        console.error('Error eliminando tipo:', err);
        error.value = err.response?.data?.message || 'Error al eliminar el tipo de material';
    }
};

// Lifecycle
onMounted(() => {
    cargarTipos();
});
</script>

<style scoped>
.tipos-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid #d4a574;
}

.page-title {
    font-size: 2rem;
    font-weight: 700;
    color: #5a4037;
    margin: 0;
}

.btn-primary {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.2);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.error-message,
.success-message {
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.error-message {
    background: #fee;
    color: #c33;
    border: 1px solid #fcc;
}

.success-message {
    background: #efe;
    color: #3c3;
    border: 1px solid #cfc;
}

.error-close {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    color: inherit;
}

.loading-state,
.empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: #999;
}

.empty-state .btn-primary {
    margin-top: 1rem;
}

.tipos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.tipo-card {
    background: white;
    border: 2px solid #e8ddd7;
    border-radius: 10px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 6px rgba(212, 165, 116, 0.08);
}

.tipo-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(212, 165, 116, 0.16);
    border-color: #d4a574;
}

.tipo-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.tipo-nombre {
    font-size: 1.2rem;
    font-weight: 600;
    color: #5a4037;
    margin: 0;
    flex: 1;
}

.tipo-codigo {
    background: #f5f3f0;
    color: #999;
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    white-space: nowrap;
}

.tipo-descripcion {
    color: #777;
    font-size: 0.95rem;
    margin: 0.5rem 0 1rem;
    flex: 1;
}

.card-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-edit,
.btn-delete {
    flex: 1;
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-edit {
    background: #e8f4f8;
    color: #0066cc;
}

.btn-edit:hover {
    background: #d0e8f0;
}

.btn-delete {
    background: #fee;
    color: #c33;
}

.btn-delete:hover {
    background: #fdd;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    max-width: 400px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
    margin: 0 0 1rem;
    color: #5a4037;
}

.modal-content p {
    color: #777;
    margin-bottom: 1.5rem;
}

.modal-actions {
    display: flex;
    gap: 1rem;
}

.btn-secondary {
    flex: 1;
    padding: 12px 24px;
    background: #e0e0e0;
    color: #333;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-secondary:hover {
    background: #d0d0d0;
}

@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .tipos-grid {
        grid-template-columns: 1fr;
    }
}
</style>
