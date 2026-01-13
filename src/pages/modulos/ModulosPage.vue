<template>
    <div class="modulos-container">
        <!-- Header -->
        <div class="page-header">
            <h1 class="page-title">Módulos</h1>
            <button class="btn-primary" @click="$router.push('/nuevo-modulo')">+ Nuevo Módulo</button>
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
            <p>Cargando módulos...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="modulos.length === 0" class="empty-state">
            <p>No hay módulos registrados.</p>
            <button class="btn-primary" @click="$router.push('/nuevo-modulo')">Crear Primer Módulo</button>
        </div>

        <!-- Módulos Grid -->
        <div v-else class="modulos-grid">
            <div v-for="modulo in modulos" :key="modulo.id" class="modulo-card">
                <div class="modulo-header">
                    <h3 class="modulo-nombre">{{ modulo.nombre }}</h3>
                    <span class="modulo-codigo">{{ modulo.codigo }}</span>
                </div>

                <p class="modulo-descripcion">{{ modulo.descripcion || 'Sin descripción' }}</p>

                <div class="modulo-info">
                    <div class="info-item">
                        <label>Componentes</label>
                        <span>{{ modulo.componentes?.length || 0 }}</span>
                    </div>
                </div>

                <div v-if="modulo.componentes && modulo.componentes.length > 0" class="componentes-preview">
                    <label>Componentes:</label>
                    <ul>
                        <li v-for="comp in modulo.componentes.slice(0, 3)" :key="comp.id">
                            {{ comp.nombre }}
                        </li>
                        <li v-if="modulo.componentes.length > 3" class="mas-items">
                            +{{ modulo.componentes.length - 3 }} más
                        </li>
                    </ul>
                </div>

                <div class="card-actions">
                    <button class="btn-edit" @click="editarModulo(modulo.id)">Editar</button>
                    <button class="btn-delete" @click="confirmarEliminar(modulo.id)">Eliminar</button>
                </div>
            </div>
        </div>

        <!-- Modal de confirmación de eliminación -->
        <div v-if="modalEliminar" class="modal-overlay" @click.self="modalEliminar = false">
            <div class="modal-content">
                <h3>Confirmar eliminación</h3>
                <p>¿Estás seguro de que deseas eliminar este módulo?</p>
                <div class="modal-actions">
                    <button class="btn-secondary" @click="modalEliminar = false">Cancelar</button>
                    <button class="btn-delete" @click="eliminarModulo">Eliminar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchModulos, eliminarModulo as deleteModuloAPI } from '@/http/modulos-api';

const router = useRouter();

// Estado
const modulos = ref([]);
const cargando = ref(true);
const error = ref(null);
const exito = ref(null);
const modalEliminar = ref(false);
const moduloAEliminar = ref(null);

// Cargar módulos
const cargarModulos = async () => {
    cargando.value = true;
    error.value = null;
    try {
        const response = await fetchModulos();
        modulos.value = response.data || [];
    } catch (err) {
        console.error('Error cargando módulos:', err);
        error.value = err.response?.data?.message || 'Error al cargar los módulos';
    } finally {
        cargando.value = false;
    }
};

// Editar módulo
const editarModulo = (id) => {
    router.push(`/editar-modulo/${id}`);
};

// Confirmar eliminación
const confirmarEliminar = (id) => {
    moduloAEliminar.value = id;
    modalEliminar.value = true;
};

// Eliminar módulo
const eliminarModulo = async () => {
    try {
        await deleteModuloAPI(moduloAEliminar.value);
        exito.value = 'Módulo eliminado correctamente';
        modalEliminar.value = false;
        await cargarModulos();
    } catch (err) {
        console.error('Error eliminando módulo:', err);
        error.value = err.response?.data?.message || 'Error al eliminar el módulo';
    }
};

// Lifecycle
onMounted(() => {
    cargarModulos();
});
</script>

