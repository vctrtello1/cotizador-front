<template>
    <div class="editar-cotizacion-container">
        <div v-if="cargandoDatos" class="loading-state">
            <div class="spinner"></div>
            <p>Cargando cotización...</p>
        </div>

        <div v-else-if="cotizacion" class="cotizacion-form">
            <div class="form-header">
                <button class="btn-back" @click="$router.back()">← Volver</button>
                <h1 class="form-title">Editar Cotización #{{ cotizacion.id }}</h1>
            </div>

            <div class="form-content">
                <!-- Información básica -->
                <div class="form-section">
                    <h2 class="section-title">📋 Información de la Cotización</h2>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="cliente">Cliente</label>
                            <select v-model="cotizacion.cliente_id" id="cliente" class="form-input">
                                <option value="">Seleccionar Cliente</option>
                                <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
                                    {{ cliente.nombre }}
                                </option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="fecha">Fecha</label>
                            <input 
                                v-model="cotizacion.fecha" 
                                id="fecha" 
                                type="date" 
                                class="form-input"
                            />
                        </div>

                        <div class="form-group">
                            <label for="estado">Estado</label>
                            <select v-model="cotizacion.estado" id="estado" class="form-input">
                                <option value="activa">Activa</option>
                                <option value="completada">Completada</option>
                                <option value="cancelada">Cancelada</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Módulos seleccionados -->
                <div class="form-section">
                    <h2 class="section-title">🧩 Módulos en la Cotización</h2>
                    
                    <div v-if="modulosSeleccionados.length === 0" class="empty-state">
                        <p>No hay módulos en esta cotización</p>
                        <button @click="agregarModulo" class="btn-primary">+ Agregar Módulo</button>
                    </div>

                    <div v-else>
                        <div v-for="(item, index) in modulosSeleccionados" :key="index" class="modulo-item">
                            <div class="modulo-header">
                                <div class="modulo-info">
                                    <h3>{{ item.modulo?.nombre || 'Módulo sin cargar' }}</h3>
                                    <span class="modulo-codigo">{{ item.modulo?.codigo }}</span>
                                </div>
                                <div class="modulo-cantidad">
                                    <label :for="`cantidad-${index}`">Cantidad:</label>
                                    <input 
                                        v-model.number="item.cantidad" 
                                        :id="`cantidad-${index}`"
                                        type="number" 
                                        min="1" 
                                        class="form-input-sm"
                                    />
                                </div>
                                <button @click="eliminarModulo(index)" class="btn-danger">🗑️</button>
                            </div>
                        </div>

                        <button @click="agregarModulo" class="btn-secondary">+ Agregar Módulo</button>
                    </div>
                </div>

                <!-- Resumen de totales -->
                <div class="form-section">
                    <h2 class="section-title">💰 Resumen</h2>
                    <div class="resumen-card">
                        <div class="resumen-item">
                            <span class="resumen-label">Subtotal:</span>
                            <span class="resumen-value">${{ formatCurrency(subtotal) }}</span>
                        </div>
                        <div class="resumen-item">
                            <span class="resumen-label">IVA (19%):</span>
                            <span class="resumen-value">${{ formatCurrency(iva) }}</span>
                        </div>
                        <div class="resumen-item total">
                            <span class="resumen-label">Total:</span>
                            <span class="resumen-value">${{ formatCurrency(total) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Botones de acción -->
                <div class="form-actions">
                    <button @click="$router.back()" class="btn-cancel">Cancelar</button>
                    <button @click="guardarCambios" class="btn-primary" :disabled="guardando">
                        {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
                    </button>
                </div>

                <!-- Mensaje de error -->
                <div v-if="error" class="alert alert-error">
                    {{ error }}
                </div>
            </div>
        </div>

        <div v-else class="error-state">
            <p>No se encontró la cotización</p>
            <button @click="$router.back()" class="btn-primary">Volver</button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCotizacionById } from '../../http/cotizaciones-api';
import { fetchClientes } from '../../http/clientes-api';

const route = useRoute();
const router = useRouter();

const cotizacion = ref(null);
const clientes = ref([]);
const cargandoDatos = ref(true);
const guardando = ref(false);
const error = ref(null);

const modulosSeleccionados = computed(() => {
    return cotizacion.value?.modulos_ordenados || [];
});

const subtotal = computed(() => {
    if (!modulosSeleccionados.value) return 0;
    return modulosSeleccionados.value.reduce((total, item) => {
        const precioModulo = item.modulo?.precio || 0;
        return total + (precioModulo * item.cantidad);
    }, 0);
});

const iva = computed(() => {
    return subtotal.value * 0.19;
});

const total = computed(() => {
    return subtotal.value + iva.value;
});

const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value || 0);
};

const cargarCotizacion = async () => {
    try {
        cargandoDatos.value = true;
        const id = route.params.id;
        
        // Cargar cotización
        const response = await getCotizacionById(id);
        const data = response?.data || response;
        
        if (Array.isArray(data)) {
            cotizacion.value = data[0];
        } else {
            cotizacion.value = data;
        }

        // Cargar clientes
        const clientesResponse = await fetchClientes();
        const clientesData = clientesResponse?.data || clientesResponse;
        clientes.value = Array.isArray(clientesData) ? clientesData : [];
    } catch (err) {
        console.error('Error al cargar cotización:', err);
        error.value = 'Error al cargar la cotización';
    } finally {
        cargandoDatos.value = false;
    }
};

