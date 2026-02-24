<template>
    <div v-if="cotizacion" class="cotizacion-detallada-container">
        <!-- Header con acciones -->
        <div class="page-header">
            <div class="header-content">
                <button class="btn-back" @click="$router.push('/cotizaciones')">← Volver</button>
                <div class="header-title">
                    <h1 class="page-title">Cotización #{{ cotizacion.id }}</h1>
                    <span class="estado-badge">Activa</span>
                </div>
            </div>
            <div class="header-actions">
                <button class="btn-action" @click="generarPDF" :disabled="generandoPDF" title="Generar PDF">
                    {{ generandoPDF ? '⏳' : '📝' }}
                </button>
                <button class="btn-action" title="Imprimir">🖨️</button>
                <button class="btn-action" @click="$router.push(`/editar-cotizacion/${cotizacion.id}`)" title="Editar">✏️</button>
            </div>
        </div>

        <!-- Información del cliente -->
        <div class="info-card cliente-card">
            <div class="cliente-header">
                <h2 class="section-title">📋 Información del Cliente</h2>
                <button @click="abrirSelectorClientes" class="btn-cambiar-cliente" title="Cambiar cliente">
                    ✏️ Cambiar Cliente
                </button>
            </div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Cliente:</span>
                    <span class="info-value">{{ cotizacion.cliente?.nombre || 'Sin Cliente' }}</span>
                </div>
                <div v-if="cotizacion.cliente?.nombre !== 'Publico En Geneal' && cotizacion.cliente?.empresa" class="info-item">
                    <span class="info-label">Empresa:</span>
                    <span class="info-value">{{ cotizacion.cliente?.empresa }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fecha:</span>
                    <span class="info-value">{{ new Date(cotizacion.fecha).toLocaleDateString('es-ES', {
                        year:
                            'numeric', month: 'long', day: 'numeric' }) }}</span>
                </div>
                <div v-if="cotizacion.cliente?.nombre !== 'Publico En Geneal' && cotizacion.cliente?.email" class="info-item">
                    <span class="info-label">Email:</span>
                    <span class="info-value">{{ cotizacion.cliente?.email }}</span>
                </div>
            </div>
        </div>

        <!-- Modal de Selección de Clientes -->
        <Transition name="modal">
            <div v-if="mostrarSelectorClientes" class="modal-overlay" @click.self="cerrarSelectorClientes">
                <Transition name="modal-content" appear>
                    <div class="modal-container">
                        <div class="modal-header">
                            <h3 class="modal-title">Seleccionar Cliente</h3>
                            <button @click="cerrarSelectorClientes" class="btn-close-modal">✕</button>
                        </div>
                        <div class="modal-body">
                            <div class="search-bar">
                                <input 
                                    v-model="busquedaCliente" 
                                    type="text" 
                                    placeholder="Buscar cliente..." 
                                    class="search-input"
                                />
                            </div>
                            <TransitionGroup name="list" tag="div" class="clientes-list">
                                <div 
                                    v-for="cliente in clientesFiltrados" 
                                    :key="cliente.id"
                                    @click="seleccionarCliente(cliente)"
                                    class="cliente-item"
                                    :class="{ 'selected': cotizacion.cliente?.id === cliente.id }"
                                >
                                    <div class="cliente-info">
                                        <span class="cliente-nombre-modal">{{ cliente.nombre }}</span>
                                        <span v-if="cliente.empresa" class="cliente-empresa">{{ cliente.empresa }}</span>
                                    </div>
                                    <div class="cliente-contact">
                                        <span v-if="cliente.email" class="cliente-email">{{ cliente.email }}</span>
                                        <span v-if="cliente.telefono" class="cliente-telefono">{{ cliente.telefono }}</span>
                                    </div>
                                </div>
                            </TransitionGroup>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>

        <!-- Estadísticas rápidas -->
        <div class="stats-container">
            <div class="stat-card">
                <span class="stat-icon">🔧</span>
                <span class="stat-label">Componentes</span>
                <span class="stat-value">{{ totalComponentes }}</span>
            </div>
            <div class="stat-card">
                <span class="stat-icon">💰</span>
                <span class="stat-label">Total</span>
                <span class="stat-value">${{ formatCurrency(totalCotizacion) }}</span>
            </div>
        </div>

        <!-- Componentes -->
        <Transition name="fade-slide" mode="out-in">
            <div v-if="detalles.length === 0" class="empty-state" key="empty">
                <p>No hay componentes asignados a esta cotización</p>
            </div>

            <div v-else class="modulos-section" key="content">
                <div class="modulos-header">
                    <h2 class="section-title">🧩 Componentes de la Cotización</h2>
                </div>

                <TransitionGroup name="modulo-list" tag="div">
                    <div v-for="(modulo, index) in detalles" :key="`modulo-${modulo.id}-${index}`" 
                         class="modulo-card"
                         :style="{ '--index': index }">
                        <div class="articulos-table">
                            <div class="table-header">
                                <div class="col-nombre">Componente</div>
                                <div class="col-cantidad">Cantidad</div>
                                <div class="col-precio">Precio Unit.</div>
                                <div class="col-subtotal">Subtotal</div>
                            </div>
                            <div v-for="componente in modulo.componentes" :key="`comp-${componente.id}`" class="table-row">
                                <div class="col-nombre"><strong>{{ componente.nombre }}</strong></div>
                                <div class="col-cantidad">{{ componente.cantidad }}</div>
                                <div class="col-precio" v-if="!esViewerOEditor">${{ formatCurrency(componente.precio_unitario) }}</div>
                                <div class="col-precio" v-else>—</div>
                                <div class="col-subtotal"><strong>${{ formatCurrency(calcularSubtotal(componente)) }}</strong></div>
                            </div>
                        </div>
                    </div>
                </TransitionGroup>
            </div>
        </Transition>

        <!-- Total -->
        <div class="total-card">
            <div class="total-content">
                <span class="total-label">Total de la Cotización</span>
                <span class="total-amount">${{ formatCurrency(totalCotizacion) }}</span>
            </div>
        </div>
    </div>

    <div v-else class="loading-state">
        <div class="spinner"></div>
        <p>Cargando cotización...</p>
    </div>
</template>


<script setup>
const esViewerOEditor = computed(() => {
    const authStore = useAuthStore ? useAuthStore() : null;
    const role = authStore?.user?.role || authStore?.user?.rol || 'viewer';
    return role === 'viewer' || role === 'visualizador' || role === 'editor';
});
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCotizacionesStore } from '@/stores/cotizaciones';
import { useClientesStore } from '@/stores/clientes';
import { useComponentesPorCotizacionStore } from '@/stores/componentes-por-cotizacion';
import { useModulosStore } from '@/stores/modulos';
import { useComponentesStore } from '@/stores/componentes';

