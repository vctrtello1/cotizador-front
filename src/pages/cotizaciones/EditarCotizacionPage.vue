<template>
    <div class="editar-cotizacion-container">
        <div v-if="cargandoDatos" class="loading-state">
            <div class="spinner"></div>
            <p>Cargando cotización...</p>
        </div>

        <div v-else-if="cotizacion" class="cotizacion-form">
            <div class="form-header">
                <div class="header-content">
                    <button class="btn-back" @click="$router.back()">
                        <span class="back-icon">←</span>
                        <span>Volver</span>
                    </button>
                    <div class="header-title-section">
                        <h1 class="form-title">📝 Editar Cotización</h1>
                        <span class="cotizacion-badge">#{{ cotizacion.id }}</span>
                        <select 
                            v-model="cotizacion.estado" 
                            @change="cambiarEstado"
                            class="estado-selector"
                            :class="`estado-${cotizacion.estado}`"
                        >
                            <option value="activa">Activa</option>
                            <option value="completada">Completada</option>
                            <option value="cancelada">Cancelada</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="form-content">
                <!-- Información básica -->
                <div class="form-section info-section">
                    <div class="section-header-inline">
                        <h2 class="section-title">📋 Información de la Cotización</h2>
                        <span class="section-subtitle">Datos principales</span>
                    </div>
                    
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="cliente">Cliente</label>
                            <button @click="abrirSelectorClientes" class="btn-selector-cliente" type="button">
                                <span class="cliente-icon">👤</span>
                                <span class="cliente-nombre" v-if="cotizacion.cliente">
                                    {{ cotizacion.cliente.nombre }}
                                </span>
                                <span class="cliente-placeholder" v-else>
                                    Seleccionar Cliente
                                </span>
                                <span class="selector-arrow">▼</span>
                            </button>
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

                <!-- Información del Cliente -->
                <div class="form-section cliente-section">
                    <div class="section-header-inline">
                        <h2 class="section-title">👤 Datos del Cliente</h2>
                        <span class="section-subtitle">Información de contacto</span>
                    </div>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-icon">👨‍💼</span>
                            <div class="info-content">
                                <span class="info-label">Cliente</span>
                                <span class="info-value">{{ cotizacion.cliente?.nombre || 'Sin Cliente' }}</span>
                            </div>
                        </div>
                        <div v-if="cotizacion.cliente?.empresa" class="info-item">
                            <span class="info-icon">🏢</span>
                            <div class="info-content">
                                <span class="info-label">Empresa</span>
                                <span class="info-value">{{ cotizacion.cliente?.empresa }}</span>
                            </div>
                        </div>
                        <div v-if="cotizacion.cliente?.email" class="info-item">
                            <span class="info-icon">📧</span>
                            <div class="info-content">
                                <span class="info-label">Email</span>
                                <span class="info-value">{{ cotizacion.cliente?.email }}</span>
                            </div>
                        </div>
                        <div v-if="cotizacion.cliente?.telefono" class="info-item">
                            <span class="info-icon">📱</span>
                            <div class="info-content">
                                <span class="info-label">Teléfono</span>
                                <span class="info-value">{{ cotizacion.cliente?.telefono }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Componentes asignados -->
                <div class="form-section modulos-section">
                    <div class="section-header">
                        <div class="section-header-inline">
                            <h2 class="section-title">⚙️ Componentes Asignados</h2>
                            <span class="section-subtitle">{{ todosLosComponentes.length }} componente(s)</span>
                        </div>
                        <div class="header-buttons">
                            <button v-if="modulosAsignados.length > 0" @click="abrirSelectorComponentesDirecto" class="btn-add-component">
                                <span class="btn-icon">⚙️</span>
                                <span>Agregar Componente</span>
                            </button>
                            <button @click="abrirSelectorModulos" class="btn-add-module">
                                <span class="btn-icon">➕</span>
                                <span>Agregar Módulo</span>
                            </button>
                        </div>
                    </div>

                    <div v-if="todosLosComponentes.length === 0" class="empty-state">
                        <p>No hay componentes asignados a esta cotización</p>
                    </div>

                    <TransitionGroup v-else name="component-list" tag="div" class="componentes-list-flat">
                        <div v-for="comp in todosLosComponentes" :key="`comp-${comp.modulo_id}-${comp.id}`" class="component-item-card">
                            <div class="component-card-header">
                                <div class="component-badge">{{ comp.modulo_nombre }}</div>
                                <div class="component-actions-group">
                                    <button 
                                        type="button" 
                                        class="btn-editar-componente-card" 
                                        @click="abrirModalEditarComponente(comp)"
                                        title="Editar componente"
                                    >
                                        ✏️
                                    </button>
                                    <button 
                                        type="button" 
                                        class="btn-eliminar-componente-card" 
                                        @click="eliminarComponenteFlat(comp)"
                                        title="Eliminar componente"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            
                            <div class="component-card-body">
                                <div class="comp-info-card">
                                    <div class="comp-name-large">{{ comp.nombre }}</div>
                                    <div class="comp-price-large">${{ formatCurrency(comp.precio_unitario) }}</div>
                                </div>
                                
                                <div class="comp-controls-card">
                                    <div class="cantidad-control-large">
                                        <button 
                                            type="button" 
                                            class="btn-control-large minus" 
                                            @click="decrementarCantidadComponenteFlat(comp)"
                                            :disabled="comp.cantidad <= 1"
                                        >
                                            <span>−</span>
                                        </button>
                                        <input 
                                            v-model.number="comp.cantidad" 
                                            type="number" 
                                            min="1" 
                                            class="input-cantidad-large"
                                            @change="actualizarCantidadComponenteFlat(comp)"
                                        />
                                        <button 
                                            type="button" 
                                            class="btn-control-large plus" 
                                            @click="incrementarCantidadComponenteFlat(comp)"
                                        >
                                            <span>+</span>
                                        </button>
                                    </div>
                                    <div class="comp-subtotal">
                                        Subtotal: ${{ formatCurrency(comp.precio_unitario * comp.cantidad) }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TransitionGroup>
                </div>

                <!-- Selector de módulos modal -->
                <Transition name="modal">
                    <div v-if="mostrarSelectorModulos" class="modal-overlay" @click="cerrarSelectorModulos">
                    <div class="modal-content modal-modulos-mejorado" @click.stop>
                        <div class="modal-header-modulos">
                            <div class="modal-icon">🧩</div>
                            <h3>Selecciona un Módulo</h3>
                            <button class="btn-close-modulos" @click="cerrarSelectorModulos">✕</button>
                        </div>

                        <div class="modal-body-modulos">
                            <div v-if="modulosDisponibles.length === 0" class="empty-state-mejorado">
                                <div class="empty-icon">📦</div>
                                <p>No hay módulos disponibles para agregar</p>
                            </div>

                            <div v-else class="modulos-grid-selector">
                                <div 
                                    v-for="modulo in modulosDisponibles" 
                                    :key="modulo.id"
                                    class="modulo-card-selector"
                                    @click="seleccionarModulo(modulo)"
                                >
                                    <div class="modulo-card-header">
                                        <div class="modulo-icon">🏗️</div>
                                        <h4>{{ modulo.nombre }}</h4>
                                    </div>
                                    <div class="modulo-card-body">
                                        <p v-if="modulo.descripcion" class="modulo-descripcion">{{ modulo.descripcion }}</p>
                                        <div class="modulo-card-footer">
                                            <div class="modulo-price">
                                                <span class="label">Precio:</span>
                                                <span class="value">${{ formatCurrency(modulo.costo_total || calcularPrecioUnitarioModulo(modulo)) }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="modulo-card-action">
                                        <span>✓ Seleccionar</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </Transition>

                <!-- Modal para definir cantidad del módulo -->
                <Transition name="modal">
                    <div v-if="moduloSeleccionadoModal && !cargandoModuloModal" class="modal-overlay" @click="cerrarModalCantidad">
                        <div class="modal-content modal-cantidad-mejorado" @click.stop>
                            <div class="modal-header-cantidad">
                                <div class="modal-icon">📦</div>
                                <h3>¿Cuántos módulos necesitas?</h3>
                                <button class="btn-close-cantidad" @click="cerrarModalCantidad">✕</button>
                            </div>

                            <div class="modal-body-cantidad">
                                <div class="modulo-preview">
                                    <div class="preview-icon">🧩</div>
                                    <div class="preview-info">
                                        <h4>{{ moduloSeleccionadoModal.nombre }}</h4>
                                        <p v-if="moduloSeleccionadoModal.descripcion">{{ moduloSeleccionadoModal.descripcion }}</p>
                                    </div>
                                </div>

                                <div class="cantidad-section">
                                    <label class="cantidad-label">Cantidad de módulos</label>
                                    <div class="cantidad-control">
                                        <button type="button" class="btn-cantidad-control minus" @click="decrementarCantidad" :disabled="cantidadNuevaModulo <= 1">
                                            <span>−</span>
                                        </button>
                                        <div class="cantidad-display">
                                            <input 
                                                v-model.number="cantidadNuevaModulo" 
                                                type="number" 
                                                min="1"
                                                step="1"
                                                class="input-cantidad-mejorado"
                                                @keyup.enter="confirmarAgregarModulo"
                                            >
                                            <span class="cantidad-unidad">módulos</span>
                                        </div>
                                        <button type="button" class="btn-cantidad-control plus" @click="incrementarCantidad">
                                            <span>+</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="modal-footer-cantidad">
                                <button @click="cambiarModuloSeleccionado" class="btn-modal-secondary">
                                    <span>🔄</span> Cambiar Módulo
                                </button>
                                <button @click="confirmarAgregarModulo" class="btn-modal-primary">
                                    <span>✓</span> Agregar Módulo
                                </button>
                            </div>
                        </div>
                    </div>
                </Transition>

                <!-- Modal selector de clientes -->
                <Transition name="modal">
                    <div v-if="mostrarSelectorClientes" class="modal-overlay" @click="cerrarSelectorClientes">
                    <div class="modal-content modal-clientes-mejorado" @click.stop>
                        <div class="modal-header-clientes">
                            <div class="modal-icon">👥</div>
                            <h3>Selecciona un Cliente</h3>
                            <button class="btn-close-clientes" @click="cerrarSelectorClientes">✕</button>
                        </div>

                        <div class="modal-body-clientes">
                            <div v-if="clientes.length === 0" class="empty-state-mejorado">
                                <div class="empty-icon">📋</div>
                                <p>No hay clientes disponibles</p>
                            </div>

                            <div v-else class="clientes-grid-selector">
                                <div 
                                    v-for="cliente in clientes" 
                                    :key="cliente.id"
                                    class="cliente-card-selector"
                                    :class="{ 'selected': cotizacion.cliente_id === cliente.id }"
                                    @click="seleccionarCliente(cliente)"
                                >
                                    <div class="cliente-card-header">
                                        <div class="cliente-icon-large">👤</div>
                                        <div class="cliente-info">
                                            <h4>{{ cliente.nombre }}</h4>
                                            <p v-if="cliente.empresa" class="cliente-empresa">{{ cliente.empresa }}</p>
                                        </div>
                                    </div>
                                    <div class="cliente-card-body">
                                        <div v-if="cliente.email" class="cliente-detail">
                                            <span class="detail-icon">📧</span>
                                            <span class="detail-text">{{ cliente.email }}</span>
                                        </div>
                                        <div v-if="cliente.telefono" class="cliente-detail">
                                            <span class="detail-icon">📱</span>
                                            <span class="detail-text">{{ cliente.telefono }}</span>
                                        </div>
                                    </div>
                                    <div class="cliente-card-action">
                                        <span>✓ Seleccionar</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </Transition>

                <!-- Modal selector de módulos para agregar componente -->
                <Transition name="modal">
                    <div v-if="mostrarSelectorModulosParaComponentes" class="modal-overlay" @click="cerrarSelectorModulosParaComponentes">
                    <div class="modal-content modal-modulos-mejorado" @click.stop>
                        <div class="modal-header-modulos">
                            <div class="modal-icon">🏗️</div>
                            <h3>Selecciona el Módulo</h3>
                            <button class="btn-close-modulos" @click="cerrarSelectorModulosParaComponentes">✕</button>
                        </div>

                        <div class="modal-body-modulos">
                            <div v-if="modulosAsignados.length === 0" class="empty-state-mejorado">
                                <div class="empty-icon">📦</div>
                                <p>No hay módulos asignados. Agrega un módulo primero.</p>
                            </div>

                            <div v-else class="modulos-grid-selector">
                                <div 
                                    v-for="modulo in modulosAsignados" 
                                    :key="modulo.id"
                                    class="modulo-card-selector"
                                    @click="seleccionarModuloParaComponente(modulo)"
                                >
                                    <div class="modulo-card-header">
                                        <div class="modulo-icon">🏗️</div>
                                        <h4>{{ modulo.nombre }}</h4>
                                    </div>
                                    <div class="modulo-card-body">
                                        <p v-if="modulo.descripcion" class="modulo-descripcion">{{ modulo.descripcion }}</p>
                                        <div class="modulo-stats">
                                            <span class="stat-item">
                                                <span class="stat-icon">⚙️</span>
                                                <span>{{ modulo.componentes?.length || 0 }} componentes</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div class="modulo-card-action">
                                        <span>✓ Seleccionar</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </Transition>

                <!-- Selector de componentes modal -->
                <Transition name="modal">
                    <div v-if="mostrarSelectorComponentes" class="modal-overlay" @click="cerrarSelectorComponentes">
                    <div class="modal-content modal-componentes-mejorado" @click.stop>
                        <div class="modal-header-componentes">
                            <div class="modal-icon">🧩</div>
                            <h3>{{ moduloParaAgregarComponente ? `Agregar Componente a ${moduloParaAgregarComponente.nombre}` : 'Selecciona un Componente' }}</h3>
                            <button class="btn-close-componentes" @click="cerrarSelectorComponentes">✕</button>
                        </div>

                        <div class="modal-body-componentes">
                            <div class="search-box">
                                <input 
                                    v-model="busquedaComponente" 
                                    type="text" 
                                    placeholder="🔍 Buscar por nombre, código o descripción..."
                                    class="search-input"
                                    @click.stop
                                />
                            </div>

                            <div v-if="componentesFiltrados.length === 0" class="empty-state-mejorado">
                                <div class="empty-icon">📦</div>
                                <p>{{ busquedaComponente ? 'No se encontraron componentes' : 'No hay componentes disponibles para agregar' }}</p>
                            </div>

                            <div v-else class="componentes-grid-selector">
                                <div 
                                    v-for="componente in componentesFiltrados" 
                                    :key="componente.id"
                                    class="componente-card-selector"
                                    @click="seleccionarComponente(componente)"
                                >
                                    <div class="componente-card-header">
                                        <div class="componente-icon">⚙️</div>
                                        <h4>{{ componente.nombre }}</h4>
                                    </div>
                                    <div class="componente-card-body">
                                        <p v-if="componente.descripcion">{{ componente.descripcion }}</p>
                                        <div class="componente-precio">
                                            ${{ formatCurrency(componente.precio_unitario ?? componente.costo_total) }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </Transition>

                <!-- Modal de cantidad para componente -->
                <Transition name="modal">
                    <div v-if="mostrarModalCantidadComponente && componenteSeleccionado" class="modal-overlay" @click="cerrarModalCantidadComponente">
                    <div class="modal-content modal-cantidad-componente" @click.stop>
                        <div class="modal-header-cantidad">
                            <h3>⚙️ {{ componenteSeleccionado.nombre }}</h3>
                            <button class="btn-close-cantidad" @click="cerrarModalCantidadComponente">✕</button>
                        </div>

                        <div class="modal-body-cantidad">
                            <div class="cantidad-info">
                                <p v-if="moduloParaAgregarComponente"><strong>Módulo:</strong> {{ moduloParaAgregarComponente.nombre }}</p>
                                <p><strong>Precio unitario:</strong> ${{ formatCurrency(componenteSeleccionado.precio_unitario ?? componenteSeleccionado.costo_total) }}</p>
                                <p v-if="componenteSeleccionado.descripcion"><strong>Descripción:</strong> {{ componenteSeleccionado.descripcion }}</p>
                            </div>

                            <div class="cantidad-control">
                                <label>Cantidad:</label>
                                <div class="cantidad-input-group">
                                    <button type="button" @click="decrementarCantidadNuevoComponente" class="btn-cantidad">−</button>
                                    <input v-model.number="cantidadNuevoComponente" type="number" min="1" class="input-cantidad-modal" />
                                    <button type="button" @click="incrementarCantidadNuevoComponente" class="btn-cantidad">+</button>
                                </div>
                            </div>

                            <div class="subtotal-display">
                                <span class="label">Subtotal:</span>
                                <span class="value">${{ formatCurrency((componenteSeleccionado.precio_unitario ?? componenteSeleccionado.costo_total) * cantidadNuevoComponente) }}</span>
                            </div>
                        </div>

                        <div class="modal-footer-cantidad">
                            <button @click="cambiarComponenteSeleccionado" class="btn-secondary-modal">
                                ← Cambiar Componente
                            </button>
                            <button @click="confirmarAgregarComponente" class="btn-primary-modal" :disabled="!moduloParaAgregarComponente">
                                ✓ Agregar Componente
                            </button>
                        </div>
                    </div>
                </div>
                </Transition>

                <!-- Modal de edición de componente -->
                <Transition name="modal">
                    <div v-if="mostrarModalEditarComponente && componenteEditando" class="modal-overlay" @click="cerrarModalEditarComponente">
                        <div class="modal-content modal-editar-componente-grande" @click.stop>
                            <div class="modal-header-cantidad">
                                <h3>✏️ Editar Componente</h3>
                                <button class="btn-close-cantidad" @click="cerrarModalEditarComponente">✕</button>
                            </div>

                            <div class="modal-body-editar-componente">
                                <!-- Información del componente -->
                                <div class="componente-info-header">
                                    <h4 class="componente-nombre-grande">{{ componenteEditando.nombre }}</h4>
                                    <div class="componente-meta">
                                        <span class="meta-badge">📦 {{ componenteEditando.modulo_nombre }}</span>
                                        <span class="meta-price">${{ formatCurrency(componenteEditando.precio_unitario) }} / unidad</span>
                                    </div>
                                </div>

                                <!-- Tabs para navegar entre secciones -->
                                <div class="tabs-container">
                                    <button 
                                        type="button"
                                        :class="['tab-btn', { active: tabActiva === 'materiales' }]"
                                        @click="tabActiva = 'materiales'"
                                    >
                                        📋 Materiales
                                    </button>
                                    <button 
                                        type="button"
                                        :class="['tab-btn', { active: tabActiva === 'herrajes' }]"
                                        @click="tabActiva = 'herrajes'"
                                    >
                                        🔩 Herrajes
                                    </button>
                                    <button 
                                        type="button"
                                        :class="['tab-btn', { active: tabActiva === 'mano-obra' }]"
                                        @click="tabActiva = 'mano-obra'"
                                    >
                                        👷 Mano de Obra
                                    </button>
                                    <button 
                                        type="button"
                                        :class="['tab-btn', { active: tabActiva === 'acabado' }]"
                                        @click="tabActiva = 'acabado'"
                                    >
                                        🎨 Acabado
                                    </button>
                                </div>

                                <!-- Contenido de tabs -->
                                <div class="tab-content">
                                    <!-- Tab Materiales -->
                                    <div v-if="tabActiva === 'materiales'" class="tab-panel">
                                        <div class="tab-panel-header">
                                            <h5>Materiales del Componente</h5>
                                            <p class="tab-description">Visualiza los materiales asociados a este componente</p>
                                            <button class="btn-add-item" @click="agregarMaterial">
                                                <span class="btn-icon">➕</span>
                                                Agregar Material
                                            </button>
                                        </div>
                                        <div v-if="componenteEditando.materiales && componenteEditando.materiales.length > 0" class="items-list">
                                            <div v-for="mat in componenteEditando.materiales" :key="mat.id" class="item-card">
                                                <div class="item-header">
                                                    <span class="item-icon">📦</span>
                                                    <span class="item-name">{{ mat.material?.nombre || 'Sin nombre' }}</span>
                                                    <button class="btn-delete-item" @click="eliminarMaterial(mat)" title="Eliminar material">
                                                        🗑️
                                                    </button>
                                                </div>
                                                <div class="item-details">
                                                    <div class="item-detail-row">
                                                        <span class="detail-label">Cantidad:</span>
                                                        <div class="cantidad-controls">
                                                            <button class="btn-cantidad" @click="disminuirCantidadMaterial(mat)">−</button>
                                                            <span class="detail-value">{{ mat.cantidad }}</span>
                                                            <button class="btn-cantidad" @click="aumentarCantidadMaterial(mat)">+</button>
                                                        </div>
                                                    </div>
                                                    <div class="item-detail-row">
                                                        <span class="detail-label">Costo unitario:</span>
                                                        <span class="detail-value">${{ formatCurrency(mat.material?.precio_unitario || 0) }}</span>
                                                    </div>
                                                    <div class="item-detail-row subtotal">
                                                        <span class="detail-label">Subtotal:</span>
                                                        <span class="detail-value">${{ formatCurrency((mat.material?.precio_unitario || 0) * (mat.cantidad || 0)) }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-else class="empty-tab-state">
                                            <div class="empty-icon">📦</div>
                                            <p>Este componente no tiene materiales asignados</p>
                                        </div>
                                    </div>

                                    <!-- Tab Herrajes -->
                                    <div v-if="tabActiva === 'herrajes'" class="tab-panel">
                                        <div class="tab-panel-header">
                                            <h5>Herrajes del Componente</h5>
                                            <p class="tab-description">Visualiza los herrajes asociados a este componente</p>
                                            <button class="btn-add-item" @click="agregarHerraje">
                                                <span class="btn-icon">➕</span>
                                                Agregar Herraje
                                            </button>
                                        </div>
                                        <div v-if="componenteEditando.herrajes && componenteEditando.herrajes.length > 0" class="items-list">
                                            <div v-for="her in componenteEditando.herrajes" :key="her.id" class="item-card">
                                                <div class="item-header">
                                                    <span class="item-icon">🔩</span>
                                                    <span class="item-name">{{ her.herraje?.nombre || 'Sin nombre' }}</span>
                                                    <button class="btn-delete-item" @click="eliminarHerraje(her)" title="Eliminar herraje">
                                                        🗑️
                                                    </button>
                                                </div>
                                                <div class="item-details">
                                                    <div class="item-detail-row">
                                                        <span class="detail-label">Cantidad:</span>
                                                        <div class="cantidad-controls">
                                                            <button class="btn-cantidad" @click="disminuirCantidadHerraje(her)">−</button>
                                                            <span class="detail-value">{{ her.cantidad }}</span>
                                                            <button class="btn-cantidad" @click="aumentarCantidadHerraje(her)">+</button>
                                                        </div>
                                                    </div>
                                                    <div class="item-detail-row">
                                                        <span class="detail-label">Costo unitario:</span>
                                                        <span class="detail-value">${{ formatCurrency(her.herraje?.costo_unitario || 0) }}</span>
                                                    </div>
                                                    <div class="item-detail-row subtotal">
                                                        <span class="detail-label">Subtotal:</span>
                                                        <span class="detail-value">${{ formatCurrency((her.herraje?.costo_unitario || 0) * (her.cantidad || 0)) }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-else class="empty-tab-state">
                                            <div class="empty-icon">🔩</div>
                                            <p>Este componente no tiene herrajes asignados</p>
                                        </div>
                                    </div>

                                    <!-- Tab Mano de Obra -->
                                    <div v-if="tabActiva === 'mano-obra'" class="tab-panel">
                                        <div class="tab-panel-header">
                                            <h5>Mano de Obra del Componente</h5>
                                            <p class="tab-description">Visualiza la mano de obra asociada a este componente</p>
                                            <button v-if="!componenteEditando.mano_de_obra" class="btn-add-item" @click="agregarManoDeObra">
                                                <span class="btn-icon">➕</span>
                                                Seleccionar Mano de Obra
                                            </button>
                                            <button v-else class="btn-add-item" @click="cambiarManoDeObra" style="background: linear-gradient(135deg, #FF8C00 0%, #FF6B00 100%);">
                                                <span class="btn-icon">🔄</span>
                                                Cambiar Mano de Obra
                                            </button>
                                        </div>
                                        <div v-if="componenteEditando.mano_de_obra" class="items-list">
                                            <div class="item-card">
                                                <div class="item-header">
                                                    <span class="item-icon">👷</span>
                                                    <span class="item-name">{{ componenteEditando.mano_de_obra.nombre || 'Sin nombre' }}</span>
                                                    <button class="btn-delete-item" @click="eliminarManoDeObra" title="Eliminar mano de obra">
                                                        🗑️
                                                    </button>
                                                </div>
                                                <div class="item-details">
                                                    <div v-if="componenteEditando.mano_de_obra.descripcion" class="item-detail-row">
                                                        <span class="detail-label">Descripción:</span>
                                                        <span class="detail-value">{{ componenteEditando.mano_de_obra.descripcion }}</span>
                                                    </div>
                                                    <div class="item-detail-row">
                                                        <span class="detail-label">Costo por hora:</span>
                                                        <span class="detail-value">${{ formatCurrency(componenteEditando.mano_de_obra.costo_hora || 0) }}</span>
                                                    </div>
                                                    <div class="item-detail-row">
                                                        <span class="detail-label">Horas:</span>
                                                        <div class="cantidad-controls">
                                                            <button class="btn-cantidad" @click="disminuirHorasManoDeObra">−</button>
                                                            <span class="detail-value">{{ componenteEditando.horas_mano_obra || 1 }}</span>
                                                            <button class="btn-cantidad" @click="aumentarHorasManoDeObra">+</button>
                                                        </div>
                                                    </div>
                                                    <div class="item-detail-row subtotal">
                                                        <span class="detail-label">Costo total:</span>
                                                        <span class="detail-value">${{ formatCurrency((componenteEditando.mano_de_obra.costo_hora || 0) * (componenteEditando.horas_mano_obra || 1)) }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-else class="empty-tab-state">
                                            <div class="empty-icon">👷</div>
                                            <p>Este componente no tiene mano de obra asignada</p>
                                        </div>
                                    </div>

                                    <!-- Tab Acabado -->
                                    <div v-if="tabActiva === 'acabado'" class="tab-panel">
                                        <div class="tab-panel-header">
                                            <h5>Acabado del Componente</h5>
                                            <p class="tab-description">Visualiza el acabado asociado a este componente</p>
                                            <button v-if="!componenteEditando.acabado" class="btn-add-item" @click="agregarAcabado">
                                                <span class="btn-icon">➕</span>
                                                Seleccionar Acabado
                                            </button>
                                            <button v-else class="btn-add-item" @click="cambiarAcabado" style="background: linear-gradient(135deg, #8B5A3C 0%, #6B4423 100%);">
                                                <span class="btn-icon">🔄</span>
                                                Cambiar Acabado
                                            </button>
                                        </div>
                                        <div v-if="componenteEditando.acabado" class="items-list">
                                            <div class="item-card">
                                                <div class="item-header">
                                                    <span class="item-icon">🎨</span>
                                                    <span class="item-name">{{ componenteEditando.acabado.nombre || 'Sin nombre' }}</span>
                                                    <button class="btn-delete-item" @click="eliminarAcabado" title="Eliminar acabado">
                                                        🗑️
                                                    </button>
                                                </div>
                                                <div class="item-details">
                                                    <div v-if="componenteEditando.acabado.descripcion" class="item-detail-row">
                                                        <span class="detail-label">Descripción:</span>
                                                        <span class="detail-value">{{ componenteEditando.acabado.descripcion }}</span>
                                                    </div>
                                                    <div class="item-detail-row subtotal">
                                                        <span class="detail-label">Costo:</span>
                                                        <span class="detail-value">${{ formatCurrency(componenteEditando.acabado.costo || 0) }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-else class="empty-tab-state">
                                            <div class="empty-icon">🎨</div>
                                            <p>Este componente no tiene acabado asignado</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>

                <!-- Modal para agregar material -->
                <Transition name="modal">
                    <div v-if="mostrarModalAgregarMaterial" class="modal-overlay" @click="cerrarModalAgregarMaterial">
                        <div class="modal-content modal-selector" @click.stop>
                            <div class="modal-header">
                                <h3>📦 Seleccionar Material</h3>
                                <button class="btn-close" @click="cerrarModalAgregarMaterial">✕</button>
                            </div>

                            <div class="modal-body">
                                <!-- Buscador -->
                                <div class="search-box">
                                    <input
                                        v-model="busquedaMaterial"
                                        type="text"
                                        placeholder="🔍 Buscar material por nombre..."
                                        class="search-input"
                                    />
                                </div>

                                <!-- Lista de materiales -->
                                <div class="selector-list">
                                    <div
                                        v-for="material in materialesFiltrados"
                                        :key="material.id"
                                        class="selector-item"
                                        @click="seleccionarYAgregarMaterial(material)"
                                    >
                                        <div class="selector-item-content">
                                            <span class="selector-icon">📦</span>
                                            <div class="selector-info">
                                                <span class="selector-name">{{ material.nombre }}</span>
                                                <span class="selector-description">{{ material.descripcion || 'Sin descripción' }}</span>
                                                <span class="selector-price">${{ formatCurrency(material.precio_unitario || 0) }} / unidad</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="materialesFiltrados.length === 0" class="empty-selector">
                                        <p>No se encontraron materiales</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>

                <!-- Modal para agregar herraje -->
                <Transition name="modal">
                    <div v-if="mostrarModalAgregarHerraje" class="modal-overlay" @click="cerrarModalAgregarHerraje">
                        <div class="modal-content modal-selector" @click.stop>
                            <div class="modal-header">
                                <h3>🔩 Seleccionar Herraje</h3>
                                <button class="btn-close" @click="cerrarModalAgregarHerraje">✕</button>
                            </div>
                            <div class="modal-body">
                                <div class="search-box">
                                    <input v-model="busquedaHerraje" type="text" placeholder="🔍 Buscar herraje..." class="search-input" />
                                </div>
                                <div class="selector-list">
                                    <div v-for="herraje in herrajesFiltrados" :key="herraje.id" class="selector-item" @click="seleccionarYAgregarHerraje(herraje)">
                                        <div class="selector-item-content">
                                            <span class="selector-icon">🔩</span>
                                            <div class="selector-info">
                                                <span class="selector-name">{{ herraje.nombre }}</span>
                                                <span class="selector-description">{{ herraje.descripcion || 'Sin descripción' }}</span>
                                                <span class="selector-price">${{ formatCurrency(herraje.costo_unitario || 0) }} / unidad</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="herrajesFiltrados.length === 0" class="empty-selector">
                                        <p>No se encontraron herrajes</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>

                <!-- Modal para agregar mano de obra -->
                <Transition name="modal">
                    <div v-if="mostrarModalAgregarManoObra" class="modal-overlay" @click="cerrarModalAgregarManoObra">
                        <div class="modal-content modal-selector" @click.stop>
                            <div class="modal-header">
                                <h3>👷 Seleccionar Mano de Obra</h3>
                                <button class="btn-close" @click="cerrarModalAgregarManoObra">✕</button>
                            </div>
                            <div class="modal-body">
                                <div class="search-box">
                                    <input v-model="busquedaManoObra" type="text" placeholder="🔍 Buscar mano de obra..." class="search-input" />
                                </div>
                                <div class="selector-list">
                                    <div v-for="mano in manoDeObraFiltrada" :key="mano.id" class="selector-item" @click="seleccionarYAgregarManoObra(mano)">
                                        <div class="selector-item-content">
                                            <span class="selector-icon">👷</span>
                                            <div class="selector-info">
                                                <span class="selector-name">{{ mano.nombre }}</span>
                                                <span class="selector-description">{{ mano.descripcion || 'Sin descripción' }}</span>
                                                <span class="selector-price">${{ formatCurrency(mano.costo_hora || 0) }} / hora</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="manoDeObraFiltrada.length === 0" class="empty-selector">
                                        <p>No se encontró mano de obra</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>

                <!-- Modal para seleccionar acabado -->
                <Transition name="modal">
                    <div v-if="mostrarModalSeleccionarAcabado" class="modal-overlay" @click="cerrarModalSeleccionarAcabado">
                        <div class="modal-content modal-selector" @click.stop>
                            <div class="modal-header">
                                <h3>🎨 Seleccionar Acabado</h3>
                                <button class="btn-close" @click="cerrarModalSeleccionarAcabado">✕</button>
                            </div>
                            <div class="modal-body">
                                <div class="search-box">
                                    <input v-model="busquedaAcabado" type="text" placeholder="🔍 Buscar acabado..." class="search-input" />
                                </div>
                                <div class="selector-list">
                                    <div v-for="acabado in acabadosFiltrados" :key="acabado.id" class="selector-item" @click="seleccionarAcabado(acabado)">
                                        <div class="selector-item-content">
                                            <span class="selector-icon">🎨</span>
                                            <div class="selector-info">
                                                <span class="selector-name">{{ acabado.nombre }}</span>
                                                <span class="selector-description">{{ acabado.descripcion || 'Sin descripción' }}</span>
                                                <span class="selector-price">${{ formatCurrency(acabado.costo || 0) }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="acabadosFiltrados.length === 0" class="empty-selector">
                                        <p>No se encontraron acabados</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>

                <!-- Resumen de totales -->
                <div class="form-section resumen-section">
                    <h2 class="section-title">💰 Resumen Financiero</h2>
                    <div class="resumen-card">
                        <div class="resumen-grid">
                            <div class="resumen-item">
                                <span class="resumen-icon">📊</span>
                                <div class="resumen-content">
                                    <span class="resumen-label">Subtotal</span>
                                    <span class="resumen-value">${{ formatCurrency(totalCotizacion) }}</span>
                                </div>
                            </div>
                            <div class="resumen-item total">
                                <span class="resumen-icon">💵</span>
                                <div class="resumen-content">
                                    <span class="resumen-label">Total a Pagar</span>
                                    <span class="resumen-value">${{ formatCurrency(totalCotizacion) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Botones de acción -->
                <div class="form-actions">
                    <button @click="$router.back()" class="btn-cancel">
                        <span class="btn-icon">✕</span>
                        <span>Cancelar</span>
                    </button>
                    <button @click="generarPDF" class="btn-secondary" :disabled="generandoPDF">
                        <span class="btn-icon">{{ generandoPDF ? '⏳' : '📝' }}</span>
                        <span>{{ generandoPDF ? 'Generando PDF...' : 'Generar PDF' }}</span>
                    </button>
                </div>

                <!-- Mensaje de éxito -->
                <div v-if="success" class="alert alert-success">
                    {{ success }}
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
import { getCotizacionById, actualizarCotizacion, sincronizarModulos, actualizarEstadoCotizacion } from '../../http/cotizaciones-api';
import { fetchClientes } from '../../http/clientes-api';
import { fetchModulos, getModuloById } from '../../http/modulos-api';
import { fetchComponentes } from '../../http/componentes-api';
import { useComponentesPorCotizacionStore } from '@/stores/componentes-por-cotizacion';
import { fetchMateriales } from '../../http/materiales-api';
import { crearMaterialPorComponente, actualizarMaterialPorComponente, eliminarMaterialPorComponente } from '../../http/materiales_por_componente-api';
import { fetchHerrajes } from '../../http/herrajes-api';
import { crearCantidadPorHerraje, actualizarCantidadPorHerraje, eliminarCantidadPorHerraje } from '../../http/cantidad_por_herraje-api';
import { fetchClientes as fetchManoDeObra } from '../../http/mano_de_obra-api ';
import { crearHoras, actualizarHoras, eliminarHoras } from '../../http/horas_por_mano_de_obra_por_componente-api';
import { fetchAcabados } from '../../http/acabado-api ';

const route = useRoute();
const router = useRouter();
const storeComponentesPorCotizacion = useComponentesPorCotizacionStore();

const cotizacion = ref(null);
const clientes = ref([]);
const modulos = ref([]);
const componentes = ref([]);
const cargandoDatos = ref(true);
const guardando = ref(false);
const generandoPDF = ref(false);
const error = ref(null);
const success = ref(null);
const mostrarSelectorModulos = ref(false);
const moduloSeleccionadoModal = ref(null);
const cantidadNuevaModulo = ref(1);
const cargandoModuloModal = ref(false);
const mostrarSelectorClientes = ref(false);
const mostrarSelectorComponentes = ref(false);
const mostrarSelectorModulosParaComponentes = ref(false);
const moduloParaAgregarComponente = ref(null);
const moduloIdSeleccionado = ref(null);
const componenteSeleccionado = ref(null);
const cantidadNuevoComponente = ref(1);
const busquedaComponente = ref('');
const mostrarModalCantidadComponente = ref(false);
const mostrarModalEditarComponente = ref(false);
const componenteEditando = ref(null);
const cantidadEdicion = ref(1);
const tabActiva = ref('materiales');
const mostrarModalAgregarMaterial = ref(false);
const materialSeleccionado = ref(null);
const cantidadMaterial = ref(1);
const busquedaMaterial = ref('');
const materialesDisponibles = ref([]);
const mostrarModalAgregarHerraje = ref(false);
const busquedaHerraje = ref('');
const herrajesDisponibles = ref([]);
const mostrarModalAgregarManoObra = ref(false);
const busquedaManoObra = ref('');
const manoDeObraDisponible = ref([]);
const mostrarModalSeleccionarAcabado = ref(false);
const busquedaAcabado = ref('');
const acabadosDisponibles = ref([]);

const modulosAsignados = computed(() => {
    // Los módulos están en cotizacion.modulos
    return cotizacion.value?.modulos || [];
});

const modulosDisponibles = computed(() => {
    const idsAsignados = modulosAsignados.value.map(m => m.id);
    return modulos.value.filter(m => !idsAsignados.includes(m.id));
});

const componentesDisponiblesParaModulo = computed(() => {
    if (!moduloParaAgregarComponente.value) return [];
    
    // Obtener los IDs de componentes ya agregados a este módulo
    const idsYaAgregados = (moduloParaAgregarComponente.value.componentes || []).map(c => c.id);
    
    // Filtrar componentes que no están en este módulo
    return componentes.value.filter(c => !idsYaAgregados.includes(c.id));
});

const todosComponentesDisponibles = computed(() => {
    // Retornar TODOS los componentes sin filtrar
    return componentes.value;
});

const componentesFiltrados = computed(() => {
    const lista = moduloParaAgregarComponente.value ? componentesDisponiblesParaModulo.value : todosComponentesDisponibles.value;
    
    if (!busquedaComponente.value) {
        return lista;
    }
    
    const termino = busquedaComponente.value.toLowerCase();
    return lista.filter(c => 
        c.nombre.toLowerCase().includes(termino) ||
        c.codigo?.toLowerCase().includes(termino) ||
        c.descripcion?.toLowerCase().includes(termino)
    );
});

const todosLosComponentes = computed(() => {
    const componentes = [];
    
    console.log('🔄 Recalculando todosLosComponentes...');
    console.log('📊 Módulos en cotización:', cotizacion.value?.modulos?.length || 0);
    
    if (cotizacion.value?.modulos && Array.isArray(cotizacion.value.modulos)) {
        cotizacion.value.modulos.forEach((modulo, moduloIndex) => {
            console.log(`📦 Módulo ${modulo.nombre}: ${modulo.componentes?.length || 0} componentes`);
            if (modulo.componentes && Array.isArray(modulo.componentes)) {
                for (const comp of modulo.componentes) {
                    componentes.push({
                        ...comp,
                        // Normalizar precio_unitario: usar costo_total si precio_unitario no existe
                        precio_unitario: comp.precio_unitario ?? comp.costo_total ?? comp.componente?.costo_total ?? 0,
                        modulo_id: modulo.id,
                        modulo_nombre: modulo.nombre,
                        modulo_index: moduloIndex
                    });
                }
            }
        });
    }
    
    console.log('✅ Total componentes en lista plana:', componentes.length);
    return componentes;
});

const detalles = computed(() => {
    return cotizacion.value?.detalles || [];
});

const totalCotizacion = computed(() => {
    // Sumar todos los subtotales de los módulos
    return modulosAsignados.value.reduce((sum, modulo) => {
        return sum + calcularSubtotalModulo(modulo);
    }, 0);
});

const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '0.00';
    const cleaned = typeof value === 'string'
        ? value.replace(/[^\d.-]/g, '')
        : value;
    const num = Number(cleaned);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('es-MX', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
};

const normalizarCostoTotal = (modulo) => {
    if (!modulo) return 0;
    const raw =
        modulo.costo_total ??
        modulo.costoTotal ??
        modulo.precio_total ??
        modulo.precio ??
        null;
    if (raw === null || raw === undefined || raw === '') return 0;
    const cleaned = typeof raw === 'string'
        ? raw.replace(/[^\d.-]/g, '')
        : raw;
    const num = Number(cleaned);
    if (isNaN(num)) return 0;
    return num;
};

const calcularSubtotal = (componente) => {
    if (componente.subtotal !== null && componente.subtotal !== undefined && componente.subtotal !== '') {
        const subtotal = Number(componente.subtotal);
        if (!isNaN(subtotal)) return subtotal;
    }
    return (Number(componente.cantidad) || 0) * (Number(componente.precio_unitario) || 0);
};

const calcularPrecioUnitarioModulo = (modulo) => {
    // Sumar el subtotal de todos los componentes del módulo (precio × cantidad)
    if (!modulo.componentes || !Array.isArray(modulo.componentes)) return 0;
    return modulo.componentes.reduce((sum, comp) => {
        // Usar precio_unitario, o costo_total si no existe
        const precio = Number(comp.precio_unitario ?? comp.costo_total ?? comp.componente?.costo_total) || 0;
        const cantidad = Number(comp.cantidad) || 1;
        return sum + (precio * cantidad);
    }, 0);
};

const calcularSubtotalModulo = (modulo) => {
    // Siempre calcular desde componentes actuales para reflejar cambios
    if (modulo.componentes && Array.isArray(modulo.componentes)) {
        if (modulo.componentes.length > 0) {
            return calcularPrecioUnitarioModulo(modulo);
        }
        // Si el array existe pero está vacío, el subtotal es 0
        return 0;
    }
    
    // Fallback: usar costo_total del API solo si no existe el array de componentes
    if (modulo.costo_total) {
        const cantidad = Number(modulo.cantidad) || 1;
        return Number(modulo.costo_total) * cantidad;
    }
    
    return 0;
};

const actualizarTotales = () => {
    // Fuerza actualización del computed totalCotizacion
};

const actualizarCantidadComponente = async (componente, modulo) => {
    try {
        console.log(`🔵 Actualizando "${componente.nombre}" - Nueva cantidad: ${componente.cantidad}`);
        
        try {
            const todosComponentes = await storeComponentesPorCotizacion.fetchComponentesPorCotizacion();
            
            const registroExistente = todosComponentes.find(cpc => 
                cpc.cotizacion_id == cotizacion.value.id && cpc.componente_id == componente.id
            );
            
            if (registroExistente) {
                // Actualizar el registro existente
                await storeComponentesPorCotizacion.actualizarComponentePorCotizacion(registroExistente.id, {
                    cotizacion_id: cotizacion.value.id,
                    componente_id: componente.id,
                    modulo_id: modulo.id,
                    cantidad: componente.cantidad
                });
                console.log(`✅ "${componente.nombre}" actualizado a cantidad ${componente.cantidad} en la API`);
            } else {
                // Crear nuevo registro
                await storeComponentesPorCotizacion.crearComponentePorCotizacion({
                    cotizacion_id: cotizacion.value.id,
                    componente_id: componente.id,
                    modulo_id: modulo.id,
                    cantidad: componente.cantidad
                });
                console.log(`✅ "${componente.nombre}" creado en la API con cantidad ${componente.cantidad}`);
            }
            
            success.value = `"${componente.nombre}" actualizado`;
            setTimeout(() => { success.value = null; }, 2000);
        } catch (apiErr) {
            console.error(`❌ Error al guardar "${componente.nombre}":`, apiErr.response?.data || apiErr.message);
            throw apiErr;
        }
    } catch (err) {
        console.error('❌ Error:', err);
        error.value = 'Error al actualizar: ' + (err.response?.data?.message || err.message);
        setTimeout(() => { error.value = null; }, 5000);
    }
};

const incrementarCantidadComponente = async (componente, modulo) => {
    componente.cantidad = (componente.cantidad || 1) + 1;
    await actualizarCantidadComponente(componente, modulo);
};

const decrementarCantidadComponente = async (componente, modulo) => {
    if (componente.cantidad > 1) {
        componente.cantidad--;
        await actualizarCantidadComponente(componente, modulo);
    }
};

const eliminarComponente = async (componente, modulo, compIndex) => {
    try {
        console.log('🔴 Eliminando componente:', componente.nombre);
        
        // Guardar el componente para poder revertir si falla
        const componenteEliminado = { ...componente };
        
        // Eliminar del array local primero
        modulo.componentes.splice(compIndex, 1);
        console.log('🗑️ Componente eliminado localmente');
        
        // Si el módulo quedó sin componentes, eliminarlo también
        if (modulo.componentes.length === 0) {
            const moduloIndex = cotizacion.value.modulos.findIndex(m => m.id === modulo.id);
            if (moduloIndex !== -1) {
                cotizacion.value.modulos.splice(moduloIndex, 1);
                console.log('🗑️ Módulo eliminado porque quedó sin componentes');
            }
        }
        
        // Forzar reactividad para actualizar el total
        cotizacion.value.modulos = [...cotizacion.value.modulos];
        
        // Intentar eliminar de la API
        try {
            const todosComponentes = await storeComponentesPorCotizacion.fetchComponentesPorCotizacion();
            console.log('📋 Todos los componentes obtenidos:', todosComponentes);
            
            // Buscar el registro que corresponde a este componente en esta cotización
            const registroAEliminar = todosComponentes.find(cpc => 
                cpc.cotizacion_id === cotizacion.value.id && 
                cpc.componente_id === componenteEliminado.id
            );
            
            if (registroAEliminar) {
                console.log('🎯 Registro encontrado para eliminar:', registroAEliminar);
                await storeComponentesPorCotizacion.eliminarComponentePorCotizacion(registroAEliminar.id);
                console.log('✅ Componente eliminado de componentes_por_cotizacion API');
                
                success.value = `"${componenteEliminado.nombre}" eliminado`;
                setTimeout(() => { success.value = null; }, 3000);
            } else {
                console.warn('⚠️ No se encontró el registro en componentes_por_cotizacion');
                success.value = 'Componente eliminado localmente';
                setTimeout(() => { success.value = null; }, 3000);
            }
        } catch (apiErr) {
            console.error('❌ Error al eliminar de la API:', apiErr);
            console.error('❌ Detalles:', apiErr.response?.data || apiErr.message);
            
            // Deshacer cambio local si la API falla
            modulo.componentes.splice(compIndex, 0, componenteEliminado);
            console.log('🔄 Cambio revertido localmente');
            
            error.value = 'No se pudo eliminar: ' + (apiErr.response?.data?.message || apiErr.message);
            setTimeout(() => { error.value = null; }, 5000);
        }
    } catch (err) {
        console.error('❌ Error al eliminar componente:', err);
        error.value = 'Error al eliminar el componente';
    }
};

const actualizarCantidadComponenteFlat = async (comp) => {
    const modulo = cotizacion.value.modulos[comp.modulo_index];
    if (modulo) {
        const componente = modulo.componentes.find(c => c.id === comp.id);
        if (componente) {
            // Sincronizar la cantidad del componente en el módulo con la del comp plano
            componente.cantidad = comp.cantidad;
            await actualizarCantidadComponente(componente, modulo);
            // Forzar reactividad para actualizar el subtotal
            cotizacion.value.modulos = [...cotizacion.value.modulos];
        }
    }
};

const incrementarCantidadComponenteFlat = async (comp) => {
    const modulo = cotizacion.value.modulos[comp.modulo_index];
    if (modulo) {
        const componente = modulo.componentes.find(c => c.id === comp.id);
        if (componente) {
            componente.cantidad = (componente.cantidad || 1) + 1;
            await actualizarCantidadComponente(componente, modulo);
            // Forzar reactividad para actualizar el subtotal
            cotizacion.value.modulos = [...cotizacion.value.modulos];
        }
    }
};

const decrementarCantidadComponenteFlat = async (comp) => {
    const modulo = cotizacion.value.modulos[comp.modulo_index];
    if (modulo) {
        const componente = modulo.componentes.find(c => c.id === comp.id);
        if (componente && componente.cantidad > 1) {
            componente.cantidad--;
            await actualizarCantidadComponente(componente, modulo);
            // Forzar reactividad para actualizar el subtotal
            cotizacion.value.modulos = [...cotizacion.value.modulos];
        }
    }
};

const eliminarComponenteFlat = async (comp) => {
    const modulo = cotizacion.value.modulos[comp.modulo_index];
    if (modulo) {
        const compIndex = modulo.componentes.findIndex(c => c.id === comp.id);
        if (compIndex !== -1) {
            const componente = modulo.componentes[compIndex];
            await eliminarComponente(componente, modulo, compIndex);
        }
    }
};

const enriquecerModulosConCostoTotal = async (modulosList) => {
    // Obtener costo_total del API para cada módulo
    if (!modulosList || !Array.isArray(modulosList)) return modulosList;
    
    const modulosEnriquecidos = await Promise.all(
        modulosList.map(async (moduloCotizacion) => {
            if (moduloCotizacion.costo_total) {
                return moduloCotizacion; // Ya tiene costo_total
            }
            
            try {
                const response = await getModuloById(moduloCotizacion.id);
                const moduloCompleto = response?.data || response;
                
                if (moduloCompleto && moduloCompleto.costo_total) {
                    return {
                        ...moduloCotizacion,
                        costo_total: moduloCompleto.costo_total
                    };
                }
            } catch (err) {
                console.warn(`No se pudo obtener costo_total para módulo ${moduloCotizacion.id}:`, err);
            }
            
            return moduloCotizacion;
        })
    );
    
    return modulosEnriquecidos;
};

const abrirSelectorModulos = () => {
    moduloSeleccionadoModal.value = null;
    cantidadNuevaModulo.value = 1;
    mostrarSelectorModulos.value = true;
};

const abrirSelectorClientes = () => {
    mostrarSelectorClientes.value = true;
};

const cerrarSelectorClientes = () => {
    mostrarSelectorClientes.value = false;
};

const seleccionarCliente = async (cliente) => {
    try {
        // Actualizar localmente primero
        cotizacion.value.cliente_id = cliente.id;
        cotizacion.value.cliente = cliente;
        cerrarSelectorClientes();

        // Guardar en la API
        const datosActualizados = {
            cliente_id: cliente.id,
            fecha: cotizacion.value.fecha,
            estado: cotizacion.value.estado
        };

        await actualizarCotizacion(cotizacion.value.id, datosActualizados);
        
        // Mostrar mensaje de éxito
        success.value = 'Cliente actualizado correctamente';
        setTimeout(() => {
            success.value = null;
        }, 3000);
    } catch (err) {
        console.error('Error al actualizar cliente:', err);
        error.value = 'Error al actualizar el cliente: ' + (err.response?.data?.message || err.message);
        setTimeout(() => {
            error.value = null;
        }, 5000);
    }
};

const cambiarEstado = async () => {
    try {
        await actualizarEstadoCotizacion(cotizacion.value.id, cotizacion.value.estado);
        
        success.value = `Estado actualizado a: ${cotizacion.value.estado}`;
        setTimeout(() => {
            success.value = null;
        }, 3000);
    } catch (err) {
        console.error('Error al actualizar estado:', err);
        error.value = 'Error al actualizar el estado: ' + (err.response?.data?.message || err.message);
        setTimeout(() => {
            error.value = null;
        }, 5000);
    }
};

const cerrarSelectorModulos = () => {
    mostrarSelectorModulos.value = false;
    moduloSeleccionadoModal.value = null;
    cantidadNuevaModulo.value = 1;
};

const cerrarModalCantidad = () => {
    moduloSeleccionadoModal.value = null;
    cantidadNuevaModulo.value = 1;
};

const abrirSelectorComponentesDirecto = () => {
    // Abrir selector de componentes sin seleccionar módulo primero
    moduloParaAgregarComponente.value = null; // null indica que se debe mostrar selector de módulo después
    componenteSeleccionado.value = null;
    cantidadNuevoComponente.value = 1;
    mostrarSelectorComponentes.value = true;
};

const abrirSelectorModulosParaComponente = () => {
    mostrarSelectorModulosParaComponentes.value = true;
};

const cerrarSelectorModulosParaComponentes = () => {
    mostrarSelectorModulosParaComponentes.value = false;
};

const seleccionarModuloParaComponente = (modulo) => {
    moduloParaAgregarComponente.value = modulo;
    mostrarSelectorModulosParaComponentes.value = false;
    
    // Si ya hay un componente seleccionado, el modal de cantidad ya estará visible
    // porque componenteSeleccionado.value != null
    // El usuario confirmará desde el modal de cantidad con el botón "Agregar Componente"
    if (!componenteSeleccionado.value) {
        abrirSelectorComponentes(modulo);
    }
    // Si hay componente seleccionado, el modal de cantidad ya se está mostrando
    // porque v-if="componenteSeleccionado" en el template
};

const abrirSelectorComponentes = (modulo) => {
    moduloParaAgregarComponente.value = modulo;
    componenteSeleccionado.value = null;
    cantidadNuevoComponente.value = 1;
    mostrarSelectorComponentes.value = true;
};

const cerrarSelectorComponentes = () => {
    mostrarSelectorComponentes.value = false;
    moduloParaAgregarComponente.value = null;
    componenteSeleccionado.value = null;
    cantidadNuevoComponente.value = 1;
    busquedaComponente.value = '';
};

const seleccionarComponente = (componente) => {
    componenteSeleccionado.value = componente;
    cantidadNuevoComponente.value = 1;
    
    // Asignar automáticamente el primer módulo disponible
    if (modulosAsignados.value.length > 0) {
        moduloParaAgregarComponente.value = modulosAsignados.value[0];
        moduloIdSeleccionado.value = modulosAsignados.value[0].id;
        
        // Mostrar el modal de cantidad
        mostrarModalCantidadComponente.value = true;
    } else {
        error.value = 'No hay módulos disponibles. Agrega un módulo primero.';
        setTimeout(() => { error.value = null; }, 3000);
    }
};

const cerrarModalCantidadComponente = () => {
    mostrarModalCantidadComponente.value = false;
    componenteSeleccionado.value = null;
    cantidadNuevoComponente.value = 1;
};

const abrirModalEditarComponente = async (componente) => {
    try {
        console.log('🔵 Abriendo modal para editar componente:', componente);
        console.log('🔍 componente.componente_id:', componente.componente_id);
        console.log('🔍 componente.id:', componente.id);
        
        // Importar las APIs necesarias
        const { getComponenteById } = await import('../../http/componentes-api');
        const { fetchMaterialesPorComponente } = await import('../../http/materiales_por_componente-api.js');
        const { fetchCantidadPorHerraje } = await import('../../http/cantidad_por_herraje-api.js');
        const { fetchHorasDeManoDeObraPorComponentes } = await import('../../http/horas_por_mano_de_obra_por_componente-api.js');
        const { fetchMateriales } = await import('../../http/materiales-api.js');
        const { fetchHerrajes } = await import('../../http/herrajes-api.js');
        const { fetchClientes: fetchManoDeObra } = await import('../../http/mano_de_obra-api .js');
        const { fetchAcabados, getAcabadoById } = await import('../../http/acabado-api .js');
        
        // Cargar datos base del componente
        const componenteCompletoResponse = await getComponenteById(componente.componente_id);
        const componenteCompleto = componenteCompletoResponse.data || componenteCompletoResponse;
        console.log('✅ Componente completo cargado:', componenteCompleto);
        
        // Cargar catálogos completos para hacer el join
        const [todosMaterialesResponse, todosHerrajesResponse, todaManoObraResponse] = await Promise.all([
            fetchMateriales().catch(() => []),
            fetchHerrajes().catch(() => []),
            fetchManoDeObra().catch(() => [])
        ]);
        
        // Normalizar respuestas de catálogos
        const todosMaterialesData = Array.isArray(todosMaterialesResponse) ? todosMaterialesResponse : (todosMaterialesResponse.data || []);
        const todosHerrajesData = Array.isArray(todosHerrajesResponse) ? todosHerrajesResponse : (todosHerrajesResponse.data || []);
        const todaManoObraData = Array.isArray(todaManoObraResponse) ? todaManoObraResponse : (todaManoObraResponse.data || []);
        
        // Cargar materiales relacionados - usar fetch all y filtrar
        let materiales = [];
        try {
            const todosMaterialesResponse = await fetchMaterialesPorComponente();
            const todosMateriales = Array.isArray(todosMaterialesResponse) ? todosMaterialesResponse : (todosMaterialesResponse.data || []);
            const materialesFiltrados = todosMateriales.filter(m => m.componente_id === componente.componente_id);
            
            // Hacer join con los materiales completos
            materiales = materialesFiltrados.map(mat => ({
                ...mat,
                material: todosMaterialesData.find(m => m.id === mat.material_id)
            }));
            console.log('✅ Materiales encontrados:', materiales.length);
        } catch (err) {
            console.warn('⚠️ Error al cargar materiales:', err);
        }
        
        // Cargar herrajes relacionados
        let herrajes = [];
        try {
            const todasCantidadesResponse = await fetchCantidadPorHerraje();
            const todasCantidades = Array.isArray(todasCantidadesResponse) ? todasCantidadesResponse : (todasCantidadesResponse.data || []);
            const herrajesFiltrados = todasCantidades.filter(h => h.componente_id === componente.componente_id);
            
            // Hacer join con los herrajes completos
            herrajes = herrajesFiltrados.map(her => ({
                ...her,
                herraje: todosHerrajesData.find(h => h.id === her.herraje_id)
            }));
            console.log('✅ Herrajes encontrados:', herrajes.length);
        } catch (err) {
            console.warn('⚠️ Error al cargar herrajes:', err);
        }
        
        // Cargar horas de mano de obra
        let horasManoObra = [];
        try {
            const todasHorasResponse = await fetchHorasDeManoDeObraPorComponentes();
            const todasHoras = Array.isArray(todasHorasResponse) ? todasHorasResponse : (todasHorasResponse.data || []);
            const horasFiltradas = todasHoras.filter(h => h.componente_id === componente.componente_id);
            
            // Hacer join con la mano de obra completa
            horasManoObra = horasFiltradas.map(hora => ({
                ...hora,
                mano_obra: todaManoObraData.find(mo => mo.id === hora.mano_de_obra_id)
            }));
            console.log('✅ Horas de mano de obra encontradas:', horasManoObra.length);
        } catch (err) {
            console.warn('⚠️ Error al cargar horas de mano de obra:', err);
        }
        
        // Cargar acabado si existe
        let acabado = null;
        console.log('🔍 componenteCompleto.acabado_id:', componenteCompleto.acabado_id);
        
        // El acabado puede venir como objeto completo o como ID
        if (componenteCompleto.acabado_id) {
            if (typeof componenteCompleto.acabado_id === 'object' && componenteCompleto.acabado_id.id) {
                // Si acabado_id es un objeto, usarlo directamente
                acabado = componenteCompleto.acabado_id;
                console.log('✅ Acabado obtenido directamente:', acabado);
            } else if (typeof componenteCompleto.acabado_id === 'number') {
                // Si es un ID numérico, cargarlo desde la API
                try {
                    const acabadoResponse = await getAcabadoById(componenteCompleto.acabado_id);
                    acabado = acabadoResponse.data || acabadoResponse;
                    console.log('✅ Acabado cargado desde API:', acabado);
                } catch (err) {
                    console.warn('⚠️ Error al cargar acabado:', err);
                }
            }
        }
        
        // Consolidar mano de obra desde horas_mano_obra
        let manoDeObraConsolidada = null;
        let horasManoObraTotal = 0;
        if (horasManoObra && horasManoObra.length > 0) {
            // Tomar la primera mano de obra asociada
            manoDeObraConsolidada = horasManoObra[0]?.mano_obra || null;
            // Sumar todas las horas
            horasManoObraTotal = horasManoObra.reduce((sum, hora) => sum + (hora.horas || 0), 0);
        }
        
        // Combinar todos los datos
        componenteEditando.value = {
            ...componente,
            ...componenteCompleto,
            // Agregar las relaciones cargadas
            materiales: materiales || [],
            herrajes: herrajes || [],
            mano_de_obra: manoDeObraConsolidada,
            horas_mano_obra: horasManoObraTotal,
            acabado: acabado,
            // Mantener datos específicos de la cotización
            id: componente.id, // ID de la relación componente_por_cotizacion
            componente_id: componente.componente_id,
            modulo_nombre: componente.modulo_nombre,
            modulo_id: componente.modulo_id,
            cantidad: componente.cantidad
        };
        
        console.log('✅ componenteEditando preparado:', componenteEditando.value);
        
        cantidadEdicion.value = componente.cantidad;
        tabActiva.value = 'materiales';
        mostrarModalEditarComponente.value = true;
    } catch (err) {
        console.error('❌ Error al cargar datos del componente:', err);
        error.value = 'Error al cargar los datos del componente';
        setTimeout(() => { error.value = null; }, 3000);
    }
};

const cerrarModalEditarComponente = () => {
    mostrarModalEditarComponente.value = false;
    componenteEditando.value = null;
    cantidadEdicion.value = 1;
    tabActiva.value = 'materiales';
};

// Funciones para gestionar materiales
const agregarMaterial = async () => {
    try {
        const response = await fetchMateriales();
        materialesDisponibles.value = Array.isArray(response) ? response : (response.data || []);
        
        materialSeleccionado.value = null;
        cantidadMaterial.value = 1;
        busquedaMaterial.value = '';
        
        mostrarModalAgregarMaterial.value = true;
        console.log('🔵 Modal de agregar material abierto');
    } catch (err) {
        console.error('❌ Error al cargar materiales:', err);
        alert('Error al cargar la lista de materiales');
    }
};

const cerrarModalAgregarMaterial = () => {
    mostrarModalAgregarMaterial.value = false;
    materialSeleccionado.value = null;
    cantidadMaterial.value = 1;
    busquedaMaterial.value = '';
};

const seleccionarYAgregarMaterial = async (material) => {
    const existe = componenteEditando.value.materiales.find(m => m.material_id === material.id);
    if (existe) {
        alert('Este material ya está agregado al componente');
        return;
    }
    
    try {
        const datos = {
            material_id: material.id,
            componente_id: componenteEditando.value.componente_id,
            cantidad: 1
        };
        
        const response = await crearMaterialPorComponente(datos);
        const materialCreado = response.data || response;
        
        // Agregar el material a la lista local con todos los datos
        const nuevoMaterial = {
            id: materialCreado.id,
            material_id: material.id,
            componente_id: componenteEditando.value.componente_id,
            cantidad: 1,
            material: material
        };
        
        componenteEditando.value.materiales.push(nuevoMaterial);
        console.log('✅ Material agregado:', material.nombre);
        
        // Recalcular el costo del componente
        await recalcularCostoComponente();
        
        // Cerrar el modal automáticamente
        cerrarModalAgregarMaterial();
    } catch (err) {
        console.error('❌ Error al agregar material:', err);
        alert('Error al agregar el material');
    }
};

const confirmarAgregarMaterial = () => {
    if (!materialSeleccionado.value) {
        alert('Por favor selecciona un material');
        return;
    }
    
    // Verificar si el material ya existe
    const existe = componenteEditando.value.materiales.find(m => m.material_id === materialSeleccionado.value.id);
    if (existe) {
        alert('Este material ya está agregado al componente');
        return;
    }
    
    // Agregar el material
    const nuevoMaterial = {
        id: Date.now(), // ID temporal
        material_id: materialSeleccionado.value.id,
        componente_id: componenteEditando.value.componente_id,
        cantidad: cantidadMaterial.value,
        material: materialSeleccionado.value
    };
    
    componenteEditando.value.materiales.push(nuevoMaterial);
    console.log('✅ Material agregado:', materialSeleccionado.value.nombre);
    
    cerrarModalAgregarMaterial();
};

const materialesFiltrados = computed(() => filtrarItems(materialesDisponibles.value, busquedaMaterial.value));

const eliminarMaterial = async (material) => {
    try {
        await eliminarMaterialPorComponente(material.id);
        
        const index = componenteEditando.value.materiales.findIndex(m => m.id === material.id);
        if (index !== -1) {
            componenteEditando.value.materiales.splice(index, 1);
            console.log('✅ Material eliminado:', material.material?.nombre);
            
            await recalcularCostoComponente();
        }
    } catch (err) {
        console.error('❌ Error al eliminar material:', err);
        alert('Error al eliminar el material');
    }
};

const aumentarCantidadMaterial = async (material) => {
    const nuevaCantidad = (material.cantidad || 0) + 1;
    
    try {
        await actualizarMaterialPorComponente(material.id, {
            material_id: material.material_id,
            componente_id: material.componente_id,
            cantidad: nuevaCantidad
        });
        
        material.cantidad = nuevaCantidad;
        console.log('➕ Cantidad aumentada:', material.material?.nombre, material.cantidad);
        
        await recalcularCostoComponente();
    } catch (err) {
        console.error('❌ Error al aumentar cantidad:', err);
        alert('Error al actualizar la cantidad');
    }
};

const disminuirCantidadMaterial = async (material) => {
    if (material.cantidad > 1) {
        const nuevaCantidad = material.cantidad - 1;
        
        try {
            await actualizarMaterialPorComponente(material.id, {
                material_id: material.material_id,
                componente_id: material.componente_id,
                cantidad: nuevaCantidad
            });
            
            material.cantidad = nuevaCantidad;
            console.log('➖ Cantidad disminuida:', material.material?.nombre, material.cantidad);
            
            await recalcularCostoComponente();
        } catch (err) {
            console.error('❌ Error al disminuir cantidad:', err);
            alert('Error al actualizar la cantidad');
        }
    }
};

// ===== FUNCIONES HELPER REUTILIZABLES =====
const filtrarItems = (items, busqueda) => {
    if (!busqueda) return items;
    const busquedaLower = busqueda.toLowerCase();
    return items.filter(item => 
        item.nombre?.toLowerCase().includes(busquedaLower) ||
        item.descripcion?.toLowerCase().includes(busquedaLower)
    );
};

const abrirModalSeleccion = async (fetchFunction, disponiblesRef, busquedaRef, modalRef, errorName) => {
    try {
        const response = await fetchFunction();
        disponiblesRef.value = Array.isArray(response) ? response : (response.data || []);
        busquedaRef.value = '';
        modalRef.value = true;
    } catch (err) {
        console.error(`❌ Error al cargar ${errorName}:`, err);
        alert(`Error al cargar la lista de ${errorName}`);
    }
};

const cerrarModal = (modalRef, busquedaRef) => {
    modalRef.value = false;
    busquedaRef.value = '';
};

const actualizarCantidadOHoras = async (item, delta, updateFunction, fieldName = 'cantidad') => {
    const currentValue = item[fieldName] || 0;
    if (delta < 0 && currentValue <= 1) return;
    
    const nuevoValor = currentValue + delta;
    try {
        await updateFunction(item.id, {
            ...item,
            [fieldName]: nuevoValor
        });
        item[fieldName] = nuevoValor;
        await recalcularCostoComponente();
    } catch (err) {
        console.error(`❌ Error al actualizar ${fieldName}:`, err);
        alert(`Error al actualizar ${fieldName === 'horas' ? 'las horas' : 'la cantidad'}`);
    }
};

const eliminarItem = async (item, array, deleteFunction, errorName) => {
    try {
        await deleteFunction(item.id);
        const index = array.findIndex(i => i.id === item.id);
        if (index !== -1) {
            array.splice(index, 1);
            await recalcularCostoComponente();
        }
    } catch (err) {
        console.error(`❌ Error al eliminar ${errorName}:`, err);
        alert(`Error al eliminar ${errorName}`);
    }
};

const recalcularCostoComponente = async () => {
    try {
        const costoMateriales = (componenteEditando.value.materiales || []).reduce((sum, mat) => 
            sum + ((mat.material?.precio_unitario || 0) * (mat.cantidad || 0)), 0);
        
        const costoHerrajes = (componenteEditando.value.herrajes || []).reduce((sum, her) => 
            sum + ((her.herraje?.costo_unitario || 0) * (her.cantidad || 0)), 0);
        
        const costoManoObra = (componenteEditando.value.mano_de_obra?.costo_hora || 0) * (componenteEditando.value.horas_mano_obra || 0);
        
        const costoAcabado = parseFloat(componenteEditando.value.acabado?.costo || 0);
        const costoTotal = costoMateriales + costoHerrajes + costoManoObra + costoAcabado;
        
        componenteEditando.value = { ...componenteEditando.value, precio_unitario: costoTotal };
        
        cotizacion.value.modulos.forEach(modulo => {
            const componente = modulo.componentes?.find(c => c.id === componenteEditando.value.id);
            if (componente) componente.precio_unitario = costoTotal;
        });
        
        console.log('💰 Costo recalculado:', { materiales: costoMateriales, herrajes: costoHerrajes, manoObra: costoManoObra, acabado: costoAcabado, total: costoTotal });
    } catch (err) {
        console.error('❌ Error al recalcular costo:', err);
    }
};

// ===== HERRAJES =====
const agregarHerraje = () => abrirModalSeleccion(
    fetchHerrajes,
    herrajesDisponibles,
    busquedaHerraje,
    mostrarModalAgregarHerraje,
    'herrajes'
);

const cerrarModalAgregarHerraje = () => cerrarModal(mostrarModalAgregarHerraje, busquedaHerraje);

const seleccionarYAgregarHerraje = async (herraje) => {
    if (componenteEditando.value.herrajes.find(h => h.herraje_id === herraje.id)) {
        return alert('Este herraje ya está agregado al componente');
    }
    
    try {
        const response = await crearCantidadPorHerraje({
            herraje_id: herraje.id,
            componente_id: componenteEditando.value.componente_id,
            cantidad: 1
        });
        
        componenteEditando.value.herrajes.push({
            id: (response.data || response).id,
            herraje_id: herraje.id,
            componente_id: componenteEditando.value.componente_id,
            cantidad: 1,
            herraje: herraje
        });
        
        await recalcularCostoComponente();
        cerrarModalAgregarHerraje();
    } catch (err) {
        console.error('❌ Error al agregar herraje:', err);
        alert('Error al agregar el herraje');
    }
};

const herrajesFiltrados = computed(() => filtrarItems(herrajesDisponibles.value, busquedaHerraje.value));

const eliminarHerraje = async (herraje) => {
    await eliminarItem(herraje, componenteEditando.value.herrajes, eliminarCantidadPorHerraje, 'herraje');
};

const aumentarCantidadHerraje = async (herraje) => {
    await actualizarCantidadOHoras(herraje, 1, actualizarCantidadPorHerraje);
};

const disminuirCantidadHerraje = async (herraje) => {
    await actualizarCantidadOHoras(herraje, -1, actualizarCantidadPorHerraje);
};

// ===== MANO DE OBRA =====
const agregarManoDeObra = () => abrirModalSeleccion(
    fetchManoDeObra,
    manoDeObraDisponible,
    busquedaManoObra,
    mostrarModalAgregarManoObra,
    'mano de obra'
);

const cambiarManoDeObra = agregarManoDeObra;

const cerrarModalAgregarManoObra = () => cerrarModal(mostrarModalAgregarManoObra, busquedaManoObra);

const seleccionarYAgregarManoObra = async (manoObra) => {
    componenteEditando.value = { 
        ...componenteEditando.value, 
        mano_de_obra: manoObra, 
        mano_de_obra_id: manoObra.id,
        horas_mano_obra: 1
    };
    
    await recalcularCostoComponente();
    cerrarModalAgregarManoObra();
};

const manoDeObraFiltrada = computed(() => filtrarItems(manoDeObraDisponible.value, busquedaManoObra.value));

const eliminarManoDeObra = async () => {
    componenteEditando.value = { 
        ...componenteEditando.value, 
        mano_de_obra: null, 
        mano_de_obra_id: null,
        horas_mano_obra: 0
    };
    
    await recalcularCostoComponente();
};

const aumentarHorasManoDeObra = async () => {
    const nuevasHoras = (componenteEditando.value.horas_mano_obra || 1) + 1;
    componenteEditando.value = {
        ...componenteEditando.value,
        horas_mano_obra: nuevasHoras
    };
    await recalcularCostoComponente();
};

const disminuirHorasManoDeObra = async () => {
    const horasActuales = componenteEditando.value.horas_mano_obra || 1;
    if (horasActuales > 1) {
        componenteEditando.value = {
            ...componenteEditando.value,
            horas_mano_obra: horasActuales - 1
        };
        await recalcularCostoComponente();
    }
};

// ===== ACABADO =====
const agregarAcabado = () => abrirModalSeleccion(
    fetchAcabados,
    acabadosDisponibles,
    busquedaAcabado,
    mostrarModalSeleccionarAcabado,
    'acabados'
);

const cambiarAcabado = agregarAcabado;
const cerrarModalSeleccionarAcabado = () => cerrarModal(mostrarModalSeleccionarAcabado, busquedaAcabado);

const seleccionarAcabado = async (acabado) => {
    componenteEditando.value = { ...componenteEditando.value, acabado, acabado_id: acabado.id };
    await recalcularCostoComponente();
    cerrarModalSeleccionarAcabado();
};

const acabadosFiltrados = computed(() => filtrarItems(acabadosDisponibles.value, busquedaAcabado.value));

const eliminarAcabado = async () => {
    componenteEditando.value = { ...componenteEditando.value, acabado: null, acabado_id: null };
    await recalcularCostoComponente();
};

const cambiarComponenteSeleccionado = () => {
    componenteSeleccionado.value = null;
    cantidadNuevoComponente.value = 1;
    moduloParaAgregarComponente.value = null;
    mostrarSelectorComponentes.value = true;
};

const decrementarCantidadNuevoComponente = async () => {
    if (cantidadNuevoComponente.value > 1) {
        cantidadNuevoComponente.value--;
        
        // Si el componente ya existe en el módulo, actualizar directamente en la API
        if (componenteSeleccionado.value && moduloIdSeleccionado.value) {
            try {
                // Buscar directamente en la API
                const componentesEnApi = await storeComponentesPorCotizacion.fetchComponentesPorCotizacion();
                const registroApi = componentesEnApi.find(cpc => 
                    cpc.cotizacion_id === cotizacion.value.id && 
                    cpc.componente_id === componenteSeleccionado.value.id &&
                    cpc.modulo_id === moduloIdSeleccionado.value
                );
                
                if (registroApi) {
                    // Actualizar directamente en la API
                    await storeComponentesPorCotizacion.actualizarComponentePorCotizacion(
                        registroApi.id,
                        { cantidad: cantidadNuevoComponente.value }
                    );
                    // Sincronizar para refrescar la vista
                    await sincronizarComponentesExistentes();
                }
            } catch (err) {
                console.error('❌ Error al actualizar cantidad:', err);
            }
        }
    }
};

const incrementarCantidadNuevoComponente = async () => {
    cantidadNuevoComponente.value++;
    
    // Si el componente ya existe en el módulo, actualizar directamente en la API
    if (componenteSeleccionado.value && moduloIdSeleccionado.value) {
        try {
            // Buscar directamente en la API
            const componentesEnApi = await storeComponentesPorCotizacion.fetchComponentesPorCotizacion();
            const registroApi = componentesEnApi.find(cpc => 
                cpc.cotizacion_id === cotizacion.value.id && 
                cpc.componente_id === componenteSeleccionado.value.id &&
                cpc.modulo_id === moduloIdSeleccionado.value
            );
            
            if (registroApi) {
                // Actualizar directamente en la API
                await storeComponentesPorCotizacion.actualizarComponentePorCotizacion(
                    registroApi.id,
                    { cantidad: cantidadNuevoComponente.value }
                );
                // Sincronizar para refrescar la vista
                await sincronizarComponentesExistentes();
            }
        } catch (err) {
            console.error('❌ Error al actualizar cantidad:', err);
        }
    }
};

const confirmarAgregarComponente = async () => {
    if (!componenteSeleccionado.value || !moduloIdSeleccionado.value) return;
    
    try {
        const componente = componenteSeleccionado.value;
        const moduloId = moduloIdSeleccionado.value;
        
        console.log('🔵 Agregando componente:', componente.nombre, 'al módulo ID:', moduloId);
        
        // Buscar el módulo por ID (puede haber sido reconstruido)
        const modulo = cotizacion.value.modulos.find(m => m.id === moduloId);
        if (!modulo) {
            error.value = 'Error: El módulo no está en la cotización. Agrega el módulo primero.';
            setTimeout(() => { error.value = null; }, 5000);
            return;
        }
        
        console.log('✅ Módulo encontrado:', modulo.nombre);
        
        // Verificar que el componente no esté ya agregado
        console.log('🔍 Verificando duplicados. Componentes en módulo:', modulo.componentes?.length || 0);
        const componenteExistente = modulo.componentes?.find(c => c.id === componente.id);
        console.log('🔍 ¿Ya existe?', !!componenteExistente);
        
        if (componenteExistente) {
            console.log('⚡ Componente ya existe, incrementando cantidad...');
            // En lugar de mostrar error, incrementar la cantidad
            const nuevaCantidad = componenteExistente.cantidad + cantidadNuevoComponente.value;
            
            try {
                // Buscar el registro en la API para actualizarlo
                const componentesEnApi = await storeComponentesPorCotizacion.fetchComponentesPorCotizacion();
                const registroApi = componentesEnApi.find(cpc => 
                    cpc.cotizacion_id === cotizacion.value.id && 
                    cpc.componente_id === componente.id &&
                    cpc.modulo_id === moduloId
                );
                
                if (registroApi) {
                    await storeComponentesPorCotizacion.actualizarComponentePorCotizacion(
                        registroApi.id,
                        { cantidad: nuevaCantidad }
                    );
                    
                    // Reconstruir desde la API
                    await sincronizarComponentesExistentes();
                    
                    success.value = `Cantidad de "${componente.nombre}" actualizada a ${nuevaCantidad}`;
                    setTimeout(() => { success.value = null; }, 3000);
                    
                    cerrarModalCantidadComponente();
                    return;
                }
            } catch (err) {
                console.error('❌ Error al actualizar cantidad:', err);
                error.value = 'Error al actualizar la cantidad';
                setTimeout(() => { error.value = null; }, 3000);
                return;
            }
        }
        
        console.log('✅ Componente no está duplicado, procediendo a guardar...');
        
        // Guardar directamente en la API sin modificar el estado local
        console.log('🔵 Guardando componente en API...');
        const datosComponente = {
            cotizacion_id: cotizacion.value.id,
            componente_id: componente.id,
            modulo_id: moduloId,
            cantidad: cantidadNuevoComponente.value
        };
        
        console.log('📤 Datos a enviar:', datosComponente);
        await storeComponentesPorCotizacion.crearComponentePorCotizacion(datosComponente);
        console.log('✅ Componente guardado en API');
        
        // Reconstruir todo desde la API
        await sincronizarComponentesExistentes();
        
        success.value = `Componente "${componente.nombre}" agregado correctamente`;
        setTimeout(() => { success.value = null; }, 3000);
        
        // Cerrar el modal de cantidad pero mantener abierto el de componentes
        cerrarModalCantidadComponente();
    } catch (err) {
        console.error('❌ Error al agregar componente:', err);
        error.value = 'Error al agregar el componente: ' + (err.response?.data?.message || err.message);
        setTimeout(() => { error.value = null; }, 5000);
    }
};

const cambiarModuloSeleccionado = () => {
    // Cerrar modal de cantidad y volver a abrir selector
    moduloSeleccionadoModal.value = null;
    cantidadNuevaModulo.value = 1;
    mostrarSelectorModulos.value = true;
};

const seleccionarModulo = async (modulo) => {
    cargandoModuloModal.value = true;
    
    try {
        // Obtener el módulo completo del API con todos sus datos
        const moduloCompleto = await getModuloById(modulo.id);
        const datos = moduloCompleto?.data || moduloCompleto;
        
        // Asignar el módulo con su costo_total del API
        // Hacer copia profunda para asegurar reactividad de Vue
        const moduloAsignado = {
            ...JSON.parse(JSON.stringify(datos)),
            costo_total: normalizarCostoTotal(datos)
        };
        moduloSeleccionadoModal.value = moduloAsignado;
        
        cantidadNuevaModulo.value = 1;
        mostrarSelectorModulos.value = false;
    } catch (err) {
        console.error('Error al obtener módulo:', err);
        // Fallback: usar el módulo local si falla la API
        const moduloLocal = modulos.value.find(m => m.id === modulo.id) || modulo;
        
        moduloSeleccionadoModal.value = { ...moduloLocal };
        cantidadNuevaModulo.value = 1;
        mostrarSelectorModulos.value = false;
    } finally {
        cargandoModuloModal.value = false;
    }
};

const decrementarCantidad = () => {
    if (cantidadNuevaModulo.value > 1) {
        cantidadNuevaModulo.value--;
    }
};

const incrementarCantidad = () => {
    cantidadNuevaModulo.value++;
};

const confirmarAgregarModulo = async () => {
    if (!moduloSeleccionadoModal.value) return;
    
    const modulo = moduloSeleccionadoModal.value;
    
    try {
        if (!cotizacion.value.modulos) {
            cotizacion.value.modulos = [];
        }

        cotizacion.value.modulos.push({
            id: modulo.id,
            nombre: modulo.nombre,
            codigo: modulo.codigo,
            descripcion: modulo.descripcion,
            cantidad: cantidadNuevaModulo.value,
            componentes: modulo.componentes || [],
            costo_total: normalizarCostoTotal(modulo)
        });

        // Forzar reactividad
        cotizacion.value.modulos = [...cotizacion.value.modulos];

        console.log('Módulo agregado localmente:', modulo.nombre);
        console.log('📊 Total módulos:', cotizacion.value.modulos.length);
        console.log('📊 Total componentes en módulo:', modulo.componentes?.length || 0);

        // Guardar los componentes del módulo en componentes_por_cotizacion
        try {
            if (modulo.componentes && modulo.componentes.length > 0) {
                console.log('🔵 Guardando componentes del módulo en componentes_por_cotizacion...');
                console.log('📊 Cantidad de módulos:', cantidadNuevaModulo.value);
                for (const componente of modulo.componentes) {
                    try {
                        // Multiplicar la cantidad del componente por la cantidad de módulos
                        const cantidadBase = componente.cantidad || 1;
                        const cantidadTotal = cantidadBase * cantidadNuevaModulo.value;
                        const datosComponente = {
                            cotizacion_id: cotizacion.value.id,
                            componente_id: componente.id,
                            modulo_id: modulo.id,
                            cantidad: cantidadTotal
                        };
                        console.log('📤 Guardando componente:', componente.nombre, `${cantidadBase} × ${cantidadNuevaModulo.value} = ${cantidadTotal}`, datosComponente);
                        await storeComponentesPorCotizacion.crearComponentePorCotizacion(datosComponente);
                        console.log('✅ Componente guardado:', componente.nombre);
                        
                        // Actualizar también la cantidad en el componente local del módulo
                        componente.cantidad = cantidadTotal;
                    } catch (compErr) {
                        console.warn('⚠️ Error guardando componente:', componente.nombre, compErr);
                        // Continuar con los demás componentes aunque uno falle
                    }
                }
                console.log('✅ Todos los componentes guardados');
            }
            
            success.value = 'Módulo agregado correctamente';
            setTimeout(() => { success.value = null; }, 3000);
        } catch (apiErr) {
            console.error('❌ Error al guardar componentes:', apiErr);
            console.error('❌ Detalles del error:', apiErr.response?.data || apiErr.message);
            
            // Mostrar advertencia pero mantener el módulo
            error.value = 'Módulo agregado, pero algunos componentes no se guardaron';
            setTimeout(() => { error.value = null; }, 5000);
        }

        cerrarModalCantidad();
        cerrarSelectorModulos();
    } catch (err) {
        console.error('Error al agregar módulo:', err);
        error.value = 'Error al agregar el módulo';
    }
};

const eliminarModuloAsignado = async (index) => {
    try {
        const modulo = cotizacion.value.modulos[index];
        const moduloId = modulo.id;
        console.log('🔴 Eliminando módulo:', modulo.nombre, 'ID:', moduloId);
        
        // Eliminar del array local
        cotizacion.value.modulos.splice(index, 1);
        console.log('🗑️ Módulo eliminado localmente');
        
        success.value = 'Módulo eliminado correctamente';
        setTimeout(() => { success.value = null; }, 3000);
    } catch (err) {
        console.error('❌ Error al eliminar módulo:', err);
        error.value = 'Error al eliminar el módulo';
    }
};

const cargarCotizacion = async () => {
    try {
        cargandoDatos.value = true;
        const id = route.params.id;
        
        const response = await getCotizacionById(id);
        const data = response?.data || response;
        
        if (Array.isArray(data)) {
            cotizacion.value = data[0];
        } else {
            cotizacion.value = data;
        }

        // Normalizar estructura: el backend devuelve "modulos_ordenados" pero usamos "modulos" en el frontend
        if (!cotizacion.value.modulos && cotizacion.value.modulos_ordenados) {
            cotizacion.value.modulos = cotizacion.value.modulos_ordenados;
        }
        if (!cotizacion.value.modulos) {
            cotizacion.value.modulos = [];
        }
        if (!cotizacion.value.modulos_ordenados) {
            cotizacion.value.modulos_ordenados = [];
        }
        if (!cotizacion.value.detalles) {
            cotizacion.value.detalles = [];
        }

        // Cargar clientes
        const clientesResponse = await fetchClientes();
        const clientesData = clientesResponse?.data || clientesResponse;
        clientes.value = Array.isArray(clientesData) ? clientesData : [];

        // Cargar módulos
        const modulosResponse = await fetchModulos();
        const modulosData = modulosResponse?.data || modulosResponse;
        modulos.value = Array.isArray(modulosData) ? modulosData : [];

        // Cargar componentes
        const componentesResponse = await fetchComponentes();
        const componentesData = componentesResponse?.data || componentesResponse;
        componentes.value = Array.isArray(componentesData) ? componentesData : [];
        console.log('📦 Componentes cargados:', componentes.value.length);

        // Enriquecer módulos de la cotización con costo_total desde el API
        if (cotizacion.value.modulos && Array.isArray(cotizacion.value.modulos)) {
            const modulosEnriquecidos = await enriquecerModulosConCostoTotal(cotizacion.value.modulos);
            
            // Hacer copia profunda para asegurar reactividad de Vue
            const copia = JSON.parse(JSON.stringify(cotizacion.value));
            copia.modulos = modulosEnriquecidos;
            cotizacion.value = copia;
        }

        console.log('Cotización cargada:', cotizacion.value);
        console.log('Detalles:', cotizacion.value.detalles);
        console.log('Módulos ordenados:', cotizacion.value.modulos_ordenados);
        console.log('Todas las propiedades:', Object.keys(cotizacion.value));
        console.log('Estructura completa:', JSON.stringify(cotizacion.value, null, 2));
        
        // Sincronizar componentes existentes con la API
        await sincronizarComponentesExistentes();
    } catch (err) {
        console.error('Error al cargar cotización:', err);
        error.value = 'Error al cargar la cotización';
    } finally {
        cargandoDatos.value = false;
    }
};

const sincronizarComponentesExistentes = async () => {
    try {
        console.log('🔄 Sincronizando componentes existentes con la API...');
        
        // Obtener todos los componentes ya guardados en la API
        const componentesEnApi = await storeComponentesPorCotizacion.fetchComponentesPorCotizacion();
        console.log('📋 Componentes en API:', componentesEnApi.length);
        
        // Primero, eliminar duplicados en la API
        const componentesPorCotizacion = componentesEnApi.filter(cpc => cpc.cotizacion_id === cotizacion.value.id);
        const duplicados = new Map();
        
        for (const comp of componentesPorCotizacion) {
            const clave = `${comp.cotizacion_id}-${comp.componente_id}`;
            if (duplicados.has(clave)) {
                // Es un duplicado, eliminar el más antiguo
                const existente = duplicados.get(clave);
                const aEliminar = new Date(comp.created_at) < new Date(existente.created_at) ? comp : existente;
                const aMantener = new Date(comp.created_at) < new Date(existente.created_at) ? existente : comp;
                
                console.log(`⚠️ Duplicado encontrado para componente ${comp.componente_id}, eliminando registro ${aEliminar.id}`);
                try {
                    await storeComponentesPorCotizacion.eliminarComponentePorCotizacion(aEliminar.id);
                } catch (err) {
                    console.warn('Error eliminando duplicado:', err);
                }
                
                duplicados.set(clave, aMantener);
            } else {
                duplicados.set(clave, comp);
            }
        }
        
        // Recargar componentes después de limpiar duplicados
        const componentesLimpios = await storeComponentesPorCotizacion.fetchComponentesPorCotizacion();
        console.log('📋 Todos los componentes después de limpiar:', componentesLimpios);
        console.log('🔍 ID de cotización actual:', cotizacion.value.id);
        const componentesEstaCotzacion = componentesLimpios.filter(cpc => cpc.cotizacion_id === cotizacion.value.id);
        console.log('📋 Componentes filtrados para esta cotización:', componentesEstaCotzacion);
        
        // Inicializar array de módulos si no existe
        if (!cotizacion.value.modulos) {
            cotizacion.value.modulos = [];
        }
        
        // SIEMPRE reconstruir módulos desde los componentes de la API
        console.log('🏗️ Reconstruyendo módulos desde componentes de la API...');
        console.log('📋 Componentes a reconstruir:', componentesEstaCotzacion);
        
        // Agrupar componentes por modulo_id
        const modulosPorId = new Map();
        
        for (const compApi of componentesEstaCotzacion) {
            console.log(`🔍 Procesando componente ID ${compApi.componente_id}, modulo_id: ${compApi.modulo_id}`);
            
            if (compApi.modulo_id) {
                if (!modulosPorId.has(compApi.modulo_id)) {
                    // Buscar el módulo completo en el store de módulos
                    const moduloCompleto = modulos.value.find(m => m.id === compApi.modulo_id);
                    
                    if (moduloCompleto) {
                        console.log(`✅ Módulo ${moduloCompleto.nombre} encontrado para componente ${compApi.componente_id}`);
                        // Crear una copia del módulo con sus componentes
                        modulosPorId.set(compApi.modulo_id, {
                            ...moduloCompleto,
                            cantidad: 1,
                            componentes: []
                        });
                    } else {
                        console.warn(`⚠️ No se encontró módulo con ID ${compApi.modulo_id}`);
                    }
                }
                
                // Agregar el componente al módulo
                const moduloEnMapa = modulosPorId.get(compApi.modulo_id);
                if (moduloEnMapa) {
                    // Buscar el componente completo en el store de componentes
                    let componenteCompleto = componentes.value.find(c => c.id === compApi.componente_id);
                    
                    // Si no se encuentra en componentes.value, usar los datos de compApi.componente
                    if (!componenteCompleto && compApi.componente) {
                        componenteCompleto = compApi.componente;
                        console.log('⚠️ Usando componente desde API:', componenteCompleto.nombre);
                    }
                    
                    if (componenteCompleto) {
                        console.log(`✅ Agregando ${componenteCompleto.nombre} al módulo ${moduloEnMapa.nombre}`);
                        moduloEnMapa.componentes.push({
                            id: componenteCompleto.id,
                            componente_id: componenteCompleto.id, // ID del componente en la tabla componentes
                            nombre: componenteCompleto.nombre,
                            descripcion: componenteCompleto.descripcion,
                            cantidad: compApi.cantidad,
                            precio_unitario: componenteCompleto.precio_unitario ?? componenteCompleto.costo_total ?? 0
                        });
                    } else {
                        console.warn('⚠️ No se encontró componente con ID:', compApi.componente_id);
                    }
                }
            } else {
                console.warn(`⚠️ Componente ${compApi.componente_id} no tiene modulo_id`);
            }
        }
        
        // Actualizar los módulos en la cotización
        cotizacion.value.modulos = Array.from(modulosPorId.values());
        console.log(`✅ ${cotizacion.value.modulos.length} módulos reconstruidos con ${componentesEstaCotzacion.length} componentes`);
        console.log('✅ Sincronización de componentes completada');
    } catch (err) {
        console.error('❌ Error en sincronización de componentes:', err);
        // No lanzar error para no bloquear la carga de la cotización
    }
};

const guardarCambios = async () => {
    try {
        guardando.value = true;
        error.value = null;

        // Preparar datos para enviar a la API
        const datosActualizados = {
            cliente_id: cotizacion.value.cliente_id,
            fecha: cotizacion.value.fecha,
            estado: cotizacion.value.estado,
            modulos: cotizacion.value.modulos.map(m => ({
                id: m.id,
                cantidad: m.cantidad
            }))
        };

        console.log('Intentando guardar:', datosActualizados);

        // Intentar guardar en la API
        try {
            await actualizarCotizacion(cotizacion.value.id, datosActualizados);
            console.log('Cotización actualizada en la API');
        } catch (apiErr) {
            console.warn('No se pudo actualizar en la API:', apiErr.message);
            // Mostrar advertencia pero continuar
            error.value = 'Nota: Los cambios locales se han hecho, pero puede que no se hayan guardado en la API';
        }
        
        // Redirigir después de 1.5 segundos
        setTimeout(() => {
            router.push(`/cotizacion-detallada/${cotizacion.value.id}`);
        }, 1500);
    } catch (err) {
        console.error('Error al guardar:', err);
        error.value = 'Error: ' + (err.response?.data?.message || err.message);
    } finally {
        guardando.value = false;
    }
};

const generarPDF = async () => {
    try {
        generandoPDF.value = true;
        console.log('Iniciando generación de PDF...');
        
        // Importar jsPDF dinámicamente
        console.log('Importando jsPDF...');
        const jsPDFModule = await import('jspdf');
        const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
        console.log('jsPDF importado correctamente');
        
        const doc = new jsPDF();
        console.log('Documento PDF creado');
        
        // Configuración
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let y = 20;
        
        // Título
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('COTIZACIÓN', pageWidth / 2, y, { align: 'center' });
        y += 15;
        
        // Número de cotización
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Número: #${cotizacion.value.id}`, margin, y);
        y += 8;
        doc.text(`Fecha: ${new Date(cotizacion.value.fecha).toLocaleDateString('es-ES')}`, margin, y);
        y += 8;
        doc.text(`Estado: ${cotizacion.value.estado}`, margin, y);
        y += 15;
        
        // Información del cliente
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('CLIENTE', margin, y);
        y += 8;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        if (cotizacion.value.cliente) {
            doc.text(`Nombre: ${cotizacion.value.cliente.nombre}`, margin, y);
            y += 6;
            if (cotizacion.value.cliente.empresa) {
                doc.text(`Empresa: ${cotizacion.value.cliente.empresa}`, margin, y);
                y += 6;
            }
            if (cotizacion.value.cliente.email) {
                doc.text(`Email: ${cotizacion.value.cliente.email}`, margin, y);
                y += 6;
            }
            if (cotizacion.value.cliente.telefono) {
                doc.text(`Teléfono: ${cotizacion.value.cliente.telefono}`, margin, y);
                y += 6;
            }
        }
        y += 10;
        
        // Módulos
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('MÓDULOS', margin, y);
        y += 10;
        
        console.log('Agregando módulos al PDF:', modulosAsignados.value.length);
        modulosAsignados.value.forEach((modulo, index) => {
            // Verificar si necesitamos una nueva página
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`${index + 1}. ${modulo.nombre}`, margin, y);
            y += 6;
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            if (modulo.descripcion) {
                doc.text(`   ${modulo.descripcion}`, margin, y);
                y += 6;
            }
            
            doc.text(`   Código: ${modulo.codigo}`, margin, y);
            y += 6;
            doc.text(`   Cantidad: ${modulo.cantidad}`, margin, y);
            y += 6;
            doc.text(`   Precio Unitario: $${formatCurrency(modulo.costo_total || calcularPrecioUnitarioModulo(modulo))}`, margin, y);
            y += 6;
            doc.text(`   Subtotal: $${formatCurrency(calcularSubtotalModulo(modulo))}`, margin, y);
            y += 10;
        });
        
        // Total
        y += 5;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL: $${formatCurrency(totalCotizacion.value)}`, pageWidth - margin, y, { align: 'right' });
        
        console.log('Guardando PDF...');
        // Guardar el PDF
        doc.save(`Cotizacion_${cotizacion.value.id}.pdf`);
        console.log('PDF guardado correctamente');
        
        success.value = 'PDF generado correctamente';
        setTimeout(() => {
            success.value = null;
        }, 3000);
    } catch (err) {
        console.error('Error al generar PDF:', err);
        console.error('Stack trace:', err.stack);
        error.value = 'Error al generar el PDF: ' + err.message;
        setTimeout(() => {
            error.value = null;
        }, 5000);
    } finally {
        generandoPDF.value = false;
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
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    padding: 2rem;
    margin: -2rem -2rem 2rem -2rem;
    border-radius: 16px 16px 0 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.header-title-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.btn-back {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 10px 18px;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    font-size: 0.95rem;
}

.btn-back:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateX(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.back-icon {
    font-size: 1.2rem;
    transition: transform 0.3s ease;
}

.btn-back:hover .back-icon {
    transform: translateX(-3px);
}

.form-title {
    margin: 0;
    color: white;
    font-size: 2rem;
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cotizacion-badge {
    background: rgba(255, 255, 255, 0.25);
    color: white;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    border: 2px solid rgba(255, 255, 255, 0.3);
}

.estado-badge {
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: capitalize;
    border: 2px solid rgba(255, 255, 255, 0.3);
}

.estado-selector {
    padding: 8px 18px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: capitalize;
    border: 2px solid rgba(255, 255, 255, 0.3);
    outline: none;
    cursor: pointer;
    transition: all 0.3s ease;
}

.header-buttons {
    display: flex;
    gap: 0.75rem;
}

.estado-selector:hover {
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
}

.estado-activa {
    background: rgba(76, 175, 80, 0.9);
    color: white;
}

.estado-completada {
    background: rgba(33, 150, 243, 0.9);
    color: white;
}

.estado-cancelada {
    background: rgba(244, 67, 54, 0.9);
    color: white;
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

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.section-header-inline {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.section-subtitle {
    color: #999;
    font-size: 0.9rem;
    font-weight: 500;
    margin: 0;
}

.btn-add-module, .btn-add-component {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 14px 28px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border: none;
    border-radius: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 1rem;
    white-space: nowrap;
    box-shadow: 0 6px 20px rgba(212, 165, 116, 0.35);
    position: relative;
    overflow: hidden;
}

.btn-add-module::before, .btn-add-component::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
}

.btn-add-module:hover::before, .btn-add-component:hover::before {
    width: 300px;
    height: 300px;
}

.btn-add-component {
    background: linear-gradient(135deg, #5a9fd4 0%, #4a8fc2 100%);
    box-shadow: 0 6px 20px rgba(90, 159, 212, 0.35);
}

.btn-add-module:hover, .btn-add-component:hover {
    transform: translateY(-4px) scale(1.02);
}

.btn-add-module:hover {
    background: linear-gradient(135deg, #c89564 0%, #b8845a 100%);
    box-shadow: 0 10px 30px rgba(212, 165, 116, 0.5);
}

.btn-add-component:hover {
    background: linear-gradient(135deg, #4a8fc2 0%, #3a7fb0 100%);
    box-shadow: 0 10px 30px rgba(90, 159, 212, 0.5);
}

.btn-add-component:disabled {
    background: linear-gradient(135deg, #9e9e9e 0%, #757575 100%);
    cursor: not-allowed;
    opacity: 0.6;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.btn-add-component:disabled:hover {
    transform: none;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.header-buttons {
    display: flex;
    gap: 0.75rem;
}

.btn-icon {
    font-size: 1.1rem;
    line-height: 1;
}

.modulos-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    margin-top: 1rem;
}

.modulo-card {
    background: white;
    border: 2px solid #e8ddd7;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
}

.modulo-card:hover {
    border-color: #d4a574;
    box-shadow: 0 4px 16px rgba(212, 165, 116, 0.15);
    transform: translateY(-2px);
}

.card-header {
    padding: 16px;
    background: linear-gradient(135deg, #f5f3f0 0%, #ede8e2 100%);
    border-bottom: 2px solid #e8ddd7;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.card-title {
    flex: 1;
}

.card-title h3 {
    margin: 0 0 6px 0;
    color: #2c2c2c;
    font-size: 1.1rem;
    font-weight: 600;
}

.card-codigo {
    display: inline-block;
    padding: 4px 10px;
    background: #d4a574;
    color: white;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
}

.btn-delete {
    padding: 8px 12px;
    background: #ffebee;
    color: #c62828;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1.1rem;
    transition: all 0.2s;
}

.btn-delete:hover {
    background: #ef5350;
    color: white;
}

.card-body {
    padding: 16px;
    flex: 1;
}

.card-description {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 12px;
    line-height: 1.4;
}

.components-section {
    margin-bottom: 12px;
}

.components-section h4 {
    margin: 0 0 8px 0;
    font-size: 0.9rem;
    color: #2c2c2c;
    font-weight: 600;
}

.components-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.component-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #faf8f5;
    border-radius: 6px;
    font-size: 0.85rem;
}

.comp-name {
    flex: 1;
    color: #2c2c2c;
    font-weight: 500;
}

.comp-qty {
    color: #999;
    font-size: 0.8rem;
    margin: 0 8px;
}

.component-item-mejorado {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #faf8f5;
    border-radius: 8px;
    margin-bottom: 8px;
    border: 1px solid #e8ddd7;
    transition: all 0.2s ease;
}

.component-item-mejorado:hover {
    background: #f5f1e8;
    border-color: #d4a574;
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.1);
}

.comp-info {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
}

.comp-controls {
    display: flex;
    align-items: center;
    gap: 8px;
}

.cantidad-control-mini {
    display: flex;
    align-items: center;
    gap: 4px;
    background: white;
    border: 1px solid #d4a574;
    border-radius: 6px;
    padding: 2px;
}

.btn-control-mini {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: #8B5A3C;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-control-mini:hover:not(:disabled) {
    background: #d4a574;
    color: white;
}

.btn-control-mini:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.btn-control-mini.minus span {
    line-height: 1;
    padding-bottom: 2px;
}

.btn-control-mini.plus span {
    line-height: 1;
}

.input-cantidad-componente {
    width: 45px;
    padding: 4px 6px;
    border: none;
    background: transparent;
    text-align: center;
    font-weight: 600;
    font-size: 0.9rem;
    color: #2c2c2c;
}

.input-cantidad-componente:focus {
    outline: none;
}

.btn-eliminar-componente {
    width: 32px;
    height: 32px;
    border: 1px solid #e8ddd7;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-eliminar-componente:hover {
    background: #ff4444;
    border-color: #ff4444;
    transform: scale(1.05);
}

.comp-price {
    color: #d4a574;
    font-weight: 600;
    min-width: 70px;
    text-align: right;
}

.card-quantity {
    display: flex;
    gap: 12px;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid #e8ddd7;
}

.card-quantity label {
    font-size: 0.9rem;
    color: #2c2c2c;
    font-weight: 600;
    white-space: nowrap;
}

.input-cantidad {
    width: 70px;
    padding: 8px 12px;
    border: 1px solid #d4a574;
    border-radius: 6px;
    text-align: center;
    font-weight: 600;
    font-size: 1rem;
}

.input-cantidad:focus {
    outline: none;
    border-color: #c89564;
    box-shadow: 0 0 0 2px rgba(212, 165, 116, 0.1);
}

.card-footer {
    padding: 16px;
    background: #faf8f5;
    border-top: 1px solid #e8ddd7;
}

.price-section {
    display: flex;
    justify-content: space-between;
    gap: 12px;
}

.price-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.price-item .label {
    font-size: 0.8rem;
    color: #999;
    font-weight: 600;
}

.price-item .value {
    font-size: 1rem;
    color: #2c2c2c;
    font-weight: 600;
}

.price-item.subtotal .value {
    font-size: 1.2rem;
    color: #d4a574;
}

/* Modal styles */
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
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 2px solid #e8ddd7;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.3rem;
    color: #5a4037;
}

.btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #999;
    transition: all 0.2s;
}

.btn-close:hover {
    color: #5a4037;
    transform: scale(1.2);
}

.modal-body {
    padding: 2rem;
}

.modal-body .form-group {
    margin-bottom: 1.5rem;
}

.modal-footer {
    padding: 1.5rem 2rem;
    border-top: 2px solid #e8ddd7;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.modal-modulos {
    max-width: 600px;
}

/* ===== MODAL: Selector de Materiales ===== */
.modal-selector {
    max-width: 600px;
}

.selector-list {
    max-height: 400px;
    overflow-y: auto;
    margin: 1rem 0;
    border: 1px solid #e8ddd7;
    border-radius: 8px;
}

.selector-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: all 0.2s ease;
}

.selector-item:hover {
    background: #faf8f5;
}

.selector-item.selected {
    background: linear-gradient(135deg, #fff5e6 0%, #ffe8cc 100%);
    border-left: 4px solid #d4a574;
}

.selector-item-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
}

.selector-icon {
    font-size: 2rem;
}

.selector-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.selector-name {
    font-weight: 700;
    color: #6B4423;
    font-size: 1rem;
}

.selector-description {
    font-size: 0.85rem;
    color: #8B5A3C;
}

.selector-price {
    font-size: 0.9rem;
    color: #d4a574;
    font-weight: 600;
}

.selector-check {
    font-size: 1.5rem;
    color: #d4a574;
}

.empty-selector {
    padding: 2rem;
    text-align: center;
    color: #999;
}

.cantidad-selector {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #faf8f5;
    border-radius: 8px;
    margin-top: 1rem;
}

.cantidad-selector label {
    font-weight: 600;
    color: #6B4423;
}

.cantidad-input-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.cantidad-input {
    width: 80px;
    padding: 0.5rem;
    border: 2px solid #e8ddd7;
    border-radius: 6px;
    text-align: center;
    font-size: 1rem;
    font-weight: 600;
}

.cantidad-input:focus {
    outline: none;
    border-color: #d4a574;
}

.search-box {
    margin-bottom: 1rem;
}

.search-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e8ddd7;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;
}

.search-input:focus {
    outline: none;
    border-color: #d4a574;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
}

/* ===== MODAL: Selector de Módulos Mejorado ===== */
.modal-modulos-mejorado {
    background: #ffffff;
    border-radius: 20px;
    width: 90%;
    max-width: 900px;
    max-height: 85vh;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
}

.modal-header-modulos {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    padding: 30px;
    text-align: center;
    position: relative;
    border-bottom: 3px solid rgba(255, 255, 255, 0.3);
}

.modal-header-modulos .modal-icon {
    font-size: 48px;
    margin-bottom: 10px;
    display: block;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.modal-header-modulos h3 {
    margin: 0;
    color: #ffffff;
    font-size: 28px;
    font-weight: 600;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-close-modulos {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.5);
    color: #ffffff;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-size: 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    padding: 0;
}

.btn-close-modulos:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg) scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.modal-body-modulos {
    padding: 30px;
    overflow-y: auto;
    max-height: calc(85vh - 140px);
}

.empty-state-mejorado {
    text-align: center;
    padding: 60px 20px;
    color: #666;
}

.empty-state-mejorado .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
    opacity: 0.5;
}

.empty-state-mejorado p {
    font-size: 18px;
    color: #999;
    margin: 0;
}

/* ===== MODAL: Selector de Clientes ===== */
.modal-clientes-mejorado {
    background: #ffffff;
    border-radius: 20px;
    width: 90%;
    max-width: 900px;
    max-height: 85vh;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
}

.modal-header-clientes {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    padding: 30px;
    text-align: center;
    position: relative;
    border-bottom: 3px solid rgba(255, 255, 255, 0.3);
}

.modal-header-clientes .modal-icon {
    font-size: 48px;
    margin-bottom: 10px;
    display: block;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.modal-header-clientes h3 {
    margin: 0;
    color: #ffffff;
    font-size: 28px;
    font-weight: 600;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-close-clientes {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.5);
    color: #ffffff;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    font-size: 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    padding: 0;
}

.btn-close-clientes:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg) scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.modal-body-clientes {
    padding: 30px;
    overflow-y: auto;
    max-height: calc(85vh - 140px);
}

.clientes-grid-selector {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.cliente-card-selector {
    background: white;
    border: 2px solid #e8ddd7;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.cliente-card-selector:hover {
    border-color: #d4a574;
    box-shadow: 0 12px 30px rgba(212, 165, 116, 0.3);
    transform: translateY(-8px) scale(1.02);
}

.cliente-card-selector.selected {
    border-color: #d4a574;
    border-width: 3px;
    box-shadow: 0 8px 20px rgba(212, 165, 116, 0.4);
}

.cliente-card-header {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    padding: 1.2rem;
    color: white;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.cliente-icon-large {
    font-size: 2.5rem;
    line-height: 1;
    flex-shrink: 0;
    filter: brightness(0) invert(1);
}

.cliente-info {
    flex: 1;
}

.cliente-info h4 {
    margin: 0 0 0.3rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
}

.cliente-empresa {
    margin: 0;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
}

.cliente-card-body {
    padding: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    background: #fafafa;
}

.cliente-detail {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 0.9rem;
}

.detail-icon {
    font-size: 1.2rem;
    flex-shrink: 0;
}

.detail-text {
    color: #666;
    flex: 1;
}

.cliente-card-action {
    padding: 16px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    text-align: center;
    color: #ffffff;
    font-weight: 600;
    font-size: 15px;
    transition: all 0.3s ease;
    border-top: 2px solid rgba(255, 255, 255, 0.2);
}

.cliente-card-action span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.cliente-card-selector:hover .cliente-card-action {
    background: linear-gradient(135deg, #c89564 0%, #b8845a 100%);
    padding: 18px 16px;
}

.modal-modulos-body {
    max-height: 450px;
    overflow-y: auto;
    padding: 0;
}

.modulos-lista {
    display: flex;
    flex-direction: column;
    gap: 0;
}

/* Grid de módulos en modal selector */
.modulos-grid-selector {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    padding: 0;
}

.modulo-card-selector {
    background: white;
    border: 2px solid #e8ddd7;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.modulo-card-selector:hover {
    border-color: #d4a574;
    box-shadow: 0 12px 30px rgba(212, 165, 116, 0.3);
    transform: translateY(-8px) scale(1.02);
}

.modulo-card-header {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    padding: 1.2rem;
    color: white;
    display: flex;
    align-items: center;
    gap: 12px;
}

.modulo-card-header .modulo-icon {
    font-size: 28px;
    line-height: 1;
    flex-shrink: 0;
}

.modulo-card-header h4 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 600;
    flex: 1;
}

.modulo-card-body {
    padding: 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.modulo-card-body .modulo-descripcion {
    margin: 0 0 1rem 0;
    font-size: 0.9rem;
    color: #666;
    line-height: 1.4;
    flex: 1;
}

.modulo-card-footer {
    margin-top: auto;
    padding-top: 0.8rem;
    border-top: 1px solid #f0f0f0;
}

.modulo-card-footer .modulo-price {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.95rem;
}

.modulo-card-footer .modulo-price .label {
    color: #666;
    font-weight: 500;
}

.modulo-card-footer .modulo-price .value {
    color: #d4a574;
    font-weight: 700;
    font-size: 1.1rem;
}

.modulo-stats {
    margin-top: 0.75rem;
    display: flex;
    gap: 1rem;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    color: #666;
}

.stat-icon {
    font-size: 1rem;
}

.modulo-card-action {
    padding: 16px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    text-align: center;
    color: #ffffff;
    font-weight: 600;
    font-size: 15px;
    transition: all 0.3s ease;
    border-top: 2px solid rgba(255, 255, 255, 0.2);
}

.modulo-card-action span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.modulo-card-selector:hover .modulo-card-action {
    background: linear-gradient(135deg, #c89564 0%, #b8845a 100%);
    padding: 18px 16px;
}

/* Estilos legacy para compatibilidad */
.modulo-item-selector {
    padding: 1.2rem 2rem;
    border-bottom: 1px solid #e8ddd7;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
}

.modulo-item-selector:hover {
    background: #f9f7f4;
    border-left: 4px solid #d4a574;
    padding-left: calc(2rem - 4px);
}

.modulo-info h4 {
    margin: 0 0 0.3rem 0;
    color: #2c2c2c;
    font-size: 1rem;
    font-weight: 600;
}

.modulo-codigo {
    margin: 0 0 0.5rem 0;
    font-size: 0.85rem;
    color: #999;
    font-weight: 500;
}

.modulo-descripcion {
    margin: 0.5rem 0 0.5rem 0;
    font-size: 0.9rem;
    color: #666;
    line-height: 1.3;
}

.modulo-price {
    margin: 0.5rem 0 0;
    font-size: 0.9rem;
    color: #d4a574;
    font-weight: 500;
}

.modulo-selector-icon {
    color: #d4a574;
    font-size: 1.2rem;
    font-weight: bold;
    flex-shrink: 0;
    margin-left: 1rem;
}

/* Modal mejorado de cantidad */
.modal-cantidad-mejorado {
    max-width: 480px;
    border-radius: 16px;
    overflow: hidden;
}

.modal-header-cantidad {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    padding: 2rem;
    text-align: center;
    position: relative;
}

.modal-header-cantidad .modal-icon {
    font-size: 3rem;
    margin-bottom: 0.5rem;
}

.modal-header-cantidad h3 {
    color: white;
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
}

.btn-close-cantidad {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    padding: 0;
    transition: all 0.2s;
}

.btn-close-cantidad:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
}

.modal-body-cantidad {
    padding: 2rem;
}

.modulo-preview {
    background: #f9f7f4;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    margin-bottom: 2rem;
}

.preview-icon {
    font-size: 2.5rem;
    flex-shrink: 0;
}

.preview-info h4 {
    margin: 0 0 0.5rem 0;
    color: #2c2c2c;
    font-size: 1.1rem;
    font-weight: 600;
}

.preview-info p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
    line-height: 1.4;
}

.cantidad-section {
    text-align: center;
}

.cantidad-label {
    display: block;
    font-size: 0.95rem;
    font-weight: 600;
    color: #666;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.cantidad-control {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    margin: 1rem 0;
}

.cantidad-control label {
    font-weight: 600;
    color: #5a4037;
    margin-right: 0.5rem;
}

.cantidad-input-group {
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.btn-cantidad-control {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px solid #d4a574;
    background: white;
    color: #d4a574;
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-cantidad-control:hover:not(:disabled) {
    background: #d4a574;
    color: white;
    transform: scale(1.1);
}

.btn-cantidad-control:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.btn-cantidad-control.minus span {
    margin-bottom: 2px;
}

.cantidad-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.input-cantidad-mejorado {
    width: 80px;
    height: 60px;
    text-align: center;
    font-size: 2rem;
    font-weight: bold;
    color: #2c2c2c;
    border: 3px solid #e8ddd7;
    border-radius: 12px;
    background: #fef5e7;
    transition: all 0.2s;
}

.input-cantidad-mejorado:focus {
    outline: none;
    border-color: #d4a574;
    background: white;
}

.cantidad-unidad {
    font-size: 0.85rem;
    color: #999;
    font-weight: 500;
}

.modal-footer-cantidad {
    padding: 1.5rem 2rem;
    background: #f9f7f4;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    border-top: 1px solid #e8ddd7;
}

/* Estilos para el modal de edición de componente */
.modal-editar-componente-grande {
    max-width: 900px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
}

.modal-body-editar-componente {
    padding: 2rem;
    overflow-y: auto;
    flex: 1;
}

.componente-info-header {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid #e8ddd7;
}

.componente-nombre-grande {
    font-size: 1.5rem;
    color: #6B4423;
    margin: 0 0 0.75rem 0;
    font-weight: 700;
}

.componente-meta {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
}

.meta-badge {
    background: linear-gradient(135deg, #6B4423 0%, #8B5A3C 100%);
    color: white;
    padding: 0.4rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
}

.meta-price {
    color: #059669;
    font-weight: 700;
    font-size: 1.1rem;
}

.tabs-container {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid #e8ddd7;
    overflow-x: auto;
}

.tab-btn {
    background: transparent;
    border: none;
    padding: 0.875rem 1.5rem;
    font-size: 0.95rem;
    font-weight: 600;
    color: #8B5A3C;
    cursor: pointer;
    transition: all 0.3s ease;
    border-bottom: 3px solid transparent;
    white-space: nowrap;
}

.tab-btn:hover {
    color: #6B4423;
    background: rgba(212, 165, 116, 0.1);
}

.tab-btn.active {
    color: #6B4423;
    border-bottom-color: #d4a574;
    background: rgba(212, 165, 116, 0.15);
}

.tab-content {
    min-height: 300px;
}

.tab-panel {
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.tab-panel-header {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.tab-panel-header h5 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    color: #6B4423;
    font-weight: 700;
}

.tab-description {
    margin: 0;
    color: #8B5A3C;
    font-size: 0.95rem;
}

.btn-add-item {
    align-self: flex-start;
    background: linear-gradient(135deg, #d4a574 0%, #b8865e 100%);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.6rem 1.2rem;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(139, 90, 60, 0.2);
}

.btn-add-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 90, 60, 0.3);
    background: linear-gradient(135deg, #b8865e 0%, #d4a574 100%);
}

.btn-add-item .btn-icon {
    font-size: 1rem;
    margin: 0;
    padding: 0;
}

.items-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.item-card {
    background: linear-gradient(135deg, #faf8f5 0%, #f5f3f0 100%);
    border: 2px solid #e8ddd7;
    border-radius: 12px;
    padding: 1.25rem;
    transition: all 0.3s ease;
}

.item-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(139, 90, 60, 0.15);
    border-color: #d4a574;
}

.item-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #e8ddd7;
}

.item-icon {
    font-size: 1.5rem;
    line-height: 1;
}

.item-name {
    font-size: 1.1rem;
    font-weight: 700;
    color: #6B4423;
    flex: 1;
}

.btn-delete-item {
    background: #ff4444;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.4rem 0.8rem;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    line-height: 1;
}

.btn-delete-item:hover {
    background: #cc0000;
    transform: scale(1.1);
}

.item-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.item-detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.4rem 0;
}

.cantidad-controls {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    background: white;
    border-radius: 8px;
    padding: 0.3rem 0.6rem;
    border: 1px solid #e8ddd7;
}

.btn-cantidad {
    background: #d4a574;
    color: white;
    border: none;
    border-radius: 6px;
    width: 28px;
    height: 28px;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    line-height: 1;
}

.btn-cantidad:hover {
    background: #b8865e;
    transform: scale(1.1);
}

.btn-cantidad:active {
    transform: scale(0.95);
}

.cantidad-controls .detail-value {
    min-width: 40px;
    text-align: center;
    font-weight: 700;
    color: #6B4423;
}

.item-detail-row.subtotal {
    margin-top: 0.5rem;
    padding-top: 0.75rem;
    border-top: 2px dashed #d4a574;
    font-weight: 700;
}

.detail-label {
    color: #8B5A3C;
    font-size: 0.95rem;
    font-weight: 500;
}

.detail-value {
    color: #6B4423;
    font-size: 0.95rem;
    font-weight: 600;
}

.item-detail-row.subtotal .detail-value {
    color: #059669;
    font-size: 1.05rem;
}

.empty-tab-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #8B5A3C;
}

.empty-tab-state .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.empty-tab-state p {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 500;
}

.modal-actions-group {
    display: flex;
    gap: 1rem;
    flex: 1;
    justify-content: flex-end;
}

.btn-modal-cancel,
.btn-modal-confirm,
.btn-modal-secondary {
    padding: 0.9rem 1.5rem;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.btn-modal-secondary {
    background: white;
    color: #d4a574;
    border: 2px solid #d4a574;
    padding: 0.9rem 1.2rem;
}

.btn-modal-secondary:hover {
    background: #d4a574;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.2);
}

.btn-modal-cancel {
    background: white;
    color: #666;
    border: 2px solid #e0e0e0;
    flex: 1;
}

.btn-modal-cancel:hover {
    background: #f5f5f5;
    border-color: #d0d0d0;
}

.btn-modal-confirm {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    flex: 1;
}

.btn-modal-confirm:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

/* Legacy styles */
.modal-cantidad {
    max-width: 400px;
}

.modal-item {
    margin-bottom: 1.5rem;
}

.modal-label {
    display: block;
    font-weight: 600;
    color: #2c2c2c;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
}

.modal-value {
    padding: 0.75rem 1rem;
    background: #f9f7f4;
    border-radius: 6px;
    border: 1px solid #e8ddd7;
    color: #2c2c2c;
    font-weight: 500;
}

.precio-highlight {
    background: #fef5e7;
    border-color: #d4a574;
    color: #d4a574;
    font-weight: 600;
    font-size: 1.1rem;
}

.cantidad-editor {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.btn-cantidad-minus,
.btn-cantidad-plus {
    width: 36px;
    height: 36px;
    padding: 0;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.2rem;
    font-weight: 700;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.3);
}

.btn-cantidad-minus:hover,
.btn-cantidad-plus:hover {
    background: linear-gradient(135deg, #c89564 0%, #b88554 100%);
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.4);
}

.input-cantidad-modal {
    width: 60px;
    padding: 8px;
    border: 2px solid #d4a574;
    border-radius: 8px;
    text-align: center;
    font-weight: 700;
    font-size: 1.1rem;
    color: #5a4037;
}

.input-cantidad-modal:focus {
    outline: none;
    border-color: #c89564;
    box-shadow: 0 0 0 2px rgba(212, 165, 116, 0.1);
}

.subtotal-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.2rem;
    background: linear-gradient(135deg, #6B4423 0%, #8B5A3C 100%);
    color: white;
    border-radius: 12px;
    margin-top: 1.5rem;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(107, 68, 35, 0.2);
}

.subtotal-display .label {
    font-size: 1rem;
}

.subtotal-display .value {
    font-size: 1.4rem;
    font-weight: 700;
}

.cantidad-unit {
    color: #999;
    font-size: 0.9rem;
    font-weight: 500;
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

.form-input {
    padding: 12px 16px;
    border: 2px solid #e8ddd7;
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    transition: all 0.2s;
}

.form-input:focus {
    outline: none;
    border-color: #d4a574;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
}

/* Botón selector de cliente */
.btn-selector-cliente {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 12px 16px;
    background: white;
    border: 2px solid #e8ddd7;
    border-radius: 10px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
}

.btn-selector-cliente:hover {
    border-color: #d4a574;
    background: #faf8f5;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.15);
}

.cliente-icon {
    font-size: 1.5rem;
    line-height: 1;
}

.cliente-nombre {
    flex: 1;
    color: #2c2c2c;
    font-weight: 600;
}

.cliente-placeholder {
    flex: 1;
    color: #999;
    font-weight: 500;
}

.selector-arrow {
    color: #d4a574;
    font-size: 0.8rem;
    transition: transform 0.3s ease;
}

.btn-selector-cliente:hover .selector-arrow {
    transform: translateY(3px);
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

.info-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.2rem;
    background: linear-gradient(135deg, #faf8f5 0%, #f5f3f0 100%);
    border-radius: 12px;
    border: 2px solid #e8ddd7;
    transition: all 0.3s ease;
}

.info-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(212, 165, 116, 0.15);
    border-color: #d4a574;
}

.info-icon {
    font-size: 2rem;
    line-height: 1;
    flex-shrink: 0;
}

.info-content {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    flex: 1;
}

.info-label {
    font-size: 0.8rem;
    color: #999;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-value {
    font-size: 1rem;
    color: #2c2c2c;
    font-weight: 600;
}

.modulo-card {
    background: #fafafa;
    border: 1px solid #e8ddd7;
    border-radius: 10px;
    margin-bottom: 1.5rem;
    overflow: hidden;
}

.modulo-header {
    background: linear-gradient(135deg, #6B4423, #8B5A3C);
    color: #F5F1E8;
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
    background: rgba(245, 241, 232, 0.2);
    border: 1px solid rgba(245, 241, 232, 0.4);
    color: #F5F1E8;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    white-space: nowrap;
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

.resumen-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.resumen-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.resumen-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: #faf8f5;
    border-radius: 12px;
    border: 2px solid #e8ddd7;
    transition: all 0.3s ease;
}

.resumen-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.resumen-item.total {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    border-color: #c89564;
    box-shadow: 0 6px 20px rgba(212, 165, 116, 0.3);
}

.resumen-item.total:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(212, 165, 116, 0.4);
}

.resumen-item.total .resumen-label,
.resumen-item.total .resumen-value {
    color: white;
}

.resumen-icon {
    font-size: 2.5rem;
    line-height: 1;
    flex-shrink: 0;
}

.resumen-item.total .resumen-icon {
    filter: brightness(0) invert(1);
}

.resumen-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
}

.resumen-label {
    font-size: 0.9rem;
    color: #666;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.resumen-value {
    font-size: 2rem;
    color: #2c2c2c;
    font-weight: 700;
}

.form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding-top: 1.5rem;
    border-top: 2px solid #e8ddd7;
}

.btn-primary,
.btn-cancel {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 14px 32px;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.95rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-cancel {
    background: white;
    color: #666;
    border: 2px solid #e0e0e0;
}

.btn-cancel:hover {
    background: #f5f5f5;
    border-color: #d0d0d0;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.btn-primary {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(212, 165, 116, 0.4);
    background: linear-gradient(135deg, #c89564 0%, #b8845a 100%);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 14px 32px;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.95rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
    color: white;
}

.btn-secondary:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
    background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.btn-secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.section-header-inline {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.section-subtitle {
    color: #999;
    font-size: 0.9rem;
    font-weight: 500;
    margin: 0;
}

.cliente-section,
.modulos-section,
.resumen-section {
    border: 2px solid #e8ddd7;
    transition: all 0.3s ease;
}

.info-section {
    border-left: 4px solid #d4a574;
}

.cliente-section {
    border-left: 4px solid #4caf50;
}

.modulos-section {
    border-left: 4px solid #2196f3;
}

.resumen-section {
    background: linear-gradient(135deg, #faf8f5 0%, #f5f3f0 100%);
    border: 3px solid #d4a574 !important;
    border-left: 3px solid #d4a574 !important;
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

.btn-cancel {
    background: #e8ddd7;
    color: #5a4037;
}

.btn-cancel:hover {
    background: #ccc;
    color: #333;
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

.alert-success {
    background: #e8f5e9;
    color: #2e7d32;
    border: 2px solid #66bb6a;
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

/* Estilos para selector de componentes */
.btn-agregar-componente {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.8rem 1rem;
    margin-top: 0.8rem;
    background: linear-gradient(135deg, #d4a574 0%, #8B5A3C 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-agregar-componente:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 90, 60, 0.3);
}

.modal-componentes-mejorado {
    width: 90%;
    max-width: 800px;
}

.modal-header-componentes {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #6B4423 0%, #8B5A3C 100%);
    color: white;
    border-radius: 15px 15px 0 0;
}

.modal-header-componentes h3 {
    flex: 1;
    margin: 0;
    font-size: 1.3rem;
}

.btn-close-componentes {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 1.5rem;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    padding: 0;
    transition: all 0.2s ease;
}

.btn-close-componentes:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
}

.modal-body-componentes {
    padding: 2rem;
    max-height: 500px;
    overflow-y: auto;
}

.search-box {
    margin-bottom: 1.5rem;
    position: relative;
}

.search-input {
    width: 100%;
    padding: 14px 20px 14px 48px;
    border: 2px solid #e8ddd7;
    border-radius: 12px;
    font-size: 1rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-box::before {
    content: '🔍';
    position: absolute;
    left: 18px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.1rem;
    pointer-events: none;
}

.search-input:focus {
    outline: none;
    border-color: #d4a574;
    box-shadow: 0 4px 16px rgba(212, 165, 116, 0.2), 0 0 0 4px rgba(212, 165, 116, 0.1);
    transform: translateY(-1px);
}

.search-input::placeholder {
    color: #999;
    font-weight: 500;
}

.componentes-grid-selector {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
}

.componente-card-selector {
    background: linear-gradient(135deg, #faf8f5 0%, #f5f3f0 100%);
    border: 2px solid #e8ddd7;
    border-radius: 16px;
    padding: 1.8rem;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.componente-card-selector::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #d4a574, #c89564, #d4a574);
    transform: translateX(-100%);
    transition: transform 0.4s ease;
}

.componente-card-selector:hover::before {
    transform: translateX(0);
}

.componente-card-selector:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 16px 40px rgba(139, 90, 60, 0.25);
    border-color: #d4a574;
    background: linear-gradient(135deg, #ffffff 0%, #faf8f5 100%);
}

.componente-card-selector:active {
    transform: translateY(-4px) scale(0.99);
}

.componente-card-header {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1rem;
}

.componente-icon {
    font-size: 2rem;
}

.componente-card-header h4 {
    margin: 0;
    font-size: 1.1rem;
    color: #6B4423;
}

.componente-card-body {
    color: #666;
}

.componente-card-body p {
    margin: 0 0 0.8rem 0;
    font-size: 0.9rem;
}

.componente-precio {
    font-size: 1.4rem;
    font-weight: 800;
    background: linear-gradient(135deg, #d4a574 0%, #8b5a3c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.5px;
    display: inline-block;
    position: relative;
}

.componente-precio::before {
    content: '💰';
    position: absolute;
    left: -30px;
    top: 50%;
    transform: translateY(-50%);
    -webkit-text-fill-color: #d4a574;
    font-size: 1.2rem;
}

.modal-cantidad-componente {
    width: 90%;
    max-width: 500px;
}

.modal-header-cantidad {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    background: linear-gradient(135deg, #6B4423 0%, #8B5A3C 100%);
    color: white;
    border-radius: 15px 15px 0 0;
}

.modal-header-cantidad h3 {
    margin: 0;
    font-size: 1.3rem;
}

.modal-body-cantidad {
    padding: 2rem;
}

.cantidad-info {
    margin-bottom: 1.5rem;
    padding: 1.2rem;
    background: linear-gradient(135deg, #faf8f5 0%, #f5f3f0 100%);
    border-radius: 12px;
    border: 1px solid #e8ddd7;
}

.cantidad-info p {
    margin: 0.5rem 0;
    color: #5a4037;
    line-height: 1.6;
}

.modal-footer-cantidad {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    border-top: 2px solid #e8ddd7;
}

.btn-secondary-modal {
    flex: 1;
    padding: 0.8rem 1.5rem;
    background: #e8ddd7;
    color: #6B4423;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-secondary-modal:hover {
    background: #d4a574;
    transform: translateY(-2px);
}

.btn-primary-modal {
    flex: 1;
    padding: 0.8rem 1.5rem;
    background: linear-gradient(135deg, #d4a574 0%, #8B5A3C 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-primary-modal:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 90, 60, 0.3);
}

.btn-primary-modal:disabled {
    background: linear-gradient(135deg, #9e9e9e 0%, #757575 100%);
    cursor: not-allowed;
    opacity: 0.6;
}

.btn-primary-modal:disabled:hover {
    transform: none;
    box-shadow: none;
}

.modulo-select {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e8ddd7;
    border-radius: 10px;
    font-size: 1rem;
    background: white;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 1rem;
}

.modulo-select:focus {
    outline: none;
    border-color: #d4a574;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
}

.modulo-select option {
    padding: 10px;
}

/* Vista plana de componentes */
.componentes-list-flat {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

/* Transiciones para agregar/eliminar componentes */
.component-list-enter-active {
    transition: all 2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.component-list-leave-active {
    transition: all 2s cubic-bezier(0.55, 0.085, 0.68, 0.53);
}

.component-list-enter-from {
    opacity: 0;
    transform: translateY(-30px) scale(0.9);
}

.component-list-leave-to {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
}

.component-list-move {
    transition: transform 2s cubic-bezier(0.55, 0, 0.1, 1);
}

/* Transiciones para los modales */
.modal-enter-active {
    transition: all 0.3s ease-out;
}

.modal-leave-active {
    transition: all 0.25s ease-in;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
    transform: scale(0.9) translateY(-20px);
}

.modal-enter-active .modal-content {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-leave-active .modal-content {
    transition: transform 0.25s ease-in;
}

.component-item-card {
    background: linear-gradient(135deg, #faf8f5 0%, #f5f3f0 100%);
    border: 2px solid #e8ddd7;
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.3s ease;
}

.component-item-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(139, 90, 60, 0.15);
    border-color: #d4a574;
}

.component-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.component-badge {
    background: linear-gradient(135deg, #6B4423 0%, #8B5A3C 100%);
    color: white;
    padding: 0.4rem 1rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
}

.component-actions-group {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.btn-editar-componente-card {
    background: rgba(59, 130, 246, 0.1);
    border: none;
    color: #3b82f6;
    font-size: 1.2rem;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-editar-componente-card:hover {
    background: #3b82f6;
    color: white;
    transform: scale(1.1);
}

.btn-eliminar-componente-card {
    background: rgba(220, 38, 38, 0.1);
    border: none;
    color: #dc2626;
    font-size: 1.2rem;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-eliminar-componente-card:hover {
    background: #dc2626;
    color: white;
    transform: scale(1.1);
}

.component-card-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.comp-info-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.comp-name-large {
    font-size: 1.3rem;
    font-weight: 700;
    color: #6B4423;
}

.comp-price-large {
    font-size: 1.2rem;
    font-weight: 700;
    color: #8B5A3C;
}

.comp-controls-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.cantidad-control-large {
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.btn-control-large {
    background: linear-gradient(135deg, #d4a574 0%, #8B5A3C 100%);
    border: none;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-control-large:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 90, 60, 0.3);
}

.btn-control-large:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.input-cantidad-large {
    width: 80px;
    padding: 0.6rem;
    border: 2px solid #e8ddd7;
    border-radius: 8px;
    text-align: center;
    font-size: 1.1rem;
    font-weight: 600;
    color: #6B4423;
}

.comp-subtotal {
    font-size: 1.1rem;
    font-weight: 700;
    color: #8B5A3C;
    padding: 0.6rem 1.2rem;
    background: rgba(212, 165, 116, 0.15);
    border-radius: 8px;
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

    .info-grid {
        grid-template-columns: 1fr;
    }

    .table-header,
    .table-row {
        grid-template-columns: 1fr;
        gap: 12px;
        padding: 16px 16px;
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
