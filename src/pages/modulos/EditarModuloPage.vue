<template>
    <div class="nuevo-modulo-container">
        <!-- Botón para volver -->
        <button class="btn-back" @click="$router.push('/modulos')">← Volver</button>

        <h1 class="page-title">Editar Módulo</h1>

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

        <!-- Mensaje personalizado (warning/success/info) -->
        <transition name="slide-down">
            <div v-if="mensaje" class="custom-message" :class="`message-${tipoMensaje}`">
                <div class="message-content">
                    <span class="message-text">{{ mensaje }}</span>
                    <button @click="cerrarMensaje" class="message-close">✕</button>
                </div>
            </div>
        </transition>

        <!-- Formulario -->
        <form @submit.prevent="guardarModulo" class="form">
            <!-- Información básica -->
            <div class="form-section">
                <h2>Información del Módulo</h2>
                <div class="form-group">
                    <label>Nombre del Módulo *</label>
                    <input v-model="formData.nombre" type="text" required placeholder="Ej: Comedor Moderno">
                </div>
                <div class="form-group">
                    <label>Código del Módulo *</label>
                    <input v-model="formData.codigo" type="text" required placeholder="Ej: COM_MODERNO">
                </div>
                <div class="form-group">
                    <label>Descripción</label>
                    <textarea v-model="formData.descripcion" placeholder="Descripción detallada"></textarea>
                </div>
            </div>

            <!-- Botones -->
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" @click="$router.push('/modulos')">
                    ✕ Cancelar
                </button>
                <button type="submit" class="btn btn-primary" :disabled="cargando">
                    <span v-if="cargando">⏳ Guardando...</span>
                    <span v-else>✓ Guardar Módulo</span>
                </button>
            </div>

            <!-- Componentes del Módulo -->
            <div class="form-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2>Componentes del Módulo</h2>
                    <button type="button" class="btn btn-primary" @click="mostrarModalComponentes = true">
                        ➕ Agregar Componente
                    </button>
                </div>

                <div v-if="formData.componentes.length === 0" class="empty-message">
                    No hay componentes seleccionados
                </div>

                <div v-else class="componentes-grid">
                    <div v-for="(comp, idx) in formData.componentes" :key="idx" class="componente-item">
                        <div class="componente-body">
                            <h4>{{ comp.nombre }}</h4>
                            <p class="componente-codigo">{{ comp.codigo }}</p>
                            <div style="margin-top: 0.5rem; font-size: 0.85rem; color: #666;">
                                <p><strong>Cantidad:</strong> {{ comp.cantidad }}</p>
                            </div>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button type="button" class="btn-small btn-primary" @click="abrirModalEdicionComponente(comp, idx)" title="Editar componente">
                                ✏️
                            </button>
                            <button type="button" class="btn-small btn-danger" @click="eliminarComponente(idx)" title="Eliminar componente">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>

        <!-- Modal para seleccionar componentes -->
        <div v-if="mostrarModalComponentes" class="modal-overlay" @click.self="mostrarModalComponentes = false">
            <div class="modal-content modal-componentes">
                <div class="modal-header">
                    <h3>Seleccionar Componentes</h3>
                    <button class="modal-close" @click="mostrarModalComponentes = false">✕</button>
                </div>

                <div class="modal-body modal-componentes-body">
                    <div v-if="todosLosComponentes.length === 0" class="empty-state">
                        <p>No hay componentes disponibles</p>
                    </div>

                    <div v-else class="componentes-lista">
                        <div 
                            v-for="componente in todosLosComponentes" 
                            :key="componente.id" 
                            class="componente-item"
                            @click="!formData.componentes.some(c => c.id == componente.id) && abrirModalConfiguracion(componente)"
                            :class="{ 'componente-item-disabled': formData.componentes.some(c => c.id == componente.id) }"
                        >
                            <div class="componente-info-modal">
                                <h4>{{ componente.nombre }}</h4>
                                <p>{{ componente.codigo }}</p>
                            </div>
                            <div v-if="formData.componentes.some(c => c.id == componente.id)" class="componente-item-badge">
                                ✓ Agregado
                            </div>
                            <div v-else class="componente-item-icon">
                                ➜
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal para agregar/editar componente -->
        <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Agregar Componente</h3>
                    <button class="modal-close" @click="cerrarModal">✕</button>
                </div>

                <div class="modal-body">
                    <div class="modal-item">
                        <label class="modal-label">Componente:</label>
                        <div class="modal-value">{{ componenteActual?.nombre }}</div>
                    </div>

                    <div class="modal-item">
                        <label class="modal-label">Código:</label>
                        <div class="modal-value">{{ componenteActual?.codigo }}</div>
                    </div>

                    <div class="modal-item">
                        <label class="modal-label">Cantidad *</label>
                        <div class="horas-editor">
                            <button type="button" class="btn-horas-moins" @click="decrementarCantidad">−</button>
                            <input 
                                v-model.number="componenteActual.cantidad" 
                                type="number" 
                                min="1"
                                step="1"
                                class="input-horas"
                                @keyup.enter="guardarCantidad"
                                @blur="guardarCantidad"
                            >
                            <span class="horas-unit">unidades</span>
                            <button type="button" class="btn-horas-plus" @click="incrementarCantidad">+</button>
                        </div>
                    </div>



                </div>

            </div>
        </div>



    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getModuloById, actualizarModulo, fetchModulos } from '@/http/modulos-api';