const route = useRoute();
const router = useRouter();
const store = useCotizacionesStore();
const clientesStore = useClientesStore();
const storeComponentesPorCotizacion = useComponentesPorCotizacionStore();
const modulosStore = useModulosStore();
const componentesStore = useComponentesStore();
const { fecthCotizacionById, updateCotizacion } = store;
const { fetchClientes } = clientesStore;

const cotizacion = ref(null);
const generandoPDF = ref(false);
const mostrarSelectorClientes = ref(false);
const busquedaCliente = ref('');
const clientes = ref([]);

const clientesFiltrados = computed(() => {
    if (!busquedaCliente.value) return clientes.value;
    const busqueda = busquedaCliente.value.toLowerCase();
    return clientes.value.filter(cliente =>
        cliente.nombre?.toLowerCase().includes(busqueda) ||
        cliente.empresa?.toLowerCase().includes(busqueda) ||
        cliente.email?.toLowerCase().includes(busqueda)
    );
});

const detalles = computed(() => {
    return cotizacion.value?.modulos || [];
});

const totalModulosOrdenados = computed(() => {
    return detalles.value.reduce((total, modulo) => {
        return total + (Number(modulo.cantidad) || 1);
    }, 0);
});

const totalComponentes = computed(() => {
    return detalles.value.reduce((total, modulo) => {
        return total + (Array.isArray(modulo.componentes) ? modulo.componentes.length : 0);
    }, 0);
});

