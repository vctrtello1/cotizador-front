<template>
    <div class="cotizaciones-container">
        <header class="page-header">
            <h1>Cotizaciones Activas</h1>
            <button class="btn-primary" @click="crearNuevaCotizacion" :disabled="creandoCotizacion">
                {{ creandoCotizacion ? '⏳ Creando...' : '➕ Nueva Cotización' }}
            </button>
        </header>
        

        <div v-if="cotizacionesMostradas.length" class="cotizaciones-grid">
            <div 
                v-for="cotizacion in cotizacionesMostradas" 
                :key="cotizacion.id" 
                class="cotizacion-card"
                @click="goToCotizacionDetallada(cotizacion.id)"
            >
                <div class="card-header">
                    <span class="cotizacion-id">#{{ cotizacion.id }}</span>
                    <span class="cotizacion-date">{{ formatDate(cotizacion.fecha) }}</span>
                </div>
                <div class="card-body">
                    <div class="client-section">
                        <h3 class="client-name">
                            {{ cotizacion.cliente?.nombre || 'Sin Cliente' }}
                        </h3>
                        <span class="estado-badge" :class="`estado-${cotizacion.estado}`">
                            {{ getEstadoLabel(cotizacion.estado) }}
                        </span>
                    </div>
                    <div class="componentes-info">
                        <span class="componentes-count">
                            {{ getComponentesCount(cotizacion) }} componente{{ getComponentesCount(cotizacion) !== 1 ? 's' : '' }}
                        </span>
                        <p class="description" v-if="getComponentesNames(cotizacion).length > 0">
                            {{ getComponentesNames(cotizacion) }}
                        </p>
                        <p class="description no-componentes" v-else>
                            Sin componentes asignados
                        </p>
                    </div>
                </div>
                <div class="card-footer">
                    <span class="label">Total:</span>
                    <span class="amount">{{ formatCurrency(calcularTotalReal(cotizacion)) }}</span>
                </div>
            </div>
        </div>
        
        <div v-else class="empty-state">
            <div class="empty-icon">📋</div>
            <p class="empty-title">No hay cotizaciones disponibles</p>
            <p class="empty-subtitle">Crea tu primera cotización haciendo clic en el botón de arriba</p>
        </div>
    </div>
</template>