const router = useRouter();
const route = useRoute();

// Estado del formulario
const formData = ref({
    nombre: '',
    codigo: '',
    descripcion: '',
    componentes: []
});

// Componentes originales del módulo (para detectar cuáles son nuevos)
const componentesOriginales = ref([]);

// Catálogos
const todosLosComponentes = ref([]);
const componenteSeleccionado = ref('');

// Modal
const mostrarModal = ref(false);
const mostrarModalComponentes = ref(false);
const indiceComponenteActual = ref(-1);  // Índice del componente siendo editado
const componenteActual = ref({
    id: null,
    nombre: '',
    codigo: '',
    cantidad: 1
});

// Estado de UI
const error = ref(null);
const exito = ref(null);
const mensaje = ref(null);
const tipoMensaje = ref(null);
const cargando = ref(true);
const cargandoModulo = ref(true);
const cargandoCatalogos = ref(true);
const erroresValidacion = ref({
    nombre: null,
    codigo: null
});

// Función para mostrar mensajes
const mostrarMensaje = (texto, tipo = 'info', duracion = 3000) => {
    mensaje.value = texto;
    tipoMensaje.value = tipo;
    if (duracion > 0) {
        setTimeout(() => {
            mensaje.value = null;
            tipoMensaje.value = null;
        }, duracion);
    }
};

const cerrarMensaje = () => {
    mensaje.value = null;
    tipoMensaje.value = null;
};

// Métodos de validación
const validarCampo = (campo) => {
    switch(campo) {
        case 'nombre':
            if (!formData.value.nombre.trim()) {
                erroresValidacion.value.nombre = 'El nombre es requerido';
            } else {
                erroresValidacion.value.nombre = null;
            }
            break;
        case 'codigo':
            if (!formData.value.codigo.trim()) {
                erroresValidacion.value.codigo = 'El código es requerido';
            } else {
                erroresValidacion.value.codigo = null;
            }
            break;
    }
};

const validarFormulario = () => {
    let valido = true;

    // Validar módulo
    if (!formData.value.nombre.trim()) {
        erroresValidacion.value.nombre = 'El nombre es requerido';
        valido = false;
    }
    if (!formData.value.codigo.trim()) {
        erroresValidacion.value.codigo = 'El código es requerido';
        valido = false;
    }

    // Validar componentes
    if (formData.value.componentes.length === 0) {
        error.value = 'Debe agregar al menos un componente';
        return false;
    }

    for (let componente of formData.value.componentes) {
        if (!componente.nombre.trim()) {
            error.value = 'Todos los componentes deben tener un nombre';
            return false;
        }
        if (!componente.codigo.trim()) {
            error.value = 'Todos los componentes deben tener un código';
            return false;
        }
        if (!componente.cantidad || componente.cantidad < 1) {
            error.value = 'Todos los componentes deben tener una cantidad válida';
            return false;
        }
    }

    return valido;
};

// Métodos de componentes
const agregarComponente = () => {
    formData.value.componentes.push({
        nombre: '',
        codigo: '',
        descripcion: '',
        cantidad: 1
    });
};