const agregarModulo = () => {
    if (!cotizacion.value.modulos_ordenados) {
        cotizacion.value.modulos_ordenados = [];
    }
    cotizacion.value.modulos_ordenados.push({
        modulo: null,
        cantidad: 1
    });
};

const eliminarModulo = (index) => {
    cotizacion.value.modulos_ordenados.splice(index, 1);
};

const guardarCambios = async () => {
    try {
        guardando.value = true;
        error.value = null;

        // Aquí iría la llamada a la API para actualizar la cotización
        // await actualizarCotizacion(cotizacion.value.id, cotizacion.value);
        
        setTimeout(() => {
            router.push(`/cotizacion-detallada/${cotizacion.value.id}`);
        }, 1000);
    } catch (err) {
        console.error('Error al guardar:', err);
        error.value = 'Error al guardar los cambios';
    } finally {
        guardando.value = false;
    }
};

onMounted(() => {
    cargarCotizacion();
});
</script>

<style scoped>
.editar-cotizacion-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px 32px;
    font-family: 'Georgia', 'Garamond', serif;
}

.form-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid #d4a574;
}

.btn-back {
    padding: 8px 16px;
    background: #e8ddd7;
    color: #5a4037;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.btn-back:hover {
    background: #d4a574;
    color: white;
    transform: translateY(-2px);
}

.form-title {
    font-size: 2rem;
    font-weight: 700;
    color: #5a4037;
    margin: 0;
}

.form-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.form-section {
    background: white;
    border: 2px solid #e8ddd7;
    border-radius: 10px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.08);
}

.section-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: #5a4037;
    margin: 0 0 1.5rem 0;
    padding-bottom: 1rem;
    border-bottom: 2px solid #d4a574;
    line-height: 1.2;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.form-input,
.form-input-sm {
    padding: 12px 16px;
    border: 2px solid #e8ddd7;
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    transition: all 0.2s;
}

.form-input:focus,
.form-input-sm:focus {
    outline: none;
    border-color: #d4a574;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
}

.form-input-sm {
    padding: 8px 12px;
    font-size: 0.9rem;
    max-width: 100px;
}

.modulo-item {
    background: #f9f7f4;
    border: 1px solid #e8ddd7;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1rem;
}

.modulo-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    justify-content: space-between;
    flex-wrap: wrap;
}

.modulo-info {
    flex: 1;
    min-width: 200px;
}

.modulo-info h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #5a4037;
}

.modulo-codigo {
    display: block;
    font-size: 0.85rem;
    color: #999;
    font-family: 'Courier New', monospace;
    margin-top: 0.25rem;
}

.modulo-cantidad {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
}

.modulo-cantidad label {
    white-space: nowrap;
    font-weight: 600;
    color: #5a4037;
    font-size: 0.85rem;
}

.resumen-card {
    background: #f9f7f4;
    border: 1px solid #e8ddd7;
    border-radius: 8px;
    padding: 1.5rem;
}

.resumen-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid #e8ddd7;
}

.resumen-item.total {
    border-bottom: none;
    padding-top: 1rem;
    margin-top: 1rem;
    border-top: 2px solid #d4a574;
    font-weight: 700;
    font-size: 1.1rem;
}

.resumen-label {
    color: #5a4037;
}

.resumen-value {
    color: #d4a574;
    font-weight: 600;
}

.resumen-item.total .resumen-value {
    font-size: 1.2rem;
}

.form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding-top: 1.5rem;
    border-top: 2px solid #e8ddd7;
}

.btn-primary,
.btn-secondary,
.btn-cancel,
.btn-danger {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.95rem;
}

.btn-primary {
    background: #d4a574;
    color: white;
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.btn-primary:hover:not(:disabled) {
    background: #c89564;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(212, 165, 116, 0.4);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-secondary {
    background: #e8ddd7;
    color: #5a4037;
}

.btn-secondary:hover {
    background: #d4a574;
    color: white;
}

.btn-cancel {
    background: #e8ddd7;
    color: #5a4037;
}

.btn-cancel:hover {
    background: #ccc;
    color: #333;
}

.btn-danger {
    padding: 8px 12px;
    background: #ffebee;
    color: #c62828;
    font-size: 0.9rem;
}

.btn-danger:hover {
    background: #ef5350;
    color: white;
}

.empty-state {
    text-align: center;
    padding: 2rem;
    color: #999;
}

.empty-state p {
    margin: 0 0 1rem 0;
}

.alert {
    padding: 12px 16px;
    border-radius: 8px;
    margin-top: 1rem;
}

.alert-error {
    background: #ffebee;
    color: #c62828;
    border: 2px solid #ef5350;
}

.loading-state,
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 20px;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #e8ddd7;
    border-top-color: #d4a574;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 768px) {
    .editar-cotizacion-container {
        padding: 20px 16px;
    }

    .form-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }

    .modulo-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .modulo-cantidad {
        width: 100%;
    }

    .form-actions {
        flex-direction: column;
    }

    .btn-primary,
    .btn-cancel {
        width: 100%;
    }
}
</style>
