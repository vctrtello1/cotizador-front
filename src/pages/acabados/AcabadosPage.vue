<template>
    <div class="acabados-container">
        <!-- Header -->

        <!-- Subcategorías grid -->
        <div class="subcategorias-grid">
            <router-link
                v-for="sub in subcategorias"
                :key="sub.path"
                :to="sub.path"
                class="subcategoria-card"
            >
                <span class="subcategoria-icon">{{ sub.icon }}</span>
                <span class="subcategoria-label">{{ sub.label }}</span>
            </router-link>
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
            <p>Cargando acabados...</p>
        </div>






    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAcabadosStore } from '@/stores/acabados.js';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const acabadosStore = useAcabadosStore();
const authStore = useAuthStore();

// Estado
const cargando = ref(true);
const error = ref(null);
const exito = ref(null);
const modalEliminar = ref(false);
const acabadoAEliminar = ref(null);
const searchTerm = ref('');
const canWrite = computed(() => authStore.hasPermission('catalogs.write'));

const subcategorias = [
    { path: '/estructuras', icon: '🏗️', label: 'Estructuras' },
    { path: '/acabado-tablero', icon: '🎨', label: 'Acabado Tablero' },
    { path: '/acabado-cubre-canto', icon: '🧵', label: 'Acabado Cubre Canto' },
    { path: '/correderas', icon: '🎚️', label: 'Correderas' },
    { path: '/compases-abatibles', icon: '🔀', label: 'Compases Abatibles' },
    { path: '/puertas', icon: '🚪', label: 'Puertas' },
];

// Cargar acabados
const cargarAcabados = async () => {
    try {
        cargando.value = true;
        error.value = null;
        await acabadosStore.fetchAcabados();
    } catch (err) {
        error.value = 'Error al cargar los acabados';
        console.error(err);
    } finally {
        cargando.value = false;
    }
};

// Editar acabado
const editarAcabado = (id) => {
    router.push(`/editar-acabado/${id}`);
};

// Confirmar eliminación
const confirmarEliminar = (id) => {
    acabadoAEliminar.value = id;
    modalEliminar.value = true;
};

// Eliminar acabado
const eliminarAcabado = async () => {
    try {
        await acabadosStore.eliminarAcabado(acabadoAEliminar.value);
        exito.value = 'Acabado eliminado correctamente';
        modalEliminar.value = false;
        setTimeout(() => {
            exito.value = null;
        }, 3000);
    } catch (err) {
        error.value = 'Error al eliminar el acabado';
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
const filteredAcabados = computed(() => {
    const term = searchTerm.value.trim().toLowerCase();
    if (!term) return acabadosStore.acabados;

    return acabadosStore.acabados.filter((acabado) => {
        const nombre = (acabado.nombre || acabado.acabado || '').toLowerCase();
        const descripcion = (acabado.descripcion || '').toLowerCase();
        return nombre.includes(term) || descripcion.includes(term);
    });
});

// Cargar datos al montar
onMounted(() => {
    cargarAcabados();
});
</script>

<style scoped>
.acabados-container {
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
    padding-bottom: 1.5rem;
    border-bottom: 2px solid #d4a574;
}

.page-title {
    font-size: 2.5rem;
    color: #5a4037;
    margin: 0;
    font-weight: 700;
}

.subcategorias-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.subcategoria-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.25rem 1rem;
    background: white;
    border: 1px solid #ede6dd;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    text-decoration: none;
    transition: all 0.3s;
    cursor: pointer;
}

.subcategoria-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    border-color: #d4a574;
}

.subcategoria-icon {
    font-size: 2rem;
}

.subcategoria-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #5a4037;
    text-align: center;
}

.btn-primary {
    padding: 12px 24px;
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 15px;
    font-weight: 600;
    transition: all 0.3s;
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.search-bar {
    position: relative;
    margin-bottom: 2rem;
}

.search-input {
    width: 100%;
    padding: 14px 50px 14px 20px;
    border: 2px solid #d4a574;
    border-radius: 10px;
    font-size: 15px;
    box-sizing: border-box;
    transition: all 0.3s;
    background: white;
}

.search-input:focus {
    outline: none;
    border-color: #c89564;
    box-shadow: 0 0 0 4px rgba(212, 165, 116, 0.2);
}

.search-clear {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #999;
    transition: color 0.2s;
}

.search-clear:hover {
    color: #333;
}

.error-message {
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
    background-color: #ffebee;
    color: #c62828;
    border: 2px solid #ef5350;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
}

.success-message {
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
    background-color: #e8f5e9;
    color: #2e7d32;
    border: 2px solid #4caf50;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
}

.error-close {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 1.4rem;
    padding: 0;
}

.loading-state, .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background-color: white;
    border-radius: 12px;
    color: #999;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.empty-state p {
    margin-bottom: 1.5rem;
    color: #8b7355;
    font-size: 1.1rem;
}

.acabados-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
}

.acabado-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid #ede6dd;
    transition: all 0.3s;
}

.acabado-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.acabado-header {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #ede6dd;
}

.acabado-nombre {
    font-size: 1.2rem;
    color: #5a4037;
    margin: 0;
    font-weight: 600;
}

.acabado-info {
    margin-bottom: 1.5rem;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
}

.info-item label {
    font-size: 0.9rem;
    color: #8b7355;
    font-weight: 500;
}

.info-item span {
    font-size: 1rem;
    color: #5a4037;
    font-weight: 600;
}

.card-actions {
    display: flex;
    gap: 0.75rem;
}

.btn-edit, .btn-delete, .btn-secondary {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s;
}

.btn-edit {
    background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
    color: white;
}

.btn-edit:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.btn-delete {
    background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
    color: white;
}

.btn-delete:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.btn-secondary {
    background: linear-gradient(135deg, #9e9e9e 0%, #757575 100%);
    color: white;
}

.btn-secondary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(158, 158, 158, 0.3);
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
}

.modal-content {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.modal-content h3 {
    margin: 0 0 1rem 0;
    color: #5a4037;
}

.modal-content p {
    margin: 0 0 1.5rem 0;
    color: #8b7355;
}

.modal-actions {
    display: flex;
    gap: 1rem;
}

@media (max-width: 768px) {
    .acabados-container {
        padding: 1rem;
    }

    .page-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }

    .acabados-grid {
        grid-template-columns: 1fr;
    }
}
</style>
