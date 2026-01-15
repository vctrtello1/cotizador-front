<template>
    <div class="editar-mano-obra-container">
        <div class="page-header">
            <RouterLink to="/mano-de-obra" class="btn-back">← Volver</RouterLink>
            <h1 class="page-title">Editar Mano de Obra</h1>
        </div>

        <!-- Formulario -->
        <div class="form-container">
            <!-- Mensaje de error -->
            <div v-if="error" class="error-message">
                <span>⚠️ {{ error }}</span>
                <button @click="error = null" class="error-close">✕</button>
            </div>

            <!-- Loading -->
            <div v-if="cargandoDatos" class="loading-state">
                <p>Cargando datos...</p>
            </div>

            <form v-else @submit.prevent="guardar" class="form">
                <div class="form-group">
                    <label for="nombre">Nombre *</label>
                    <input
                        id="nombre"
                        v-model="formData.nombre"
                        type="text"
                        placeholder="Ej: Carpintería Básica"
                        required
                    />
                </div>

                <div class="form-group">
                    <label for="descripcion">Descripción</label>
                    <textarea
                        id="descripcion"
                        v-model="formData.descripcion"
                        placeholder="Describe esta mano de obra..."
                        rows="4"
                    ></textarea>
                </div>

                <div class="form-group">
                    <label for="costo_por_hora">Costo por Hora *</label>
                    <input
                        id="costo_por_hora"
                        v-model="formData.costo_por_hora"
                        type="number"
                        step="0.01"
                        placeholder="Ej: 150.00"
                        required
                    />
                </div>

                <div class="form-actions">
                    <RouterLink to="/mano-de-obra" class="btn-secondary">Cancelar</RouterLink>
                    <button type="submit" class="btn-primary" :disabled="cargando">
                        {{ cargando ? 'Guardando...' : '💾 Guardar Cambios' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getClienteById, actualizarManoDeObra } from '@/http/mano_de_obra-api .js';

const router = useRouter();
const route = useRoute();

const formData = ref({
    nombre: '',
    descripcion: '',
    costo_por_hora: '',
});

const cargandoDatos = ref(true);
const cargando = ref(false);
const error = ref(null);

const cargarDatos = async () => {
    try {
        const response = await getClienteById(route.params.id);
        const data = Array.isArray(response) ? response[0] : (response.data || response);
        formData.value = {
            nombre: data.nombre || '',
            descripcion: data.descripcion || '',
            costo_por_hora: data.costo_por_hora || data.costo_hora || data.tarifa || '',
        };
    } catch (err) {
        console.error('Error:', err);
        error.value = err.response?.data?.message || 'Error al cargar los datos';
    } finally {
        cargandoDatos.value = false;
    }
};

const guardar = async () => {
    error.value = null;
    cargando.value = true;

    try {
        await actualizarManoDeObra(route.params.id, formData.value);
        // Pequeño delay para que se complete la petición
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push('/mano-de-obra');
    } catch (err) {
        console.error('Error:', err);
        error.value = err.response?.data?.message || 'Error al guardar los cambios';
    } finally {
        cargando.value = false;
    }
};

onMounted(() => {
    cargarDatos();
});
</script>

<style scoped>
.editar-mano-obra-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
}

.page-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid #d4a574;
}

.btn-back {
    padding: 8px 16px;
    background: #e8ddd7;
    color: #5a4037;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    transition: all 0.2s;
}

.btn-back:hover {
    background: #d4a574;
    color: white;
}

.page-title {
    font-size: 2rem;
    font-weight: 700;
    color: #5a4037;
    margin: 0;
}

.form-container {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    border: 2px solid #e8ddd7;
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.08);
}

.error-message {
    padding: 12px 16px;
    background: #fee;
    color: #c33;
    border: 1px solid #fcc;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.error-close {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    color: inherit;
}

.loading-state {
    text-align: center;
    padding: 2rem;
    color: #999;
}

.form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    font-weight: 600;
    color: #5a4037;
}

.form-group input,
.form-group textarea {
    padding: 12px 16px;
    border: 2px solid #e8ddd7;
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    transition: all 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #d4a574;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
}

.form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.btn-primary,
.btn-secondary {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.btn-primary {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    flex: 1;
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.2);
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-secondary {
    background: #e8ddd7;
    color: #5a4037;
    flex: 1;
    text-decoration: none;
}

.btn-secondary:hover {
    background: #d4a574;
    color: white;
}

@media (max-width: 768px) {
    .editar-mano-obra-container {
        padding: 1rem;
    }

    .form-container {
        padding: 1.5rem;
    }

    .page-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .page-title {
        font-size: 1.5rem;
    }

    .form-actions {
        flex-direction: column;
    }
}
</style>