const eliminarComponente = async (idx) => {
    try {
        cargando.value = true;
        
        // Eliminar del array local
        formData.value.componentes.splice(idx, 1);
        
        // Guardar en la API
        const datosModulo = {
            nombre: formData.value.nombre,
            codigo: formData.value.codigo,
            descripcion: formData.value.descripcion,
            componentes: formData.value.componentes.map(comp => ({
                id: Number(comp.id),
                cantidad: comp.cantidad
            }))
        };
        
        await actualizarModulo(route.params.id, datosModulo);
        mostrarMensaje('✅ Componente eliminado', 'success', 1500);
    } catch (err) {
        console.error('❌ Error al eliminar componente:', err);
        mostrarMensaje('Error al eliminar componente', 'error', 2000);
        // Revertir si falla
        formData.value.componentes.splice(idx, 0, formData.value.componentes[idx]);
    } finally {
        cargando.value = false;
    }
};

// Abrir modal para editar componente existente
const abrirModalEdicionComponente = (componente, idx) => {
    componenteActual.value = {...componente};
    indiceComponenteActual.value = idx;
    mostrarModal.value = true;
};



const formatCurrency = (value) => {
    return parseFloat(value).toLocaleString('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

// Guardar módulo
const guardarModulo = async () => {
    error.value = null;
    exito.value = null;

    if (!validarFormulario()) {
        return;
    }

    cargando.value = true;

    try {
        // Transformar componentes para enviar al backend
        const datosModulo = {
            nombre: formData.value.nombre,
            codigo: formData.value.codigo,
            descripcion: formData.value.descripcion,
            componentes: formData.value.componentes.map(comp => ({
                id: Number(comp.id),
                cantidad: comp.cantidad
            }))
        };

        console.log('=== ACTUALIZANDO MÓDULO ===');
        console.log('Formulario completo:', formData.value);
        console.log('Componentes en formulario:', formData.value.componentes);
        console.log('Datos a enviar al backend:', datosModulo);
        console.log('Número de componentes:', datosModulo.componentes.length);
        
        const response = await actualizarModulo(route.params.id, datosModulo);
        console.log('Respuesta del update:', response);
        
        // El backend no retorna componentes en el update, así que hacemos una query adicional
        const moduloCompleto = await getModuloById(route.params.id);
        console.log('Respuesta completa del servidor (con componentes):', moduloCompleto);
        
        // Extraer el módulo de la respuesta
        let moduloGuardado = moduloCompleto.data || moduloCompleto;
        
        console.log('Módulo actualizado:', moduloGuardado);
        console.log('Propiedades disponibles:', Object.keys(moduloGuardado));
        console.log('Componentes en respuesta:', moduloGuardado.componentes);
        
        if (moduloGuardado.componentes && moduloGuardado.componentes.length > 0) {
            componentesOriginales.value = JSON.parse(JSON.stringify(formData.value.componentes));
        } else {
            console.warn('⚠️ No hay componentes en la respuesta del servidor');
        }

        exito.value = '✓ Módulo actualizado exitosamente';
        setTimeout(() => {
            router.push('/modulos');
        }, 1500);
    } catch (err) {
        console.error('Error actualizando módulo:', err);
        error.value = err.response?.data?.message || 'Error al actualizar el módulo';
    } finally {
        cargando.value = false;
    }
};

// Cargar módulo
const cargarModulo = async () => {
    try {
        cargandoModulo.value = true;
        const response = await getModuloById(route.params.id);
        const modulo = response.data;
        
        formData.value.nombre = modulo.nombre;
        formData.value.codigo = modulo.codigo;
        formData.value.descripcion = modulo.descripcion;
        formData.value.componentes = (modulo.componentes || []).map(comp => ({
            id: comp.id,
            nombre: comp.nombre,
            codigo: comp.codigo,
            descripcion: comp.descripcion,
            cantidad: comp.cantidad || 1
        }));
        
        // Guardar los componentes originales para detectar cuáles son nuevos
        componentesOriginales.value = JSON.parse(JSON.stringify(formData.value.componentes));
    } catch (err) {
        console.error('Error cargando módulo:', err);
        error.value = err.response?.data?.message || 'Error al cargar el módulo';
    } finally {
        cargandoModulo.value = false;
        actualizarEstadoCargando();
    }
};

// Cargar catálogos
const cargarCatalogos = async () => {
    try {
        cargandoCatalogos.value = true;
        
        // Cargar todos los componentes disponibles
        cargarTodosLosComponentes();
    } catch (err) {
        console.error('Error cargando catálogos:', err);
        error.value = 'No se pudieron cargar los catálogos. Intenta nuevamente.';
    } finally {
        cargandoCatalogos.value = false;
        actualizarEstadoCargando();
    }
};

// Cargar todos los componentes de todos los módulos
const cargarTodosLosComponentes = async () => {
    try {
        const response = await fetchModulos();
        const modulos = response.data || response;
        const componentesMap = new Map();
        
        modulos.forEach(modulo => {
            if (modulo.componentes) {
                modulo.componentes.forEach(comp => {
                    if (!componentesMap.has(comp.id)) {
                        componentesMap.set(comp.id, {
                            id: comp.id,
                            nombre: comp.nombre,
                            codigo: comp.codigo,
                            descripcion: comp.descripcion,
                            cantidad: 1
                        });
                    }
                });
            }
        });
        
        todosLosComponentes.value = Array.from(componentesMap.values());
    } catch (err) {
        console.error('Error cargando componentes:', err);
    }
};

// Observar cambios en el combobox de componentes
watch(componenteSeleccionado, (nuevoComponenteId) => {
    if (nuevoComponenteId) {
        const componente = todosLosComponentes.value.find(c => c.id == nuevoComponenteId);
        if (componente) {
            abrirModalConfiguracion(componente);
        }
    }
});

// Watch para guardar cantidad automáticamente cuando cambia
watch(() => componenteActual.value?.cantidad, async (nuevaCantidad, antiguaCantidad) => {
    // Solo guardar si realmente cambió y no es el cambio inicial
    if (nuevaCantidad !== antiguaCantidad && mostrarModal.value && indiceComponenteActual.value !== -1) {
        console.log('🔔 Cantidad cambió de', antiguaCantidad, 'a', nuevaCantidad);
        await guardarCambiosComponente();
    }
}, { deep: true });

// Abrir modal de configuración para agregar componente
const abrirModalConfiguracion = async (componente) => {
    try {
        cargando.value = true;
        
        // Crear el componente con valores por defecto
        const nuevoComponente = {
            id: componente.id,
            nombre: componente.nombre,
            codigo: componente.codigo,
            descripcion: componente.descripcion,
            cantidad: 1
        };
        
        // Agregar a formData inmediatamente
        formData.value.componentes.push({...nuevoComponente});
        
        // Guardar en la API
        const datosModulo = {
            nombre: formData.value.nombre,
            codigo: formData.value.codigo,
            descripcion: formData.value.descripcion,
            componentes: formData.value.componentes.map(comp => ({
                id: Number(comp.id),
                cantidad: comp.cantidad
            }))
        };
        
        await actualizarModulo(route.params.id, datosModulo);
        
        // Asignar al componenteActual para poder editar en el modal
        componenteActual.value = nuevoComponente;
        indiceComponenteActual.value = formData.value.componentes.length - 1;  // Guardar el índice correcto
        
        mostrarModal.value = true;
        mostrarModalComponentes.value = false;
        mostrarMensaje('✅ Componente agregado', 'success', 1500);
    } catch (err) {
        console.error('❌ Error al abrir configuración:', err);
        mostrarMensaje('Error al agregar componente', 'error', 2000);
        // Revertir si falla
        formData.value.componentes.pop();
    } finally {
        cargando.value = false;
    }
};

// Guardar componente (nuevo o editado) en la API
const guardarComponente = async () => {
    try {
        cargando.value = true;
        
        // Si es un componente nuevo (índice = -1), agregarlo a formData
        if (indiceComponenteActual.value === -1) {
            formData.value.componentes.push({...componenteActual.value});
        } else {
            // Si es existente, actualizar sus valores
            formData.value.componentes[indiceComponenteActual.value] = {...componenteActual.value};
        }
        
        // Guardar en la API
        const datosModulo = {
            nombre: formData.value.nombre,
            codigo: formData.value.codigo,
            descripcion: formData.value.descripcion,
            componentes: formData.value.componentes.map(comp => ({
                id: Number(comp.id),
                cantidad: comp.cantidad
            }))
        };
        
        await actualizarModulo(route.params.id, datosModulo);
        mostrarMensaje('✅ Componente guardado', 'success', 1500);
        cerrarModal();
    } catch (err) {
        console.error('❌ Error al guardar componente:', err);
        mostrarMensaje('Error al guardar componente', 'error', 2000);
        // Revertir si falla
        if (indiceComponenteActual.value === -1) {
            formData.value.componentes.pop();
        }
    } finally {
        cargando.value = false;
    }
};

// Cerrar modal
const cerrarModal = () => {
    mostrarModal.value = false;
    componenteSeleccionado.value = '';
    indiceComponenteActual.value = -1;  // Resetear el índice
    componenteActual.value = {
        id: null,
        nombre: '',
        codigo: '',
        cantidad: 1
    };
};



// Guardar cambios de cantidad en la API
const guardarCambiosComponente = async () => {
    if (!componenteActual.value) return;
    
    try {
        cargando.value = true;
        console.log('📝 Guardando cantidad:', componenteActual.value.cantidad);
        console.log('📍 Índice componente:', indiceComponenteActual.value);
        
        // Pequeño delay para asegurar que el v-model actualiza
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Usar el índice almacenado para actualizar el componente en formData
        if (indiceComponenteActual.value !== -1) {
            formData.value.componentes[indiceComponenteActual.value].cantidad = componenteActual.value.cantidad;
            console.log('✅ Componente actualizado en formData');
        } else {
            console.warn('⚠️ Índice no válido:', indiceComponenteActual.value);
        }
        
        const datosModulo = {
            nombre: formData.value.nombre,
            codigo: formData.value.codigo,
            descripcion: formData.value.descripcion,
            componentes: formData.value.componentes.map(comp => ({
                id: Number(comp.id),
                cantidad: comp.cantidad
            }))
        };
        
        console.log('📤 Enviando datos a API:', datosModulo);
        await actualizarModulo(route.params.id, datosModulo);
        console.log('✅ Guardado en API correctamente');
        mostrarMensaje('✅ Cantidad actualizada', 'success', 1500);
    } catch (err) {
        console.error('❌ Error al guardar cambios:', err);
        mostrarMensaje('Error al guardar cambios', 'error', 2000);
    } finally {
        cargando.value = false;
    }
};

// Incrementar cantidad de componente
const incrementarCantidad = async () => {
    if (!componenteActual.value) return;
    componenteActual.value.cantidad = (componenteActual.value.cantidad || 0) + 1;
    await guardarCambiosComponente();
};

// Decrementar cantidad de componente
const decrementarCantidad = async () => {
    if (!componenteActual.value || (componenteActual.value.cantidad || 0) <= 1) return;  // No bajar de 1
    componenteActual.value.cantidad = (componenteActual.value.cantidad || 0) - 1;
    await guardarCambiosComponente();
};

// Guardar cantidad cuando se cambia en el input (enter o blur)
const guardarCantidad = async () => {
    if (!componenteActual.value || componenteActual.value.cantidad < 1) {
        componenteActual.value.cantidad = 1;
    }
    await guardarCambiosComponente();
};

// Actualizar estado de carga general
const actualizarEstadoCargando = () => {
    cargando.value = cargandoModulo.value || cargandoCatalogos.value;
};

// Lifecycle
onMounted(() => {
    cargarCatalogos();
    cargarModulo();
});
</script>

<style scoped>
.nuevo-modulo-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    background: linear-gradient(135deg, #fffbf6 0%, #fffef9 100%);
    min-height: 100vh;
}

.btn-back {
    background: none;
    border: none;
    color: #d4a574;
    font-size: 1rem;
    cursor: pointer;
    margin-bottom: 1rem;
    padding: 0.5rem 1rem;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn-back:hover {
    color: #b8894a;
    transform: translateX(-4px);
}

.page-title {
    font-size: 2.2rem;
    margin: 1rem 0 2.5rem 0;
    color: #2a2a2a;
    font-weight: 700;
    letter-spacing: -0.5px;
}

.form {
    background: white;
    border: none;
    border-radius: 12px;
    padding: 2.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.3s ease;
}

.form:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.form-section {
    margin-bottom: 2.5rem;
}

.form-actions + .form-section {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 2px solid #f0e8e0;
}

.form-section h2 {
    font-size: 1.4rem;
    margin-bottom: 1.8rem;
    color: #2a2a2a;
    border-bottom: 3px solid #d4a574;
    padding-bottom: 0.8rem;
    font-weight: 600;
}

.form-group {
    margin-bottom: 1.8rem;
}

.form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.7rem;
    color: #2a2a2a;
    font-size: 0.95rem;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 0.85rem;
    border: 2px solid #d4c4b8;
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    background: #fffbf6;
    color: #000000;
    font-weight: 500;
    transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #d4a574;
    background: #fffef9;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.15);
    transform: translateY(-1px);
}

.form-group textarea {
    resize: vertical;
    min-height: 100px;
}

.form-actions {
    display: flex;
    gap: 1.2rem;
    justify-content: flex-end;
    align-items: center;
    margin-top: 2.5rem;
    margin-bottom: 0;
    padding: 2rem 0;
    border-bottom: 2px solid #f0e8e0;
}

.btn {
    padding: 0.85rem 2rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 0.9rem;
}

.btn-primary {
    background: linear-gradient(135deg, #d4a574 0%, #c49464 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #c49464 0%, #b8894a 100%);
    box-shadow: 0 6px 16px rgba(212, 165, 116, 0.4);
    transform: translateY(-2px);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-secondary {
    background: #f5f5f5;
    color: #2a2a2a;
    border: 2px solid #d4c4b8;
    font-weight: 600;
}

.btn-secondary:hover {
    background: #efefef;
    border-color: #d4a574;
    transform: translateY(-2px);
}

.btn-danger {
    background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
    color: white;
    padding: 0.6rem 1.2rem;
    font-size: 1.1rem;
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.btn-danger:hover {
    background: linear-gradient(135deg, #ff5252 0%, #ff3838 100%);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
    transform: scale(1.05);
}

.btn-small {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
}

.empty-message {
    text-align: center;
    padding: 3rem;
    color: #aaa;
    font-style: italic;
    font-size: 1.1rem;
}

.componentes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
}

.componente-item {
    border: 2px solid #d4c4b8;
    border-radius: 10px;
    padding: 1.5rem;
    background: linear-gradient(135deg, #fffbf6 0%, #fffef9 100%);
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.componente-item:hover {
    border-color: #d4a574;
    box-shadow: 0 6px 16px rgba(212, 165, 116, 0.2);
    transform: translateY(-3px);
}

.componente-body {
    flex: 1 1 100%;
}

.componente-body h4 {
    margin: 0 0 0.5rem 0;
    color: #2a2a2a;
    font-size: 1.1rem;
    font-weight: 600;
}

.componente-codigo {
    margin: 0 0 1rem 0;
    font-size: 0.85rem;
    color: #999;
    font-family: monospace;
    background: #f5f5f5;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    display: inline-block;
}

.componente-item > div:last-child {
    display: flex;
    gap: 0.6rem;
    flex-shrink: 0;
    margin-left: auto;
}

/* Modales */
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
    backdrop-filter: blur(2px);
}

.modal-content {
    background: white;
    border-radius: 14px;
    max-width: 600px;
    max-height: 80vh;
    overflow: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-header {
    padding: 2rem;
    border-bottom: 2px solid #f0e8e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #fffbf6 0%, #fffef9 100%);
    border-radius: 14px 14px 0 0;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.4rem;
    color: #2a2a2a;
    font-weight: 600;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    color: #999;
    padding: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    border-radius: 8px;
}

.modal-close:hover {
    color: #d4a574;
    background: rgba(212, 165, 116, 0.1);
}

.modal-body {
    padding: 2rem;
}

.modal-footer {
    padding: 1.5rem 2rem;
    border-top: 1px solid #e0d0c0;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.modal-item {
    margin-bottom: 1.5rem;
}

.modal-label {
    display: block;
    font-weight: 700;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: #d4a574;
}

.modal-value {
    padding: 0.75rem;
    background: #f5f5f5;
    border-radius: 4px;
    color: #666;
}

.form-input {
    width: 100%;
    padding: 0.85rem;
    border: 2px solid #d4c4b8;
    border-radius: 6px;
    font-size: 1rem;
    font-family: inherit;
    background: #fffbf6;
    color: #000000;
    font-weight: 500;
    transition: all 0.2s;
}

.form-input::placeholder {
    color: #666 !important;
    font-weight: 400;
}

.form-input:hover {
    border-color: #d4a574;
    background: #fffef9;
}

.form-input:focus {
    outline: none;
    border-color: #d4a574;
    background: #fffef9;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.15);
}

.btn-select-modal {
    width: 100%;
    padding: 0.75rem;
    text-align: left;
    background: white;
    border: 1px solid #d4c4b8;
    border-radius: 4px;
    cursor: pointer;
    color: #333;
    font-size: 1rem;
    transition: all 0.2s;
}

.btn-select-modal:hover {
    border-color: #d4a574;
}

/* Modal para componentes */
.modal-componentes {
    max-width: 500px;
}

.modal-componentes-body {
    max-height: 400px;
    overflow-y: auto;
}

.componentes-lista {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.componente-item-modal {
    padding: 1rem;
    border: 1px solid #d4c4b8;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.componente-item {
    background: #fafaf8;
}

.componente-item:hover:not(.componente-item-disabled) {
    background: #f0e8e0;
    border-color: #d4a574;
}

.componente-item-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f0f0f0;
}

.componente-info-modal h4 {
    margin: 0 0 0.25rem 0;
    color: #333;
}

.componente-info-modal p {
    margin: 0;
    font-size: 0.85rem;
    color: #999;
}

.componente-item-badge,
.componente-item-icon {
    color: #d4a574;
    font-weight: bold;
}

/* Modal selección */
.modal-seleccion {
    max-width: 500px;
}

.modal-seleccion-body {
    max-height: 400px;
    overflow-y: auto;
}

.items-lista {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.item-seleccion {
    padding: 1rem;
    border: 2px solid #d4c4b8;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.item-seleccion:hover {
    border-color: #d4a574;
    background: #f5f5f5;
}

.item-seleccionado {
    border-color: #d4a574;
    background: #fffbf6;
}

.item-info h4 {
    margin: 0 0 0.25rem 0;
    color: #333;
}

.item-codigo {
    margin: 0;
    font-size: 0.85rem;
    color: #999;
}

.item-descripcion {
    margin: 0.25rem 0;
    font-size: 0.9rem;
    color: #666;
}

.item-precio {
    margin: 0.5rem 0 0 0;
    font-size: 0.95rem;
    color: #d4a574;
}

.item-checkmark {
    color: #d4a574;
    font-size: 1.5rem;
    font-weight: bold;
}

/* Horas editor */
.item-details {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #e0d0c0;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}

.detail-row.total {
    font-weight: 600;
    color: #d4a574;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid #e0d0c0;
}

.detail-label {
    color: #666;
}

.detail-value {
    color: #333;
}

.horas-editor {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.input-horas {
    width: 60px;
    padding: 0.5rem;
    text-align: center;
    border: 2px solid #d4a574;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
}

.horas-unit {
    font-size: 0.85rem;
    color: #999;
}

.btn-horas-moins,
.btn-horas-plus {
    width: 28px;
    height: 28px;
    border: 1px solid #d4a574;
    background: white;
    color: #d4a574;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-horas-moins:hover,
.btn-horas-plus:hover {
    background: #d4a574;
    color: white;
}

/* Estado de carga */
.loading-state {
    text-align: center;
    padding: 2rem;
    color: #999;
}

/* Mensajes de error */
.error-message {
    background: #ffe0e0;
    border: 1px solid #ff9999;
    border-radius: 4px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.error-message span {
    color: #c00;
}

.error-close {
    background: none;
    border: none;
    color: #c00;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
}

.error-close:hover {
    opacity: 0.7;
}

.error-text {
    color: #c00;
    font-size: 0.85rem;
    margin-top: 0.25rem;
    display: block;
}

/* Transiciones */
.slide-down-enter-active {
    transition: all 0.3s ease;
}

.slide-down-leave-active {
    transition: all 0.2s ease;
}

.slide-down-enter-from {
    transform: translateY(-10px);
    opacity: 0;
}

.slide-down-leave-to {
    transform: translateY(-10px);
    opacity: 0;
}

.custom-message {
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.message-warning {
    background: #fff9e6;
    border: 1px solid #ffe58f;
    color: #cc8d00;
}

.message-success {
    background: #e6ffe6;
    border: 1px solid #b3ffb3;
    color: #00aa00;
}

.message-info {
    background: #e6f7ff;
    border: 1px solid #91d5ff;
    color: #0050b3;
}

.message-close {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.message-close:hover {
    opacity: 0.7;
}

.btn-small {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
}
</style>
