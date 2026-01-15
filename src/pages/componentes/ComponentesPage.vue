<template>
    <div class="componentes-container">
        <!-- Header -->
        <div class="page-header">
            <div class="header-content">
                <h1 class="page-title">🔧 Componentes</h1>
                <p class="header-subtitle">Gestiona los componentes de tus proyectos</p>
            </div>
            <button class="btn-primary" @click="$router.push('/nuevo-componente')">+ Nuevo Componente</button>
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
            <p>Cargando componentes...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="componentes.length === 0" class="empty-state">
            <p>📭 No hay componentes registrados.</p>
            <button class="btn-primary" @click="$router.push('/nuevo-componente')">Crear Primer Componente</button>
        </div>

        <!-- Componentes Grid -->
        <div v-else class="componentes-grid">
            <div v-for="componente in componentes" :key="componente.id" class="componente-card">
                <div class="componente-header">
                    <h3 class="componente-nombre">{{ componente.nombre }}</h3>
                    <span class="componente-codigo">{{ componente.codigo }}</span>
                </div>

                <p class="componente-descripcion">{{ componente.descripcion || 'Sin descripción' }}</p>

                <div class="componente-info">
                    <div class="info-item">

                        <label> Precio</label>
                        <span>${{ formatCurrency(componente.costo_total) }}</span>
                    </div>
                </div>

                <div class="card-actions">
                    <button class="btn-edit" @click="editarComponente(componente.id)">✏️ Editar</button>
                    <button class="btn-delete" @click="confirmarEliminar(componente.id)">🗑️ Eliminar</button>
                </div>
            </div>
        </div>

        <!-- Modal de confirmación de eliminación -->
        <div v-if="modalEliminar" class="modal-overlay" @click.self="modalEliminar = false">
            <div class="modal-content">
                <h3>Confirmar eliminación</h3>
                <p>¿Estás seguro de que deseas eliminar este componente?</p>
                <div class="modal-actions">
                    <button class="btn-secondary" @click="modalEliminar = false">Cancelar</button>
                    <button class="btn-delete" @click="eliminarComponenteFunc">Eliminar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchComponentes, eliminarComponente } from '@/http/componentes-api';

const router = useRouter();

// Estado
const componentes = ref([]);
const cargando = ref(true);
const error = ref(null);
const exito = ref(null);
const modalEliminar = ref(false);
const componenteAEliminar = ref(null);

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
    padding: 24px 0 24px 0;
    border-bottom: 2px solid #d4a574;
    gap: 20px;
}

.header-content {
    flex: 1;
}

.page-title {
    font-size: 32px;
    font-weight: 700;
    color: #5a4037;
    margin: 0;
}

.header-subtitle {
    font-size: 14px;
    color: #8b7355;
    margin: 6px 0 0 0;
    font-weight: 500;
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

.componentes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
}

.componente-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #ede7e0;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.componente-card:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
    border-color: #d4a574;
}

.componente-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
}

.componente-nombre {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #5a4037;
}

.componente-codigo {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    box-shadow: 0 2px 6px rgba(212, 165, 116, 0.2);
}

.componente-descripcion {
    color: #999;
    font-size: 14px;
    margin: 0;
    line-height: 1.4;
}

.componente-info {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 16px;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    border: 1px solid #e8ddd7;
    border-radius: 8px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-align: center;
}

.info-item label {
    font-size: 11px;
    font-weight: 700;
    color: #8b7355;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-item span {
    font-size: 15px;
    font-weight: 700;
    color: #5a4037;
}

.stock-bajo {
    color: #e67e22;
}

.card-actions {
    display: flex;
    gap: 12px;
    margin-top: auto;
}

.btn-edit,
.btn-delete {
    flex: 1;
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-edit {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.2);
}

.btn-edit:hover {
    background: linear-gradient(135deg, #c89564 0%, #b8844c 100%);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.btn-delete {
    background: white;
    color: #e67e22;
    border: 2px solid #e67e22;
    box-shadow: 0 2px 8px rgba(230, 126, 34, 0.1);
}

.btn-delete:hover {
    background: #fff5f0;
    box-shadow: 0 4px 12px rgba(230, 126, 34, 0.2);
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

    .componentes-grid {
        grid-template-columns: 1fr;
    }

    .componente-info {
        grid-template-columns: 1fr;
    }
}
</style>
