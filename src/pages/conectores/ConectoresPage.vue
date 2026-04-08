<template>
    <div class="conectores-container">
        <div class="page-header">
            <button class="btn-back" @click="$router.push('/electricidad')" title="Regresar a Electricidad">
                ← Regresar
            </button>
            <div class="header-content">
                <h1 class="page-title">🔗 Conectores</h1>
                <p class="page-subtitle">Administración de conectores eléctricos</p>
            </div>
            <router-link v-if="authStore.hasPermission('catalogs.write')" to="/nuevo-conector" class="btn-primary">
                ➕ Nuevo Conector
            </router-link>
        </div>

        <div class="search-section">
            <input
                v-model="searchQuery"
                type="text"
                placeholder="🔍 Buscar conector..."
                class="search-input"
            />
        </div>

        <div v-if="loading" class="loading-message">Cargando conectores...</div>
        <div v-else-if="error" class="error-message">Error al cargar los conectores</div>
        <div v-else-if="filteredConectores.length === 0" class="empty-message">
            {{ searchQuery ? 'No se encontraron conectores' : 'No hay conectores registrados' }}
        </div>
        <div v-else class="conectores-grid">
            <div v-for="conector in filteredConectores" :key="conector.id" class="conector-card">
                <div class="conector-header">
                    <h3 class="conector-name">{{ conector.nombre }}</h3>
                    <div v-if="authStore.hasPermission('catalogs.write')" class="conector-actions">
                        <button
                            @click="$router.push(`/editar-conector/${conector.id}`)"
                            class="btn-edit"
                            title="Editar"
                        >
                            ✏️
                        </button>
                        <button
                            @click="confirmarEliminacion(conector)"
                            class="btn-delete"
                            title="Eliminar"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="conector-info">
                    <div v-if="conector.precio" class="info-item">
                        <label>💰 Precio</label>
                        <span>${{ formatCurrency(conector.precio) }}</span>
                    </div>
                    <div v-if="conector.porcentaje_utilizacion" class="info-item">
                        <label>📊 % Utilización</label>
                        <span>{{ conector.porcentaje_utilizacion }}%</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de confirmación -->
        <div v-if="showDeleteModal" class="modal-overlay" @click="cancelarEliminacion">
            <div class="modal-content" @click.stop>
                <h3>⚠️ Confirmar Eliminación</h3>
                <p>¿Estás seguro de que deseas eliminar este conector?</p>
                <p class="modal-item-name">{{ conectorAEliminar?.nombre }}</p>
                <div class="modal-actions">
                    <button @click="cancelarEliminacion" class="btn-secondary">Cancelar</button>
                    <button @click="eliminarConector" class="btn-danger">Eliminar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useConectoresStore } from '@/stores/conectores';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const conectoresStore = useConectoresStore();
const authStore = useAuthStore();

const searchQuery = ref('');
const showDeleteModal = ref(false);
const conectorAEliminar = ref(null);

const loading = computed(() => conectoresStore.loading);
const error = computed(() => conectoresStore.error);

const filteredConectores = computed(() => {
    if (!searchQuery.value) return conectoresStore.conectores;

    const query = searchQuery.value.toLowerCase();
    return conectoresStore.conectores.filter(conector =>
        conector.nombre?.toLowerCase().includes(query)
    );
});

const cargarConectores = async () => {
    await conectoresStore.fetchConectoresData();
};

const confirmarEliminacion = (conector) => {
    conectorAEliminar.value = conector;
    showDeleteModal.value = true;
};

const cancelarEliminacion = () => {
    showDeleteModal.value = false;
    conectorAEliminar.value = null;
};

const eliminarConector = async () => {
    if (!conectorAEliminar.value) return;

    try {
        await conectoresStore.eliminarConectorExistente(conectorAEliminar.value.id);
        showDeleteModal.value = false;
        conectorAEliminar.value = null;
    } catch (error) {
        console.error('Error al eliminar conector:', error);
        alert('Error al eliminar el conector');
    }
};

const formatCurrency = (value) => {
    if (!value) return '0.00';
    return parseFloat(value).toFixed(2);
};

onMounted(() => {
    cargarConectores();
});
</script>

<style scoped>
.conectores-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #fafbfc 100%);
}

.page-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid #d4a574;
}

.btn-back {
    padding: 0.6rem 1.2rem;
    background: white;
    border: 2px solid #e8ddd0;
    border-radius: 8px;
    color: #5a4037;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-back:hover {
    border-color: #d4a574;
    background: #fafbfc;
    transform: translateX(-4px);
}

.header-content {
    flex: 1;
}

.page-title {
    font-size: 2rem;
    color: #5a4037;
    margin: 0;
    font-weight: 700;
}

.page-subtitle {
    color: #8b7355;
    margin: 0.3rem 0 0;
    font-size: 0.95rem;
}

.btn-primary {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #d4a574 0%, #c89960 100%);
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.3);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.4);
}

.search-section {
    margin-bottom: 2rem;
}

.search-input {
    width: 100%;
    padding: 0.875rem 1rem;
    font-size: 1rem;
    border: 2px solid #e8ddd0;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.search-input:focus {
    outline: none;
    border-color: #d4a574;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
}

.conectores-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
}

.conector-card {
    background: white;
    border: 2px solid #e8ddd0;
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.3s ease;
}

.conector-card:hover {
    border-color: #d4a574;
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.15);
    transform: translateY(-2px);
}

.conector-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
}

.conector-name {
    font-size: 1.25rem;
    color: #5a4037;
    margin: 0;
    font-weight: 600;
    flex: 1;
}

.conector-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-edit,
.btn-delete {
    padding: 0.5rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1.1rem;
    transition: all 0.2s ease;
}

.btn-edit {
    background: #e3f2fd;
}

.btn-edit:hover {
    background: #bbdefb;
    transform: scale(1.1);
}

.btn-delete {
    background: #ffebee;
}

.btn-delete:hover {
    background: #ffcdd2;
    transform: scale(1.1);
}

.conector-info {
    display: grid;
    gap: 0.75rem;
}

.info-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    background: #fafbfc;
    border-radius: 6px;
}

.info-item label {
    font-weight: 600;
    color: #5a4037;
}

.info-item span {
    color: #8b7355;
}

.loading-message,
.error-message,
.empty-message {
    text-align: center;
    padding: 3rem;
    color: #8b7355;
    font-size: 1.1rem;
}

.error-message {
    color: #d32f2f;
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
    max-width: 500px;
    width: 90%;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
    margin: 0 0 1rem;
    color: #5a4037;
    font-size: 1.5rem;
}

.modal-content p {
    color: #8b7355;
    margin: 0.5rem 0;
}

.modal-item-name {
    font-weight: 600;
    color: #5a4037;
    font-size: 1.1rem;
    margin-top: 1rem;
}

.modal-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
    justify-content: flex-end;
}

.btn-secondary {
    padding: 0.75rem 1.5rem;
    background: #e8ddd0;
    border: none;
    border-radius: 8px;
    color: #5a4037;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-secondary:hover {
    background: #d4c5b3;
}

.btn-danger {
    padding: 0.75rem 1.5rem;
    background: #d32f2f;
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-danger:hover {
    background: #b71c1c;
}
</style>
