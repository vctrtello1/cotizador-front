<template>
    <div class="mano-obra-container">
        <!-- Header -->
        <div class="page-header">
            <h1 class="page-title">Mano de Obra</h1>
            <button class="btn-primary" @click="irAlNuevo">👷 Nueva Mano de Obra</button>
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
        <div v-if="cargandoDatos" class="loading-state">
            <p>Cargando mano de obra...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="items.length === 0" class="empty-state">
            <p>No hay registros de mano de obra.</p>
            <button class="btn-primary" @click="irAlNuevo">Crear Primer Registro</button>
        </div>

        <!-- Items Grid -->
        <div v-else class="items-grid">
            <div v-for="item in items" :key="item.id" class="item-card">
                <div class="item-header">
                    <h3 class="item-nombre">{{ item.nombre }}</h3>
                </div>

                <p class="item-descripcion">{{ item.descripcion || 'Sin descripción' }}</p>

                <div class="card-actions">
                    <button class="btn-edit" @click="editar(item.id)">✏️ Editar</button>
                    <button class="btn-delete" @click="confirmarEliminar(item.id)">🗑️ Eliminar</button>
                </div>
            </div>
        </div>

        <!-- Modal de confirmación de eliminación -->
        <div v-if="modalEliminar" class="modal-overlay" @click.self="cancelarEliminacion">
            <div class="modal-content">
                <h3>Confirmar eliminación</h3>
                <p>¿Estás seguro de que deseas eliminar este registro?</p>
                <div class="modal-actions">
                    <button class="btn-secondary" @click="cancelarEliminacion">Cancelar</button>
                    <button class="btn-delete" @click="eliminar">Eliminar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchClientes, eliminarManoDeObraAPI } from '@/http/mano_de_obra-api .js';

const router = useRouter();

// Estado
const items = ref([]);
const cargandoDatos = ref(true);
const cargando = ref(false);
const error = ref(null);
const exito = ref(null);
const modalEliminar = ref(false);
const itemAEliminar = ref(null);

// Métodos
const cargar = async () => {
    cargandoDatos.value = true;
    error.value = null;
    try {
        const response = await fetchClientes();
        items.value = Array.isArray(response) ? response : (response.data || []);
    } catch (err) {
        console.error('Error cargando:', err);
        error.value = 'Error al cargar los registros de mano de obra';
    } finally {
        cargandoDatos.value = false;
    }
};

const irAlNuevo = () => {
    router.push('/nuevo-mano-de-obra');
};

const editar = (id) => {
    router.push(`/editar-mano-de-obra/${id}`);
};

const confirmarEliminar = (id) => {
    itemAEliminar.value = id;
    modalEliminar.value = true;
};

const cancelarEliminacion = () => {
    modalEliminar.value = false;
    itemAEliminar.value = null;
};

const eliminar = async () => {
    try {
        await eliminarManoDeObraAPI(itemAEliminar.value);
        exito.value = '✓ Registro eliminado exitosamente';
        cargar();
        cancelarEliminacion();
    } catch (err) {
        console.error('Error eliminando:', err);
        error.value = err.response?.data?.message || 'Error al eliminar el registro';
    }
};

// Lifecycle
onMounted(() => {
    cargar();
});
</script>

<style scoped>
.mano-obra-container {
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

.items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.item-card {
    background: white;
    border: 2px solid #e8ddd7;
    border-radius: 10px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 6px rgba(212, 165, 116, 0.08);
}

.item-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(212, 165, 116, 0.16);
    border-color: #d4a574;
}

.item-header {
    margin-bottom: 0.5rem;
}

.item-nombre {
    font-size: 1.2rem;
    font-weight: 600;
    color: #5a4037;
    margin: 0;
}

.item-descripcion {
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

    .items-grid {
        grid-template-columns: 1fr;
    }
}
</style>