<script setup>  
    import { onMounted, ref, computed } from 'vue';
    import { storeToRefs } from 'pinia';
    import { useRouter } from 'vue-router';
    import { useCotizacionesStore } from '@/stores/cotizaciones';
    import { useClientesStore } from '@/stores/clientes';
    import { useComponentesPorCotizacionStore } from '@/stores/componentes-por-cotizacion';
    import { useModulosStore } from '@/stores/modulos';
    import { useComponentesStore } from '@/stores/componentes';
    import { crearCotizacion } from '@/http/cotizaciones-api';

    const router = useRouter();
    const store = useCotizacionesStore();
    const storeClientes = useClientesStore();
    const componentesPorCotizacionStore = useComponentesPorCotizacionStore();
    const modulosStore = useModulosStore();
    const componentesStore = useComponentesStore();
    const { cotizaciones } = storeToRefs(store);
    const { fetchCotizaciones } = store;
    const creandoCotizacion = ref(false);

    // Crear ref local para evitar problemas con storeToRefs
    const cotizacionesConComponentes = ref([]);

    const goToCotizacionDetallada = (id) => {
        router.push({ name: 'CotizacionDetallada', params: { id } });
    };

    const formatDate = (fecha) => {
        if (!fecha) return '';
        const date = new Date(fecha);
        return date.toLocaleDateString('es-MX', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const formatCurrency = (value) => {
        if (typeof value !== 'number') return '$0.00';
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(value);
    };

    const calcularTotalReal = (cotizacion) => {
        if (!cotizacion.modulos || cotizacion.modulos.length === 0) {
            return cotizacion.total || 0;
        }
        
        let total = 0;
        cotizacion.modulos.forEach(modulo => {
            if (modulo.componentes && Array.isArray(modulo.componentes)) {
                modulo.componentes.forEach(comp => {
                    const precioUnitario = comp.precio_unitario || comp.costo_total || 0;
                    const cantidad = comp.cantidad || 1;
                    total += precioUnitario * cantidad;
                });
            }
        });
        
        return total > 0 ? total : (cotizacion.total || 0);
    };

    const getEstadoLabel = (estado) => {
        const estados = {
            'pendiente': 'Pendiente',
            'aprobada': 'Aprobada',
            'rechazada': 'Rechazada',
            'completada': 'Completada',
            'cancelada': 'Cancelada'
        };
        return estados[estado] || estado;
    };

    const getComponentesCount = (cotizacion) => {
        if (!cotizacion.modulos || cotizacion.modulos.length === 0) return 0;
        let count = 0;
        cotizacion.modulos.forEach(modulo => {
            if (modulo.componentes && Array.isArray(modulo.componentes)) {
                count += modulo.componentes.length;
            }
        });
        return count;
    };

    const getComponentesNames = (cotizacion) => {
        if (!cotizacion.modulos || cotizacion.modulos.length === 0) return '';
        const componentes = [];
        cotizacion.modulos.forEach(modulo => {
            if (modulo.componentes && Array.isArray(modulo.componentes)) {
                modulo.componentes.forEach(comp => {
                    if (comp.nombre) {
                        const cantidad = comp.cantidad ? ` (${comp.cantidad})` : '';
                        componentes.push(`${comp.nombre}${cantidad}`);
                    }
                });
            }
        });
        return componentes.join(', ');
    };

    // Computed para usar cotizaciones con componentes o las del store
    const cotizacionesMostradas = computed(() => {
        return cotizacionesConComponentes.value.length > 0 
            ? cotizacionesConComponentes.value 
            : cotizaciones.value;
    });

    const sincronizarComponentesDeCotizaciones = async () => {
        try {
            console.log('🔄 Sincronizando componentes de todas las cotizaciones...');
            
            await Promise.all([
                modulosStore.fetchModulos(),
                componentesStore.fetchComponentes(),
                componentesPorCotizacionStore.fetchComponentesPorCotizacion()
            ]);

            const todosComponentes = componentesPorCotizacionStore.componentesPorCotizacion;
            const todosModulos = modulosStore.modulos;
            const componentesCompletos = componentesStore.componentes;

            console.log('📊 Total cotizaciones:', cotizaciones.value.length);
            console.log('📊 Total componentes por cotización:', todosComponentes.length);

            // Crear nuevo array para forzar reactividad
            const cotizacionesActualizadas = cotizaciones.value.map(cotizacion => {
                const componentesDeCotizacion = todosComponentes.filter(
                    cpc => cpc.cotizacion_id == cotizacion.id
                );

                console.log(`📋 Cotización #${cotizacion.id}: ${componentesDeCotizacion.length} componentes`);

                if (componentesDeCotizacion.length === 0) {
                    return { ...cotizacion, modulos: [] };
                }

                const modulosMap = new Map();

                componentesDeCotizacion.forEach(compApi => {
                    const moduloId = compApi.modulo_id;
                    
                    if (!modulosMap.has(moduloId)) {
                        const moduloCompleto = todosModulos.find(m => m.id == moduloId);
                        if (moduloCompleto) {
                            modulosMap.set(moduloId, {
                                ...moduloCompleto,
                                componentes: []
                            });
                        }
                    }

                    const moduloEnMapa = modulosMap.get(moduloId);
                    if (moduloEnMapa) {
                        const componenteCompleto = componentesCompletos.find(
                            c => c.id == compApi.componente_id
                        );

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
                });

                const modulos = Array.from(modulosMap.values());
                console.log(`✅ Cotización #${cotizacion.id}: ${modulos.length} módulos reconstruidos`);
                
                return { ...cotizacion, modulos };
            });
            
            // Reasignar al ref local para forzar reactividad
            cotizacionesConComponentes.value = cotizacionesActualizadas;
            
            console.log('✅ Sincronización completada');
        } catch (error) {
            console.error('Error sincronizando componentes:', error);
        }
    };

    const crearNuevaCotizacion = async () => {
        creandoCotizacion.value = true;
        try {
            // Buscar el cliente "Público General"
            await storeClientes.fetchClientes();
            const clientePublicoGeneral = storeClientes.clientes.find(c => 
                c.nombre?.toLowerCase().includes('público') || 
                c.nombre?.toLowerCase().includes('publico') ||
                c.nombre?.toLowerCase().includes('general')
            );

            if (!clientePublicoGeneral) {
                alert('No se encontró el cliente "Público General". Por favor créalo primero.');
                router.push('/nueva-cotizacion');
                return;
            }

            // Crear cotización en blanco con Público General
            const nuevaCotizacion = {
                cliente_id: clientePublicoGeneral.id,
                fecha: new Date().toISOString().split('T')[0],
                total: 0
            };

            console.log('Creando nueva cotización:', nuevaCotizacion);
            const response = await crearCotizacion(nuevaCotizacion);
            console.log('Cotización creada:', response);

            const cotizacionId = response.id || response.data?.id;

            if (cotizacionId) {
                // Recargar cotizaciones
                await fetchCotizaciones();
                // Redirigir a editar la cotización recién creada
                router.push(`/editar-cotizacion/${cotizacionId}`);
            } else {
                throw new Error('No se recibió el ID de la cotización');
            }
        } catch (error) {
            console.error('Error creando cotización:', error);
            alert('Error al crear la cotización: ' + (error.message || 'Error desconocido'));
        } finally {
            creandoCotizacion.value = false;
        }
    };

    onMounted(async () => {
        await fetchCotizaciones();
        await sincronizarComponentesDeCotizaciones();
    });
</script>

<style scoped>
.cotizaciones-container {
    width: 100%;
    margin: 0;
    padding: 40px 32px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    min-height: 100vh;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 48px;
    background: white;
    padding: 32px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.page-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.btn-primary {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border: none;
    padding: 14px 28px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    letter-spacing: 0.5px;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(212, 165, 116, 0.3);
    font-size: 1rem;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(212, 165, 116, 0.4);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.warning-banner {
    background: white;
    color: #856404;
    padding: 16px 24px;
    border-left: 4px solid #ffc107;
    border-radius: 12px;
    margin-bottom: 32px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Grid de galería con 3 columnas */
.cotizaciones-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 24px;
    padding: 0;
}

/* Mobile - 1 columna */
@media (max-width: 767px) {
    .cotizaciones-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    .cotizaciones-container {
        padding: 24px 16px;
    }
    
    .page-header {
        flex-direction: column;
        gap: 20px;
        text-align: center;
        padding: 24px;
    }
    
    .page-header h1 {
        font-size: 2rem;
    }
    
    .btn-primary {
        width: 100%;
    }
}

/* Tablets - 2 columnas */
@media (min-width: 768px) and (max-width: 1023px) {
    .cotizaciones-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;
    }
    
    .cotizaciones-container {
        padding: 32px 24px;
    }
}

/* Laptops y Desktops - 3 columnas */
@media (min-width: 1024px) {
    .cotizaciones-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* Pantallas muy grandes - 4 columnas */
@media (min-width: 1920px) {
    .cotizaciones-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 32px;
    }
    
    .cotizaciones-container {
        padding: 56px 64px;
    }
}

.cotizacion-card {
    background: white;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
}

.cotizacion-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #d4a574, #c89564);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.cotizacion-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.cotizacion-card:hover::before {
    opacity: 1;
}

.card-header {
    padding: 20px 24px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
}

.cotizacion-id {
    font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
    font-size: 1.2rem;
    font-weight: 700;
    letter-spacing: -0.5px;
}

.cotizacion-date {
    font-size: 0.9rem;
    opacity: 0.95;
    font-weight: 500;
}

.card-body {
    padding: 24px;
    flex-grow: 1;
    background: white;
    min-height: 120px;
}

.client-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    gap: 12px;
}

.client-name {
    margin: 0;
    font-size: 1.5rem;
    color: #2c3e50;
    font-weight: 700;
    line-height: 1.3;
    flex: 1;
}

.estado-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
    flex-shrink: 0;
}

.estado-pendiente {
    background: #fff3cd;
    color: #856404;
}

.estado-aprobada {
    background: #d1ecf1;
    color: #0c5460;
}

.estado-rechazada {
    background: #f8d7da;
    color: #721c24;
}

.estado-completada {
    background: #d4edda;
    color: #155724;
}

.estado-cancelada {
    background: #e2e3e5;
    color: #383d41;
}

.componentes-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.componentes-count {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    font-weight: 700;
    color: #d4a574;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.componentes-count::before {
    content: '📦';
    font-size: 1rem;
}

.description {
    margin: 0;
    color: #6c757d;
    font-size: 0.95rem;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

.description.no-componentes {
    font-style: italic;
    color: #adb5bd;
}

.card-footer {
    padding: 20px 24px;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8f9fa;
}

.label {
    color: #6c757d;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 0.85rem;
    letter-spacing: 1px;
}

.amount {
    font-size: 1.75rem;
    font-weight: 800;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.empty-state {
    text-align: center;
    padding: 80px 40px;
    color: #6c757d;
    border: 2px dashed #dee2e6;
    border-radius: 16px;
    font-weight: 500;
    background: white;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    opacity: 0.5;
}

.empty-title {
    margin: 0 0 8px 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #495057;
}

.empty-subtitle {
    margin: 0;
    font-size: 1rem;
    color: #6c757d;
}
</style>