const totalCotizacion = computed(() => {
    const total = cotizacion.value?.total;
    if (total != null && total !== '') {
        const numTotal = Number(String(total).replace(/,/g, ''));
        if (!isNaN(numTotal)) return numTotal;
    }
    
    // Calcular desde componentes
    return detalles.value.reduce((sum, modulo) => 
        sum + (modulo.componentes?.reduce((subtotal, comp) => 
            subtotal + calcularSubtotal(comp), 0) || 0), 0
    );
});

const formatCurrency = (value) => {
    const num = Number(value);
    return (isNaN(num) || num == null) ? '0.00' : num.toLocaleString('es-MX', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
};

const calcularSubtotal = (componente) => {
    if (componente.subtotal != null && componente.subtotal !== '') {
        const subtotal = Number(componente.subtotal);
        if (!isNaN(subtotal)) return subtotal;
    }
    return (Number(componente.cantidad) || 0) * (Number(componente.precio_unitario) || 0);
};

const abrirSelectorClientes = async () => {
    mostrarSelectorClientes.value = true;
    busquedaCliente.value = '';
    if (clientes.value.length === 0) {
        clientes.value = await fetchClientes();
    }
};

const cerrarSelectorClientes = () => {
    mostrarSelectorClientes.value = false;
    busquedaCliente.value = '';
};

const seleccionarCliente = async (cliente) => {
    try {
        const cotizacionActualizada = {
            ...cotizacion.value,
            cliente_id: cliente.id,
            cliente
        };
        
        await updateCotizacion(cotizacion.value.id, cotizacionActualizada);
        cotizacion.value = cotizacionActualizada;
        cerrarSelectorClientes();
        alert('Cliente actualizado correctamente');
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        alert('Error al actualizar el cliente');
    }
};

const generarPDF = async () => {
    generandoPDF.value = true;
    try {
        const jsPDFModule = await import('jspdf');
        const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
        const doc = new jsPDF();
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let y = 20;
        
        // Título
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('COTIZACIÓN', pageWidth / 2, y, { align: 'center' });
        y += 15;
        
        // Número y fecha
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Número: #${cotizacion.value.id}`, margin, y);
        y += 8;
        doc.text(`Fecha: ${new Date(cotizacion.value.fecha).toLocaleDateString('es-ES')}`, margin, y);
        y += 15;
        
        // Información del cliente
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('CLIENTE', margin, y);
        y += 8;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const cliente = cotizacion.value.cliente;
        if (cliente) {
            doc.text(`Nombre: ${cliente.nombre}`, margin, y);
            y += 6;
            if (cliente.empresa && cliente.nombre !== 'Publico En Geneal') {
                doc.text(`Empresa: ${cliente.empresa}`, margin, y);
                y += 6;
            }
            if (cliente.email && cliente.nombre !== 'Publico En Geneal') {
                doc.text(`Email: ${cliente.email}`, margin, y);
                y += 6;
            }
            if (cliente.telefono) {
                doc.text(`Teléfono: ${cliente.telefono}`, margin, y);
                y += 6;
            }
        }
        y += 10;
        
        // Módulos
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('COMPONENTES', margin, y);
        y += 10;
        
        detalles.value.forEach((modulo, index) => {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            
            // Componentes del módulo
            if (modulo.componentes?.length > 0) {
                doc.setFontSize(9);
                modulo.componentes.forEach(comp => {
                    if (y > 270) {
                        doc.addPage();
                        y = 20;
                    }
                    doc.text(`${comp.nombre}`, margin, y);
                    y += 4;
                    doc.text(`Cantidad: ${comp.cantidad} | Precio: $${formatCurrency(comp.precio_unitario)} | Subtotal: $${formatCurrency(calcularSubtotal(comp))}`, margin + 5, y);
                    y += 6;
                });
            }
            y += 3;
        });
        
        // Total
        y += 10;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL: $${formatCurrency(totalCotizacion.value)}`, pageWidth - margin, y, { align: 'right' });
        
        doc.save(`Cotizacion_${cotizacion.value.id}.pdf`);
    } catch (err) {
        console.error('Error al generar PDF:', err);
        alert('Error al generar el PDF');
    } finally {
        generandoPDF.value = false;
    }
};

onMounted(async () => {
    const id = route.params.id;
    
    // Cargar datos necesarios en paralelo
    await Promise.all([
        modulosStore.fetchModulos(),
        componentesStore.fetchComponentes(),
        fecthCotizacionById(id).then(data => { cotizacion.value = data; })
    ]);
    
    // Sincronizar componentes
    if (cotizacion.value) {
        await sincronizarComponentes();
    }
});

const sincronizarComponentes = async () => {
    try {
        const componentesEnApi = await storeComponentesPorCotizacion.fetchComponentesPorCotizacion();
        
        // Filtrar componentes de esta cotización
        const componentesEstaCotzacion = componentesEnApi.filter(
            cpc => cpc.cotizacion_id == cotizacion.value.id
        );
        
        if (componentesEstaCotzacion.length === 0) {
            cotizacion.value.modulos = [];
            return;
        }
        
        // Agrupar componentes por modulo_id
        const modulosPorId = new Map();
        const modulos = modulosStore.modulos || [];
        const componentes = componentesStore.componentes || [];
        
        for (const compApi of componentesEstaCotzacion) {
            if (!compApi.modulo_id) continue;
            
            // Crear módulo si no existe en el Map
            if (!modulosPorId.has(compApi.modulo_id)) {
                const moduloCompleto = modulos.find(m => m.id === compApi.modulo_id);
                if (moduloCompleto) {
                    modulosPorId.set(compApi.modulo_id, {
                        ...moduloCompleto,
                        cantidad: 1,
                        componentes: []
                    });
                }
            }
            
            // Agregar componente al módulo
            const moduloEnMapa = modulosPorId.get(compApi.modulo_id);
            if (moduloEnMapa) {
                const componenteCompleto = componentes.find(c => c.id === compApi.componente_id) || compApi.componente;
                
                if (componenteCompleto) {
                    const precioUnitario = componenteCompleto.precio_unitario || componenteCompleto.costo_total || 0;
                    const cantidad = compApi.cantidad || 1;
                    
                    moduloEnMapa.componentes.push({
                        ...componenteCompleto,
                        cantidad,
                        precio_unitario: precioUnitario,
                        subtotal: cantidad * precioUnitario
                    });
                }
            }
        }
        
        cotizacion.value.modulos = Array.from(modulosPorId.values());
        
    } catch (error) {
        console.error('Error al sincronizar componentes:', error);
        cotizacion.value.modulos = [];
    }
};
</script>

<style scoped>
.cotizacion-detallada-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 40px 32px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
    min-height: 100vh;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2.5rem;
    padding: 2rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    flex-wrap: wrap;
    gap: 1.5rem;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex: 1;
    min-width: 0;
}

.header-title {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.btn-back {
    padding: 10px 20px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.btn-back:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(212, 165, 116, 0.4);
}

.page-title {
    font-size: 2.5rem;
    color: #1a202c;
    margin: 0;
    font-weight: 800;
    line-height: 1.2;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.estado-badge {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.header-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-action {
    padding: 12px 14px;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    cursor: pointer;
    font-size: 1.3rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.btn-action:hover {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    border-color: transparent;
    transform: translateY(-3px);
    box-shadow: 0 8px 16px rgba(212, 165, 116, 0.3);
}

.stats-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: white;
    border: none;
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #d4a574 0%, #c89564 100%);
}

.stat-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 28px rgba(212, 165, 116, 0.2);
}

.stat-icon {
    font-size: 2.5rem;
    display: block;
    margin-bottom: 0.75rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.stat-label {
    color: #64748b;
    font-size: 0.9rem;
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.stat-value {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 2rem;
    font-weight: 800;
    display: block;
}

.info-card {
    background: white;
    border: none;
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.cliente-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #f1f5f9;
}

.cliente-header .section-title {
    margin: 0;
    padding: 0;
    border: none;
}

.btn-cambiar-cliente {
    padding: 10px 20px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 0.9rem;
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.btn-cambiar-cliente:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(212, 165, 116, 0.4);
}

.section-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: #1a202c;
    margin: 0 0 1.5rem 0;
    padding-bottom: 1rem;
    border-bottom: 2px solid #f1f5f9;
    line-height: 1.2;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

@media (max-width: 768px) {
    .info-grid {
        grid-template-columns: 1fr;
    }
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.info-label {
    font-size: 0.85rem;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-value {
    font-size: 1.1rem;
    color: #1a202c;
    font-weight: 600;
}

.modulos-section {
    margin-bottom: 32px;
}

.modulos-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 24px 32px;
    background: white;
    border-radius: 16px;
    border-left: 4px solid #d4a574;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.modulos-header .section-title {
    margin: 0;
    flex: 1;
    font-size: 1.75rem;
    color: #1a202c;
    border: none;
    padding: 0;
}

.modulos-stats {
    display: flex;
    align-items: center;
    gap: 16px;
}

.stat-badge {
    background: linear-gradient(135deg, #C9A961 0%, #B8995C 100%);
    color: white;
    padding: 10px 18px;
    border-radius: 25px;
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 12px rgba(201, 169, 97, 0.3);
    white-space: nowrap;
}

.stat-separator {
    color: #C9A961;
    font-size: 1.5rem;
    font-weight: 300;
}

.modulos-section>.section-title {
    font-size: 1.75rem;
    color: #1a202c;
    margin: 0 0 24px 0;
    font-weight: 700;
    padding: 20px 24px;
    background: white;
    border-radius: 16px;
    border-left: 4px solid #d4a574;
    line-height: 1.2;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-state {
    background: white;
    border-radius: 16px;
    padding: 4rem 2rem;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-state p {
    color: #64748b;
    font-size: 1.1rem;
    margin: 0;
}

.modulo-card {
    background: white;
    border: none;
    border-radius: 16px;
    margin-bottom: 24px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modulo-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(212, 165, 116, 0.15);
}

.modulo-header {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    padding: 24px 32px;
}

.modulo-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    gap: 16px;
}

.modulo-nombre {
    font-size: 1.5rem;
    margin: 0;
    font-weight: 700;
    flex: 1;
}

.modulo-cantidad-badge {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: capitalize;
    white-space: nowrap;
    backdrop-filter: blur(10px);
}

.modulo-codigo {
    font-size: 0.9rem;
    opacity: 0.9;
    margin: 0;
    font-family: 'Courier New', monospace;
}

.modulo-descripcion {
    margin: 0;
    opacity: 0.95;
    line-height: 1.6;
}

.articulos-table {
    padding: 0;
    overflow-x: auto;
}

.table-header {
    display: grid;
    grid-template-columns: 2fr 0.8fr 1fr 1fr;
    gap: 16px;
    padding: 20px 24px;
    background: #f8fafc;
    color: #475569;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 1px;
    word-wrap: break-word;
}

.table-row {
    display: grid;
    grid-template-columns: 2fr 0.8fr 1fr 1fr;
    gap: 16px;
    padding: 18px 24px;
    border-bottom: 1px solid #f1f5f9;
    transition: all 0.2s ease;
    align-items: center;
    background: white;
    word-wrap: break-word;
}

.table-row:hover {
    background: #f8fafc;
    transform: translateX(4px);
}

.table-row:last-child {
    border-bottom: none;
}

.col-descripcion {
    color: #475569;
    font-size: 0.9rem;
    line-height: 1.4;
}

.col-id,
.col-nombre,
.col-codigo,
.col-cantidad,
.col-precio,
.col-subtotal,
.col-acabado,
.col-mano-obra {
    color: #334155;
}

.col-nombre {
    font-weight: 700;
    font-size: 1rem;
    color: #1a202c;
}

.col-codigo {
    font-family: 'Courier New', monospace;
    font-size: 0.85rem;
    color: #64748b;
}

.col-cantidad {
    text-align: center;
    font-weight: 600;
    color: #475569;
}

.col-precio,
.col-subtotal {
    text-align: right;
}

.col-subtotal {
    font-weight: 700;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 1.05rem;
}

@media (max-width: 1024px) {

    .table-header,
    .table-row {
        grid-template-columns: 1.5fr 0.7fr 0.9fr 0.9fr;
        gap: 12px;
        padding: 16px 20px;
    }

    .table-header {
        font-size: 0.75rem;
    }
}

@media (max-width: 768px) {
    .table-header {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        padding: 16px 16px;
    }

    .table-row {
        grid-template-columns: 1fr;
        gap: 12px;
        padding: 16px 16px;
    }

    .col-nombre {
        grid-column: 1 / -1;
        font-size: 0.95rem;
    }

    .col-cantidad,
    .col-precio,
    .col-subtotal {
        text-align: left !important;
    }
}

.total-card {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 8px 24px rgba(212, 165, 116, 0.3);
}

.total-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.total-label {
    font-size: 1.5rem;
    color: white;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.total-amount {
    font-size: 2.5rem;
    color: white;
    font-weight: 800;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.loading-state {
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
    border: 4px solid var(--cream, #F5F1E8);
    border-top-color: var(--accent-gold, #C9A961);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loading-state p {
    color: var(--wood-medium, #6B4423);
    font-size: 1.1rem;
    font-weight: 600;
}

/* Estilos del Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.modal-container {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 700px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;
}

@keyframes slideUp {
    from {
        transform: translateY(30px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 2px solid #e8ddd7;
}

.modal-title {
    font-size: 1.5rem;
    color: #2C1810;
    font-weight: 700;
    margin: 0;
}

.btn-close-modal {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    color: #999;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;
}

.btn-close-modal:hover {
    background: #f0f0f0;
    color: #333;
}

.modal-body {
    padding: 1.5rem 2rem;
    overflow-y: auto;
    flex: 1;
}

.search-bar {
    margin-bottom: 1.5rem;
}

.search-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e8ddd7;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
}

.search-input:focus {
    outline: none;
    border-color: #d4a574;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
}

.clientes-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.cliente-item {
    padding: 1rem 1.25rem;
    border: 2px solid #e8ddd7;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    background: white;
}

.cliente-item:hover {
    border-color: #d4a574;
    background: #faf8f3;
    transform: translateX(4px);
}

.cliente-item.selected {
    border-color: #d4a574;
    background: #f5f1e8;
}

.cliente-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 0.5rem;
}

.cliente-nombre-modal {
    font-size: 1.1rem;
    font-weight: 700;
    color: #2C1810;
}

.cliente-empresa {
    font-size: 0.9rem;
    color: #6B4423;
}

.cliente-contact {
    display: flex;
    gap: 1rem;
    font-size: 0.85rem;
    color: #999;
}

.cliente-email,
.cliente-telefono {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

@media (max-width: 768px) {
    .modal-container {
        width: 95%;
        max-height: 90vh;
    }

    .modal-header,
    .modal-body {
        padding: 1rem 1.5rem;
    }

    .cliente-contact {
        flex-direction: column;
        gap: 0.25rem;
    }
}

/* ============================================
   TRANSICIONES
   ============================================ */

/* Modal overlay fade */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

/* Modal content slide & scale */
.modal-content-enter-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-content-leave-active {
    transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.modal-content-enter-from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
}

.modal-content-leave-to {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
}

/* Lista de clientes en modal */
.list-move,
.list-enter-active,
.list-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from {
    opacity: 0;
    transform: translateX(-30px);
}

.list-leave-to {
    opacity: 0;
    transform: translateX(30px);
}

.list-leave-active {
    position: absolute;
    width: 100%;
}

/* Fade slide para secciones */
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

/* Módulos list con stagger */
.modulo-list-move,
.modulo-list-enter-active,
.modulo-list-leave-active {
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.modulo-list-enter-from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
}

.modulo-list-leave-to {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
}

.modulo-list-leave-active {
    position: absolute;
    width: 100%;
}

/* Animación inicial de módulos con delay */
.modulo-card {
    animation: slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) backwards;
    animation-delay: calc(var(--index) * 0.08s);
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Loading spinner animation */
@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>