<style scoped>
.modulos-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
    background: linear-gradient(135deg, #f5f1ed 0%, #faf7f2 100%);
    min-height: 100vh;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    gap: 20px;
}

.page-title {
    font-size: 32px;
    font-weight: 700;
    color: #5a4037;
    margin: 0;
}

.error-message,
.success-message {
    padding: 16px 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
    animation: slideDown 0.3s ease-out;
}

.error-message {
    background: #fee;
    color: #c33;
    border-left: 4px solid #c33;
}

.success-message {
    background: #efe;
    color: #3c3;
    border-left: 4px solid #3c3;
}

.error-close {
    background: none;
    border: none;
    color: inherit;
    font-size: 20px;
    cursor: pointer;
    padding: 0 8px;
}

.loading-state,
.empty-state {
    text-align: center;
    padding: 60px 20px;
    background: white;
    border-radius: 12px;
    color: #999;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
}

.empty-state p {
    margin: 0;
    font-size: 16px;
}

.modulos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.modulo-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #ede7e0;
    display: flex;
    flex-direction: column;
    gap: 15px;
    transition: all 0.3s;
}

.modulo-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
}

.modulo-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.modulo-nombre {
    font-size: 18px;
    font-weight: 600;
    color: #5a4037;
    margin: 0;
    flex: 1;
}

.modulo-codigo {
    padding: 4px 10px;
    background: #f5f1ed;
    color: #5a4037;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    white-space: nowrap;
}

.modulo-descripcion {
    color: #666;
    font-size: 14px;
    margin: 0;
    line-height: 1.5;
    flex-grow: 1;
}

.modulo-info {
    display: flex;
    gap: 15px;
    padding: 15px 0;
    border-top: 1px solid #ede7e0;
    border-bottom: 1px solid #ede7e0;
}

.info-item {
    text-align: center;
    flex: 1;
}

.info-item label {
    display: block;
    font-size: 12px;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
}

.info-item span {
    display: block;
    font-size: 18px;
    font-weight: 700;
    color: #5a4037;
}

.componentes-preview {
    background: #faf7f2;
    border-radius: 6px;
    padding: 10px;
}

.componentes-preview label {
    font-size: 12px;
    font-weight: 600;
    color: #5a4037;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: block;
    margin-bottom: 8px;
}

.componentes-preview ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.componentes-preview li {
    font-size: 13px;
    color: #666;
    padding: 4px 0;
}

.mas-items {
    color: #999;
    font-style: italic;
}

.card-actions {
    display: flex;
    gap: 10px;
    margin-top: auto;
}

.btn-primary,
.btn-edit,
.btn-secondary {
    flex: 1;
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.btn-primary {
    background: #d4a574;
    color: white;
}

.btn-primary:hover {
    background: #c89564;
    transform: translateY(-2px);
}

.btn-edit {
    background: #d4a574;
    color: white;
}

.btn-edit:hover {
    background: #c89564;
}

.btn-delete {
    background: #fee;
    color: #c33;
    border: 1px solid #c33;
}

.btn-delete:hover {
    background: #c33;
    color: white;
}

.btn-secondary {
    background: #f5f1ed;
    color: #5a4037;
    border: 1px solid #d4a574;
}

.btn-secondary:hover {
    background: #ede7e0;
}

/* Modal */
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
    padding: 30px;
    max-width: 400px;
    width: 90%;
}

.modal-content h3 {
    font-size: 18px;
    font-weight: 600;
    color: #5a4037;
    margin: 0 0 15px 0;
}

.modal-content p {
    color: #666;
    margin: 0 0 20px 0;
    line-height: 1.5;
}

.modal-actions {
    display: flex;
    gap: 10px;
}

.modal-actions button {
    flex: 1;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        align-items: stretch;
    }

    .btn-primary {
        width: 100%;
    }

    .modulos-grid {
        grid-template-columns: 1fr;
    }
}
</style>
