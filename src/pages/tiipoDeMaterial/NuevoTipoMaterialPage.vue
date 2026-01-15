<template>
    <div class="nuevo-tipo-container">
        <div class="page-header">
            <RouterLink to="/tipo-de-material" class="btn-back">← Volver</RouterLink>
            <h1 class="page-title">Nuevo Tipo de Material</h1>
        </div>

        <!-- Formulario -->
        <div class="form-container">
            <!-- Mensaje de error -->
            <div v-if="error" class="error-message">
                <span>⚠️ {{ error }}</span>
                <button @click="error = null" class="error-close">✕</button>
            </div>

            <form @submit.prevent="guardar" class="form">
                <div class="form-group">
                    <label for="nombre">Nombre *</label>
                    <input
                        id="nombre"
                        v-model="formData.nombre"
                        type="text"
                        placeholder="Ej: Madera Natural"
                        required
                    />
                </div>

                <div class="form-group">
                    <label for="codigo">Código</label>
                    <input
                        id="codigo"
                        v-model="formData.codigo"
                        type="text"
                        placeholder="Ej: MADERA-NAT"
                    />
                </div>

                <div class="form-group">
                    <label for="descripcion">Descripción</label>
                    <textarea
                        id="descripcion"
                        v-model="formData.descripcion"
                        placeholder="Describe este tipo de material..."
                        rows="4"
                    ></textarea>
                </div>

                <div class="form-actions">
                    <RouterLink to="/tipo-de-material" class="btn-secondary">Cancelar</RouterLink>
                    <button type="submit" class="btn-primary" :disabled="cargando">
                        {{ cargando ? 'Guardando...' : '💾 Guardar' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { crearTipoDeMaterial } from '@/http/tipo_de_material-api';

const router = useRouter();

const formData = ref({
    nombre: '',
    codigo: '',
    descripcion: '',
});

const cargando = ref(false);
const error = ref(null);

const guardar = async () => {
    error.value = null;
    cargando.value = true;

    try {
        await crearTipoDeMaterial(formData.value);
        // Pequeño delay para que se complete la petición
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push('/tipo-de-material');
    } catch (err) {
        console.error('Error:', err);
        error.value = err.response?.data?.message || 'Error al guardar el tipo de material';
    } finally {
        cargando.value = false;
    }
};
</script>

<style scoped>
.nuevo-tipo-container {
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
    .nuevo-tipo-container {
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
