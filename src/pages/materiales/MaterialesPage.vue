<template>
    <div class="materiales-container">
        <!-- Header -->
        <div class="page-header">
            <h1 class="page-title">Materiales</h1>
            <button class="btn-primary" @click="$router.push('/nuevo-material')">+ Nuevo Material</button>
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
            <p>Cargando materiales...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="materiales.length === 0" class="empty-state">
            <p>No hay materiales registrados.</p>
            <button class="btn-primary" @click="$router.push('/nuevo-material')">Crear Primer Material</button>
        </div>

        <!-- Materiales Grid -->
        <div v-else class="materiales-grid">
            <div v-for="material in materiales" :key="material.id" class="material-card">
                <!-- Linea decorativa superior -->
                <div class="card-top-line"></div>

                <div class="material-header">
                    <div class="header-content">
                        <h3 class="material-nombre">{{ material.nombre }}</h3>
                        <p class="material-descripcion">{{ material.descripcion || 'Sin descripción' }}</p>
                    </div>
                    <span class="tipo-badge">{{ material.tipo_de_material?.nombre || material.tipo || '-' }}</span>
                </div>

                <div class="material-stats">
                    <div class="stat-item">
                        <span class="stat-label">Precio</span>
                        <span class="stat-value precio-value">${{ formatCurrency(material.precio_unitario || material.costo_unitario) }}</span>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <span class="stat-label">Código</span>
                        <span class="stat-value codigo-value">{{ material.codigo }}</span>
                    </div>
                </div>

                <div class="card-actions">
                    <button class="btn-edit" @click="editarMaterial(material.id)" title="Editar material">✏️ Editar</button>
                    <button class="btn-delete" @click="confirmarEliminar(material.id)" title="Eliminar material">🗑️ Eliminar</button>
                    <button class="btn-details" @click="verDetalles(material.id)" title="Ver detalles">👁️ Detalles</button>
                </div>
            </div>
        </div>

        <!-- Modal de confirmación de eliminación -->
        <div v-if="modalEliminar" class="modal-overlay" @click.self="modalEliminar = false">
            <div class="modal-content">
                <h3>Confirmar eliminación</h3>
                <p>¿Estás seguro de que deseas eliminar este material?</p>
                <div class="modal-actions">
                    <button class="btn-secondary" @click="modalEliminar = false">Cancelar</button>
                    <button class="btn-delete" @click="eliminarMaterial">Eliminar</button>
                </div>
            </div>
        </div>

        <!-- Modal de detalles del material -->
        <div v-if="modalDetalles" class="modal-overlay" @click.self="modalDetalles = false">
            <div class="modal-content modal-detalles">
                <div class="modal-header">
                    <h2>{{ materialSeleccionado?.nombre }}</h2>
                    <button @click="modalDetalles = false" class="modal-close">✕</button>
                </div>
                
                <div class="modal-body">
                    <div class="detalle-section">
                        <h3>Información General</h3>
                        <div class="detalle-grid">
                            <div class="detalle-item">
                                <label>Código</label>
                                <span>{{ materialSeleccionado?.codigo }}</span>
                            </div>
                            <div class="detalle-item">
                                <label>Tipo de Material</label>
                                <span>{{ materialSeleccionado?.tipo_de_material?.nombre || materialSeleccionado?.tipo || '-' }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detalle-section">
                        <h3>Descripción</h3>
                        <p class="detalle-descripcion">{{ materialSeleccionado?.descripcion || 'Sin descripción' }}</p>
                    </div>

                    <div class="detalle-section">
                        <h3>Detalles de Precio</h3>
                        <div class="detalle-grid">
                            <div class="detalle-item">
                                <label>Precio Unitario</label>
                                <span class="precio-destacado">${{ formatCurrency(materialSeleccionado?.precio_unitario || materialSeleccionado?.costo_unitario) }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detalle-section">
                        <h3>Medidas</h3>
                        <div class="detalle-grid">
                            <div class="detalle-item">
                                <label>Largo</label>
                                <span>{{ materialSeleccionado?.largo || '-' }} {{ materialSeleccionado?.unidad_largo || '' }}</span>
                            </div>
                            <div class="detalle-item">
                                <label>Ancho</label>
                                <span>{{ materialSeleccionado?.ancho || '-' }} {{ materialSeleccionado?.unidad_ancho || '' }}</span>
                            </div>
                            <div class="detalle-item">
                                <label>Alto</label>
                                <span>{{ materialSeleccionado?.alto || '-' }} {{ materialSeleccionado?.unidad_alto || '' }}</span>
                            </div>
                            <div class="detalle-item">
                                <label>Unidad de medida</label>
                                <span>{{ materialSeleccionado?.unidad_medida || '-' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn-primary" @click="editarMaterial(materialSeleccionado?.id)">Editar Material</button>
                    <button class="btn-secondary" @click="modalDetalles = false">Cerrar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchMateriales, eliminarMaterial as deleteMaterialAPI } from '@/http/materiales-api';

const router = useRouter();

// Estado
const materiales = ref([]);
const cargando = ref(true);
const error = ref(null);
const exito = ref(null);
const modalEliminar = ref(false);
const materialAEliminar = ref(null);
const modalDetalles = ref(false);
const materialSeleccionado = ref(null);

// Cargar materiales
const cargarMateriales = async () => {
    cargando.value = true;
    error.value = null;
    try {
        const response = await fetchMateriales();
        console.log('Materiales cargados:', response);
        materiales.value = Array.isArray(response) ? response : (response.data || []);
    } catch (err) {
        console.error('Error cargando materiales:', err);
        error.value = 'Error al cargar los materiales';
    } finally {
        cargando.value = false;
    }
};

// Editar material
const editarMaterial = (id) => {
    router.push({ name: 'EditarMaterial', params: { id } });
};

// Ver detalles del material
const verDetalles = (id) => {
    materialSeleccionado.value = materiales.value.find(m => m.id === id) || null;
    modalDetalles.value = true;
};

// Confirmar eliminación
const confirmarEliminar = (id) => {
    materialAEliminar.value = id;
    modalEliminar.value = true;
};

// Eliminar material
const eliminarMaterial = async () => {
    try {
        await deleteMaterialAPI(materialAEliminar.value);
        exito.value = '✓ Material eliminado exitosamente';
        cargarMateriales();
        modalEliminar.value = false;
    } catch (err) {
        console.error('Error eliminando material:', err);
        error.value = err.response?.data?.message || 'Error al eliminar el material';
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
    cargarMateriales();
});
</script>

<style scoped>
.materiales-container {
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
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 2px solid #d4a574;
}

.page-title {
    font-size: 32px;
    font-weight: 700;
    color: #5a4037;
    margin: 0;
}

.btn-primary {
    padding: 12px 28px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(212, 165, 116, 0.4);
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

.loading-state {
    padding: 60px 20px;
    text-align: center;
    background: white;
    border-radius: 12px;
    color: #999;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.empty-state {
    padding: 60px 20px;
    text-align: center;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.empty-state p {
    color: #999;
    margin-bottom: 20px;
    font-size: 16px;
}

.materiales-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
}

.material-card {
    background: white;
    border-radius: 12px;
    padding: 0;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid #ede7e0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
}

.material-card:hover {
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
    border-color: #d4a574;
}

.card-top-line {
    height: 4px;
    background: linear-gradient(90deg, #d4a574 0%, #c89564 50%, #a67c52 100%);
}

.material-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    padding: 16px 20px 8px;
}

.header-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.material-nombre {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #5a4037;
    line-height: 1.3;
}

.material-descripcion {
    color: #999;
    font-size: 13px;
    margin: 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.tipo-badge {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    display: inline-block;
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.2);
}

.material-stats {
    display: flex;
    align-items: center;
    gap: 0;
    padding: 12px 20px;
    background: linear-gradient(135deg, #faf7f2 0%, #f5f1ed 100%);
    border-top: 1px solid #ede7e0;
    border-bottom: 1px solid #ede7e0;
}

.stat-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-align: center;
}

.stat-label {
    font-size: 11px;
    font-weight: 700;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.stat-value {
    font-size: 16px;
    font-weight: 700;
    color: #5a4037;
}

.precio-value {
    color: #d4a574;
    font-size: 18px;
}

.codigo-value {
    font-family: 'Courier New', monospace;
    font-size: 14px;
    color: #666;
}

.stat-divider {
    width: 1px;
    height: 40px;
    background: #d4a574;
    opacity: 0.2;
}

.card-actions {
    display: flex;
    gap: 8px;
    padding: 16px 20px;
    background: #faf7f2;
}

.btn-edit,
.btn-delete,
.btn-details {
    flex: 1;
    padding: 12px 16px;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    letter-spacing: 0.3px;
}

.btn-details {
    background: linear-gradient(135deg, #8b7aa5 0%, #6d5b8c 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(139, 122, 165, 0.2);
}

.btn-details:hover {
    background: linear-gradient(135deg, #6d5b8c 0%, #554975 100%);
    box-shadow: 0 4px 12px rgba(139, 122, 165, 0.3);
    transform: translateY(-1px);
}

.btn-details:active {
    transform: translateY(0);
}

.btn-edit {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.2);
}

.btn-edit:hover {
    background: linear-gradient(135deg, #c89564 0%, #b5874a 100%);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
    transform: translateY(-1px);
}

.btn-edit:active {
    transform: translateY(0);
}

.btn-delete {
    background: #fff5f5;
    color: #c33;
    border: 1.5px solid #e89;
    box-shadow: 0 2px 8px rgba(204, 51, 51, 0.1);
}

.btn-delete:hover {
    background: #fee;
    border-color: #c33;
    box-shadow: 0 4px 12px rgba(204, 51, 51, 0.2);
    transform: translateY(-1px);
}

.btn-delete:active {
    transform: translateY(0);
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
    padding: 32px;
    max-width: 400px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-content.modal-detalles {
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 0;
    display: flex;
    flex-direction: column;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 32px;
    border-bottom: 2px solid #d4a574;
    position: sticky;
    top: 0;
    background: white;
    z-index: 10;
}

.modal-header h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: #5a4037;
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #999;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
}

.modal-close:hover {
    color: #5a4037;
    background: #f5f1ed;
    border-radius: 6px;
}

.modal-body {
    padding: 32px;
    flex: 1;
}

.detalle-section {
    margin-bottom: 32px;
}

.detalle-section:last-child {
    margin-bottom: 0;
}

.detalle-section h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 700;
    color: #5a4037;
    padding-bottom: 12px;
    border-bottom: 2px solid #d4a574;
}

.detalle-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

.detalle-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.detalle-item label {
    font-size: 12px;
    font-weight: 700;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.detalle-item span {
    font-size: 14px;
    font-weight: 600;
    color: #5a4037;
}

.precio-destacado {
    font-size: 20px;
    color: #d4a574;
    font-weight: 700;
}

.detalle-descripcion {
    margin: 0;
    color: #666;
    font-size: 14px;
    line-height: 1.6;
    padding: 16px;
    background: #faf7f2;
    border-radius: 8px;
}

.modal-footer {
    display: flex;
    gap: 12px;
    padding: 24px 32px;
    border-top: 2px solid #d4a574;
    background: #faf7f2;
}

.modal-footer .btn-primary,
.modal-footer .btn-secondary {
    flex: 1;
}

.modal-content h3 {
    margin: 0 0 12px 0;
    color: #5a4037;
    font-size: 20px;
}

.modal-content p {
    margin: 0 0 24px 0;
    color: #999;
    font-size: 14px;
}

.modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.btn-secondary {
    padding: 10px 24px;
    background: #f5f1ed;
    color: #5a4037;
    border: 1px solid #d4a574;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    transition: all 0.3s;
}

.btn-secondary:hover {
    background: #ede7e0;
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
        align-items: flex-start;
        gap: 16px;
    }

    .page-title {
        font-size: 24px;
    }

    .materiales-grid {
        grid-template-columns: 1fr;
    }

    .material-info {
        grid-template-columns: 1fr 1fr;
    }
}
</style>
