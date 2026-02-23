<template>
    <div class="editar-componente-container">
        <!-- Header -->
        <div class="page-header">
            <div class="header-left">
                <button class="btn-back" @click="$router.push('/componentes')">
                    <span class="back-arrow">←</span> Volver
                </button>
                <div class="header-text">
                    <h1 class="page-title">Editar Componente</h1>
                    <p class="header-subtitle">{{ formData.nombre || 'Cargando...' }}</p>
                </div>
            </div>
            <div class="header-right">
                <span class="badge badge-code">{{ formData.codigo || '---' }}</span>
                <span v-if="guardando" class="badge badge-saving">⏳ Guardando...</span>
                <span v-else class="badge badge-status">✓ Listo</span>
            </div>
        </div>

        <!-- Mensaje de error -->
        <transition name="fade">
            <div v-if="error" class="alert alert-error">
                <span class="alert-icon">⚠️</span>
                <span class="alert-text">{{ error }}</span>
                <button @click="error = null" class="alert-close">×</button>
            </div>
        </transition>

        <!-- Mensaje personalizado (warning/success/info) -->
        <transition name="slide-down">
            <div v-if="mensaje" class="custom-message" :class="`message-${tipoMensaje}`">
                <div class="message-content">
                    <span class="message-text">{{ mensaje }}</span>
                    <button @click="cerrarMensaje" class="message-close">✕</button>
                </div>
            </div>
        </transition>

        <!-- Loading -->
        <div v-if="cargando" class="loading-state">
            <div class="spinner"></div>
            <p>Cargando componente...</p>
        </div>

        <!-- Formulario -->
        <form v-else @submit.prevent="guardarComponente">
            <!-- Resumen superior -->
            <div class="stats-bar">
                <div class="stat-card">
                    <div class="stat-icon">🪵</div>
                    <div class="stat-content">
                        <span class="stat-label">Tableros</span>
                        <strong class="stat-value">{{ tablerosDelComponente.length }} <small>tipos</small> · {{ totalCantidadTableros }} <small>u</small></strong>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🏗️</div>
                    <div class="stat-content">
                        <span class="stat-label">Estructuras</span>
                        <strong class="stat-value">{{ estructurasDelComponente.length }} <small>tipos</small> · {{ totalCantidadEstructuras }} <small>u</small></strong>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🎨</div>
                    <div class="stat-content">
                        <span class="stat-label">Cubre Cantos</span>
                        <strong class="stat-value">{{ acabadoCubreCantosDelComponente.length }} <small>tipos</small> · {{ totalCantidadCubreCantos }} <small>u</small></strong>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📋</div>
                    <div class="stat-content">
                        <span class="stat-label">Materiales</span>
                        <strong class="stat-value">{{ materialesDelComponente.length }} <small>tipos</small></strong>
                    </div>
                </div>
                <div class="stat-card stat-card--highlight">
                    <div class="stat-icon">💰</div>
                    <div class="stat-content">
                        <span class="stat-label">Costo total</span>
                        <strong class="stat-value">${{ formatCurrency(totalCostoTableros + totalCostoEstructuras + totalCostoCubreCantos) }}</strong>
                    </div>
                </div>
            </div>

            <!-- Datos Generales -->
            <div class="info-card">
                <h2 class="section-title">📌 Datos Generales</h2>
                <div class="info-grid">
                    <div class="form-group">
                        <label for="nombre" class="form-label">Nombre *</label>
                        <input
                            v-model="formData.nombre"
                            type="text"
                            id="nombre"
                            class="form-input"
                            placeholder="Ej: Tablero MDF"
                            required
                        />
                        <span v-if="errors.nombre" class="error-text">{{ errors.nombre }}</span>
                    </div>

                    <div class="form-group">
                        <label for="codigo" class="form-label">Código</label>
                        <input
                            v-model="formData.codigo"
                            type="text"
                            id="codigo"
                            class="form-input"
                            placeholder="Ej: TAB_MDF_001"
                        />
                    </div>

                    <div class="form-group full-width">
                        <label for="descripcion" class="form-label">Descripción</label>
                        <textarea
                            v-model="formData.descripcion"
                            id="descripcion"
                            class="form-input textarea-input"
                            placeholder="Descripción detallada del componente"
                            rows="3"
                        ></textarea>
                    </div>
                </div>
            </div>

            <!-- Tableros Asociados -->
            <div class="info-card">
                <div class="section-header">
                    <h2 class="section-title">🪵 Tableros Asociados</h2>
                    <button type="button" class="btn-action-header" @click="abrirSelectorTableros">
                        + Gestionar
                    </button>
                </div>

                <div v-if="tablerosDelComponente.length > 0">
                    <div class="tableros-metrics">
                        <div class="metric-pill">
                            <span class="metric-number">{{ tablerosDelComponente.length }}</span>
                            <span class="metric-label">Tipos</span>
                        </div>
                        <div class="metric-pill">
                            <span class="metric-number">{{ totalCantidadTableros }}</span>
                            <span class="metric-label">Unidades</span>
                        </div>
                        <div class="metric-pill metric-pill--accent">
                            <span class="metric-number">${{ formatCurrency(totalCostoTableros) }}</span>
                            <span class="metric-label">Costo total</span>
                        </div>
                    </div>

                    <div
                        v-for="item in tablerosOrdenadosParaVista"
                        :key="`tablero-inline-${item.id}`"
                        class="tablero-card"
                    >
                        <div class="tablero-card-left">
                            <div class="tablero-avatar">🪵</div>
                            <div class="tablero-info">
                                <div class="tablero-name">{{ obtenerNombreTablero(item) }}</div>
                                <div class="tablero-code">{{ obtenerCodigoTablero(item) }}</div>
                            </div>
                        </div>
                        <div class="tablero-card-center">
                            <div class="tablero-pricing">
                                <span class="tablero-unit-price">${{ formatCurrency(obtenerCostoUnitarioTablero(item)) }} <small>c/u</small></span>
                                <span class="tablero-subtotal">${{ formatCurrency(obtenerSubtotalTablero(item)) }}</span>
                            </div>
                        </div>
                        <div class="tablero-card-right">
                            <div class="quantity-controls-compact">
                                <button type="button" class="btn-qty btn-qty--minus" @click="decrementarCantidadTablero(item)" title="Disminuir">−</button>
                                <input
                                    v-model.number="item.cantidad"
                                    type="number" min="1" step="1" placeholder="1"
                                    @blur="guardarCantidadTablero(item)"
                                    @keyup.enter="guardarCantidadTablero(item)"
                                    class="qty-input"
                                />
                                <button type="button" class="btn-qty btn-qty--plus" @click="incrementarCantidadTablero(item)" title="Aumentar">+</button>
                            </div>
                            <button type="button" class="btn-delete-sm" @click="removerTablero(item)" title="Eliminar">🗑</button>
                        </div>
                    </div>
                </div>

                <div v-else class="empty-state-inline">
                    <div class="empty-icon">🪵</div>
                    <p>No hay tableros asignados</p>
                    <button type="button" class="btn-empty-action" @click="abrirSelectorTableros">+ Agregar Tablero</button>
                </div>
            </div>

            <!-- Estructuras Asociadas -->
            <EntityCardList
                icon="🏗️"
                titulo="Estructuras Asociadas"
                label-singular="estructura"
                key-prefix="estructura"
                :items="estructurasDelComponente"
                :items-ordenados="estructurasOrdenadasParaVista"
                :total-cantidad="totalCantidadEstructuras"
                :total-costo="totalCostoEstructuras"
                :obtener-nombre="obtenerNombreEstructura"
                :obtener-codigo="obtenerCodigoEstructura"
                :obtener-costo-unitario="obtenerCostoUnitarioEstructura"
                :obtener-subtotal="obtenerSubtotalEstructura"
                :format-currency="formatCurrency"
                @gestionar="abrirSelectorEstructuras"
                @incrementar="incrementarCantidadEstructura"
                @decrementar="decrementarCantidadEstructura"
                @guardar-cantidad="guardarCantidadEstructura"
                @remover="removerEstructura"
            />

            <!-- Acabado Cubre Cantos Asociados -->
            <div class="info-card">
                <div class="section-header">
                    <h2 class="section-title">🎨 Cubre Cantos Asociados</h2>
                    <button type="button" class="btn-action-header" @click="abrirSelectorCubreCantos">
                        + Gestionar
                    </button>
                </div>

                <div v-if="acabadoCubreCantosDelComponente.length > 0">
                    <div class="tableros-metrics">
                        <div class="metric-pill">
                            <span class="metric-number">{{ acabadoCubreCantosDelComponente.length }}</span>
                            <span class="metric-label">Tipos</span>
                        </div>
                        <div class="metric-pill">
                            <span class="metric-number">{{ totalCantidadCubreCantos }}</span>
                            <span class="metric-label">Unidades</span>
                        </div>
                        <div class="metric-pill metric-pill--accent">
                            <span class="metric-number">${{ formatCurrency(totalCostoCubreCantos) }}</span>
                            <span class="metric-label">Costo total</span>
                        </div>
                    </div>

                    <div
                        v-for="item in cubreCantosOrdenadosParaVista"
                        :key="`cc-inline-${item.id}`"
                        class="tablero-card"
                    >
                        <div class="tablero-card-left">
                            <div class="tablero-avatar">🎨</div>
                            <div class="tablero-info">
                                <div class="tablero-name">{{ obtenerNombreCubreCanto(item) }}</div>
                                <div class="tablero-code">{{ obtenerCodigoCubreCanto(item) }}</div>
                            </div>
                        </div>
                        <div class="tablero-card-center">
                            <div class="tablero-pricing">
                                <span class="tablero-unit-price">${{ formatCurrency(obtenerCostoUnitarioCubreCanto(item)) }} <small>c/u</small></span>
                                <span class="tablero-subtotal">${{ formatCurrency(obtenerSubtotalCubreCanto(item)) }}</span>
                            </div>
                        </div>
                        <div class="tablero-card-right">
                            <div class="quantity-controls-compact">
                                <button type="button" class="btn-qty btn-qty--minus" @click="decrementarCantidadCubreCanto(item)" title="Disminuir">−</button>
                                <input
                                    v-model.number="item.cantidad"
                                    type="number" min="1" step="1" placeholder="1"
                                    @blur="guardarCantidadCubreCanto(item)"
                                    @keyup.enter="guardarCantidadCubreCanto(item)"
                                    class="qty-input"
                                />
                                <button type="button" class="btn-qty btn-qty--plus" @click="incrementarCantidadCubreCanto(item)" title="Aumentar">+</button>
                            </div>
                            <button type="button" class="btn-delete-sm" @click="removerCubreCanto(item)" title="Eliminar">🗑</button>
                        </div>
                    </div>
                </div>

                <div v-else class="empty-state-inline">
                    <div class="empty-icon">🎨</div>
                    <p>No hay cubre cantos asignados</p>
                    <button type="button" class="btn-empty-action" @click="abrirSelectorCubreCantos">+ Agregar Cubre Canto</button>
                </div>
            </div>

            <!-- Materiales Asociados -->
            <div class="info-card">
                <div class="section-header">
                    <h2 class="section-title">📋 Materiales Asociados</h2>
                    <button type="button" class="btn-action-header" @click="mostrarModalMateriales = true">
                        + Gestionar
                    </button>
                </div>

                <div v-if="materialesDelComponente.length > 0">
                    <div class="tableros-metrics">
                        <div class="metric-pill">
                            <span class="metric-number">{{ materialesDelComponente.length }}</span>
                            <span class="metric-label">Tipos</span>
                        </div>
                        <div class="metric-pill metric-pill--accent">
                            <span class="metric-number">${{ formatCurrency(materialesDelComponente.reduce((sum, m) => sum + ((m.material?.costo_unitario || 0) * (m.cantidad || 1)), 0)) }}</span>
                            <span class="metric-label">Costo total</span>
                        </div>
                    </div>

                    <div
                        v-for="mat in materialesDelComponente"
                        :key="`mat-inline-${mat.id}`"
                        class="tablero-card"
                    >
                        <div class="tablero-card-left">
                            <div class="tablero-avatar">📋</div>
                            <div class="tablero-info">
                                <div class="tablero-name">{{ mat.material?.nombre || 'Material' }}</div>
                                <div class="tablero-code">{{ mat.material?.codigo || '' }}</div>
                            </div>
                        </div>
                        <div class="tablero-card-center">
                            <div class="tablero-pricing">
                                <span class="tablero-unit-price">${{ formatCurrency(mat.material?.costo_unitario || 0) }} <small>c/u</small></span>
                                <span class="tablero-subtotal">${{ formatCurrency((mat.material?.costo_unitario || 0) * (mat.cantidad || 1)) }}</span>
                            </div>
                        </div>
                        <div class="tablero-card-right">
                            <div class="quantity-controls-compact">
                                <button type="button" class="btn-qty btn-qty--minus" @click="decrementarCantidad(mat)" title="Disminuir">−</button>
                                <input
                                    v-model.number="mat.cantidad"
                                    type="number" min="1" step="1" placeholder="1"
                                    @blur="guardarCantidadMaterial(mat)"
                                    @keyup.enter="guardarCantidadMaterial(mat)"
                                    class="qty-input"
                                />
                                <button type="button" class="btn-qty btn-qty--plus" @click="incrementarCantidad(mat)" title="Aumentar">+</button>
                            </div>
                            <button type="button" class="btn-delete-sm" @click="removerMaterial(mat.id)" title="Eliminar">🗑</button>
                        </div>
                    </div>
                </div>

                <div v-else class="empty-state-inline">
                    <div class="empty-icon">📋</div>
                    <p>No hay materiales asignados</p>
                    <button type="button" class="btn-empty-action" @click="mostrarModalMateriales = true">+ Agregar Material</button>
                </div>
            </div>

            <!-- Acabado del Componente -->
            <div class="info-card">
                <div class="section-header">
                    <h2 class="section-title">🎨 Acabado del Componente</h2>
                    <button type="button" class="btn-action-header" @click="abrirSelectorAcabados">
                        {{ formData.acabado ? '🔄 Cambiar' : '+ Seleccionar' }}
                    </button>
                </div>

                <div v-if="formData.acabado" class="acabado-card-inline">
                    <div class="acabado-card-icon">🎨</div>
                    <div class="acabado-card-info">
                        <div class="acabado-card-name">{{ formData.acabado.nombre }}</div>
                        <div class="acabado-card-desc">{{ formData.acabado.descripcion || 'Sin descripción' }}</div>
                    </div>
                    <div class="acabado-card-price">
                        <span class="acabado-price-label">Costo</span>
                        <span class="acabado-price-value">${{ formatCurrency(formData.acabado.costo) }}</span>
                    </div>
                </div>

                <div v-else class="empty-state-inline">
                    <div class="empty-icon">🎨</div>
                    <p>No hay acabado asignado</p>
                    <button type="button" class="btn-empty-action" @click="abrirSelectorAcabados">+ Seleccionar Acabado</button>
                </div>
            </div>

            <!-- Acciones -->
            <div class="form-actions form-actions--sticky">
                <button type="button" class="btn-secondary" @click="$router.back()">
                    ← Cancelar
                </button>
                <button type="submit" class="btn-primary" :disabled="guardando">
                    <span v-if="guardando">⏳ Guardando...</span>
                    <span v-else>💾 Guardar Cambios</span>
                </button>
            </div>
        </form>

        <!-- Modal Materiales -->
        <div v-if="mostrarModalMateriales" class="modal-overlay" @click.self="mostrarModalMateriales = false">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">📋 Editar Materiales</h3>
                </div>
                <div class="modal-body">
                    <!-- Sección para agregar nuevo material -->
                    <div class="add-section">
                        <button 
                            type="button" 
                            class="btn-add-material"
                            @click="abrirSelectorMateriales()"
                        >+ Agregar Material</button>
                    </div>

                    <!-- Sección de materiales seleccionados -->
                    <div v-if="materialesDelComponente && materialesDelComponente.length > 0" class="selected-items">
                        <h4 class="items-subtitle">Materiales Seleccionados</h4>
                        <div class="items-grid">
                            <div v-for="material in materialesDelComponente" :key="material.id" class="selected-item-edit">
                                <div class="item-info">
                                    <div class="item-name">{{ material.material?.nombre }}</div>
                                    <div class="item-code">{{ material.material?.codigo }}</div>
                                    <div class="item-price">${{ formatCurrency(material.material?.costo_unitario) }}</div>
                                </div>
                                <div class="quantity-input-group">
                                    <label :for="`qty-material-${material.id}`">Cantidad (unidades)</label>
                                    <div class="quantity-controls">
                                        <button 
                                            type="button"
                                            class="btn-qty-control btn-qty-minus"
                                            @click="decrementarCantidad(material)"
                                            title="Disminuir"
                                        >−</button>
                                        <input 
                                            :id="`qty-material-${material.id}`"
                                            v-model.number="material.cantidad"
                                            type="number"
                                            min="1"
                                            step="1"
                                            placeholder="1"
                                            @blur="guardarCantidadMaterial(material)"
                                            @keyup.enter="guardarCantidadMaterial(material)"
                                            class="quantity-input"
                                        />
                                        <button 
                                            type="button"
                                            class="btn-qty-control btn-qty-plus"
                                            @click="incrementarCantidad(material)"
                                            title="Aumentar"
                                        >+</button>
                                    </div>
                                </div>
                                <button class="btn-remove" @click="removerMaterial(material.id)" title="Remover">×</button>
                            </div>
                        </div>
                    </div>
                    <div v-else class="empty-list">
                        <p>📭 No hay materiales seleccionados</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" @click="mostrarModalMateriales = false">Cerrar</button>
                </div>
            </div>
        </div>

        <!-- Modal Acabado -->
        <div v-if="mostrarModalAcabado" class="modal-overlay" @click.self="mostrarModalAcabado = false">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">🎨 Editar Acabado</h3>
                </div>
                <div class="modal-body">
                    <div v-if="formData.acabado" class="selected-items">
                        <div class="selected-item-full">
                            <div class="item-info-full">
                                <div class="item-name">{{ formData.acabado.nombre }}</div>
                                <div class="item-code">{{ formData.acabado.descripcion }}</div>
                                <div class="info-row">
                                    <span class="info-label">Costo:</span>
                                    <span class="info-value">${{ formatCurrency(formData.acabado.costo) }}</span>
                                </div>
                            </div>
                            <div class="button-group-vertical">
                                <button class="btn-change-item" @click="abrirSelectorAcabados" title="Cambiar">🔄 Cambiar</button>
                            </div>
                        </div>
                    </div>
                    <div v-else class="add-section">
                        <button 
                            type="button" 
                            class="btn-add-material"
                            @click="abrirSelectorAcabados()"
                        >+ Agregar Acabado</button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" @click="mostrarModalAcabado = false">Cerrar</button>
                </div>
            </div>
        </div>

        <!-- Modal Selector de Materiales -->
        <div v-if="mostrarSelectorMateriales" class="modal-overlay" @click.self="mostrarSelectorMateriales = false">
            <div class="modal-content modal-content-large">
                <div class="modal-header">
                    <h3 class="modal-title">📋 Seleccionar Materiales</h3>
                </div>
                <div class="modal-body">
                    <div class="search-section">
                        <input 
                            v-model="busquedaMaterial"
                            type="text"
                            class="search-input"
                            placeholder="🔍 Buscar material..."
                        />
                    </div>
                    <div class="materiales-grid">
                        <div 
                            v-for="material in materialesFiltrados"
                            :key="material.id"
                            class="material-card"
                            @click="agregarMaterial(material)"
                        >
                            <div class="card-header">
                                <div class="card-name">{{ material.nombre }}</div>
                                <div class="card-badge">{{ material.codigo }}</div>
                            </div>
                            <div class="card-body">
                                <p class="card-label">Precio Unitario</p>
                                <p class="card-price">${{ formatCurrency(material.costo_unitario || material.precio_unitario) }}</p>
                            </div>
                            <div class="card-footer">
                                <button class="btn-select">+ Seleccionar</button>
                            </div>
                        </div>
                    </div>
                    <div v-if="materialesFiltrados.length === 0" class="empty-list">
                        <p>📭 No hay materiales disponibles</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" @click="mostrarSelectorMateriales = false">Cerrar</button>
                </div>
            </div>
        </div>

        <!-- Modal Selector de Acabados -->
        <div v-if="mostrarSelectorAcabados" class="modal-overlay" @click.self="mostrarSelectorAcabados = false">
            <div class="modal-content modal-content-large">
                <div class="modal-header">
                    <h3 class="modal-title">🎨 Seleccionar Acabados</h3>
                </div>
                <div class="modal-body">
                    <div class="search-section">
                        <input 
                            v-model="busquedaAcabado"
                            type="text"
                            class="search-input"
                            placeholder="🔍 Buscar acabado..."
                        />
                    </div>
                    <div class="materiales-grid">
                        <div 
                            v-for="acabado in acabadosFiltrados"
                            :key="acabado.id"
                            class="material-card"
                            :class="{ 'selected': formData.acabado?.id === acabado.id }"
                            @click="agregarAcabado(acabado)"
                        >
                            <div class="card-header">
                                <div class="card-name">{{ acabado.nombre }}</div>
                                <div class="card-badge">{{ acabado.codigo }}</div>
                            </div>
                            <div class="card-body">
                                <p class="card-label">Costo</p>
                                <p class="card-price">${{ formatCurrency(acabado.costo) }}</p>
                            </div>
                            <div class="card-footer">
                                <button v-if="formData.acabado?.id === acabado.id" class="btn-select btn-select-active" disabled>✓ Seleccionado</button>
                                <button v-else class="btn-select">+ Seleccionar</button>
                            </div>
                        </div>
                    </div>
                    <div v-if="acabadosFiltrados.length === 0" class="empty-list">
                        <p>📭 No hay acabados disponibles</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" @click="mostrarSelectorAcabados = false">Cerrar</button>
                </div>
            </div>
        </div>

        <!-- Selector de Tableros -->
        <EntitySelectorModal
            :visible="mostrarSelectorTableros"
            icon="🪵"
            titulo="Seleccionar Tableros"
            label-singular="Tablero"
            :busqueda="busquedaTablero"
            :items-filtrados="tablerosFiltrados"
            :format-currency="formatCurrency"
            :obtener-precio="(item) => item.costo_unitario || item.costo || 0"
            @close="mostrarSelectorTableros = false"
            @seleccionar="agregarTablero"
            @update:busqueda="busquedaTablero = $event"
        />

        <!-- Selector de Estructuras -->
        <EntitySelectorModal
            :visible="mostrarSelectorEstructuras"
            icon="🏗️"
            titulo="Seleccionar Estructuras"
            label-singular="Estructura"
            :busqueda="busquedaEstructura"
            :items-filtrados="estructurasFiltradas"
            :format-currency="formatCurrency"
            :obtener-precio="(item) => item.costo_unitario || item.costo || item.precio || 0"
            @close="mostrarSelectorEstructuras = false"
            @seleccionar="agregarEstructura"
            @update:busqueda="busquedaEstructura = $event"
        />

        <!-- Selector de Cubre Cantos -->
        <EntitySelectorModal
            :visible="mostrarSelectorCubreCantos"
            icon="🎨"
            titulo="Seleccionar Cubre Cantos"
            label-singular="Cubre Canto"
            :busqueda="busquedaCubreCanto"
            :items-filtrados="cubreCantosFiltrados"
            :format-currency="formatCurrency"
            :obtener-precio="(item) => item.costo_unitario || item.costo || item.precio || 0"
            @close="mostrarSelectorCubreCantos = false"
            @seleccionar="agregarCubreCanto"
            @update:busqueda="busquedaCubreCanto = $event"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/http/apl';
import { getComponenteById } from '@/http/componentes-api';
import { useMaterialesPorComponente } from '@/stores/materiales-por-componente';
import { useMateriales } from '@/stores/materiales';
import { useTablerosPorComponenteStore } from '@/stores/tableros-por-componente';
import { useEstructurasPorComponenteStore } from '@/stores/estructuras-por-componente';
import { useEstructuraStore } from '@/stores/estructura';
import { useAcabadoCubreCantosPorComponenteStore } from '@/stores/acabado-cubre-cantos-por-componente';
import { useAcabadoCubreCantosStore } from '@/stores/acabado-cubre-cantos';
import { useEntidadPorComponente } from '@/composables/useEntidadPorComponente';
import EntityCardList from '@/components/EntityCardList.vue';
import EntitySelectorModal from '@/components/EntitySelectorModal.vue';

const router = useRouter();
const route = useRoute();
const componenteId = computed(() => Number.parseInt(route.params.id, 10) || 0);
const storeMaterialesPorComponente = useMaterialesPorComponente();
const storeMateriales = useMateriales();
const storeTablerosPorComponente = useTablerosPorComponenteStore();
const storeEstructurasPorComponente = useEstructurasPorComponenteStore();
const storeEstructuras = useEstructuraStore();
const storeAcabadoCubreCantosPorComponente = useAcabadoCubreCantosPorComponenteStore();
const storeAcabadoCubreCantos = useAcabadoCubreCantosStore();

// Estado
const formData = ref({
    nombre: '',
    codigo: '',
    descripcion: '',
    costo_unitario: '',
    materiales: [],
    acabado: null,
});

const errors = ref({});
const error = ref(null);
const mensaje = ref(null);
const tipoMensaje = ref(null); // 'success', 'error', 'warning'
const guardando = ref(false);
const cargando = ref(true);

// Función para mostrar mensajes amigables
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
const materialesDelComponente = ref([]);

// Modales (materiales, acabado)
const mostrarModalMateriales = ref(false);
const mostrarModalAcabado = ref(false);
const mostrarSelectorMateriales = ref(false);

// Datos para seleccionar materiales
const materialesDisponibles = ref([]);
const busquedaMaterial = ref('');

// Datos para seleccionar acabados
const acabadosDisponibles = ref([]);
const busquedaAcabado = ref('');
const mostrarSelectorAcabados = ref(false);

const createDebouncedRef = (sourceRef, delay = 180) => {
    const debounced = ref(sourceRef.value);
    let timeoutId;
    const stopWatching = watch(sourceRef, (value) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => { debounced.value = value; }, delay);
    });
    onBeforeUnmount(() => { clearTimeout(timeoutId); stopWatching(); });
    return debounced;
};

const busquedaMaterialDebounced = createDebouncedRef(busquedaMaterial);
const busquedaAcabadoDebounced = createDebouncedRef(busquedaAcabado);

// ===== Catálogos disponibles para entidades =====
const tablerosDisponibles = ref([]);
const estructurasDisponibles = ref([]);
const cubreCantosDisponibles = ref([]);
const tablerosDisponiblesMap = computed(() => new Map((tablerosDisponibles.value || []).map(t => [t.id, t])));
const estructurasDisponiblesMap = computed(() => new Map((estructurasDisponibles.value || []).map(e => [e.id, e])));
const cubreCantosDisponiblesMap = computed(() => new Map((cubreCantosDisponibles.value || []).map(c => [c.id, c])));

// ===== Composables de entidades por componente =====
const {
    items: tablerosDelComponente,
    mostrarSelector: mostrarSelectorTableros,
    busqueda: busquedaTablero,
    obtenerId: obtenerIdTableroRelacion,
    obtenerNombre: obtenerNombreTablero,
    obtenerCodigo: obtenerCodigoTablero,
    obtenerCostoUnitario: obtenerCostoUnitarioTablero,
    obtenerSubtotal: obtenerSubtotalTablero,
    itemsOrdenados: tablerosOrdenadosParaVista,
    totalCantidad: totalCantidadTableros,
    totalCosto: totalCostoTableros,
    cargar: cargarTablerosPorComponente,
    agregar: agregarTablero,
    guardarCantidad: guardarCantidadTablero,
    incrementarCantidad: incrementarCantidadTablero,
    decrementarCantidad: decrementarCantidadTablero,
    remover: removerTablero,
} = useEntidadPorComponente({
    label: 'Tablero',
    primaryIdField: 'tablero_id',
    alternateIdField: 'acabado_tablero_id',
    nestedKeys: ['tablero', 'acabado_tablero'],
    idAccessors: ['tablero_id', 'acabado_tablero_id', 'tablero.id', 'acabado_tablero.id', 'tableroId'],
    costFields: ['costo_unitario', 'costo'],
    disponiblesMap: tablerosDisponiblesMap,
    store: storeTablerosPorComponente,
    storeCrear: 'crearTableroPorComponente',
    storeActualizar: 'actualizarTableroPorComponente',
    storeEliminar: 'eliminarTableroPorComponente',
    storeFetch: 'fetchTablerosPorComponente',
    componenteId,
    mostrarMensaje,
});

const {
    items: estructurasDelComponente,
    mostrarSelector: mostrarSelectorEstructuras,
    busqueda: busquedaEstructura,
    obtenerId: obtenerIdEstructuraRelacion,
    obtenerNombre: obtenerNombreEstructura,
    obtenerCodigo: obtenerCodigoEstructura,
    obtenerCostoUnitario: obtenerCostoUnitarioEstructura,
    obtenerSubtotal: obtenerSubtotalEstructura,
    itemsOrdenados: estructurasOrdenadasParaVista,
    totalCantidad: totalCantidadEstructuras,
    totalCosto: totalCostoEstructuras,
    cargar: cargarEstructurasPorComponente,
    agregar: agregarEstructura,
    guardarCantidad: guardarCantidadEstructura,
    incrementarCantidad: incrementarCantidadEstructura,
    decrementarCantidad: decrementarCantidadEstructura,
    remover: removerEstructura,
} = useEntidadPorComponente({
    label: 'Estructura',
    primaryIdField: 'estructura_id',
    alternateIdField: null,
    nestedKeys: ['estructura'],
    idAccessors: ['estructura_id', 'estructura.id', 'estructuraId'],
    costFields: ['costo_unitario', 'costo', 'precio'],
    disponiblesMap: estructurasDisponiblesMap,
    store: storeEstructurasPorComponente,
    storeCrear: 'crearEstructuraPorComponente',
    storeActualizar: 'actualizarEstructuraPorComponente',
    storeEliminar: 'eliminarEstructuraPorComponente',
    storeFetch: 'fetchEstructurasPorComponente',
    componenteId,
    mostrarMensaje,
});

const {
    items: acabadoCubreCantosDelComponente,
    mostrarSelector: mostrarSelectorCubreCantos,
    busqueda: busquedaCubreCanto,
    obtenerId: obtenerIdCubreCantoRelacion,
    obtenerNombre: obtenerNombreCubreCanto,
    obtenerCodigo: obtenerCodigoCubreCanto,
    obtenerCostoUnitario: obtenerCostoUnitarioCubreCanto,
    obtenerSubtotal: obtenerSubtotalCubreCanto,
    itemsOrdenados: cubreCantosOrdenadosParaVista,
    totalCantidad: totalCantidadCubreCantos,
    totalCosto: totalCostoCubreCantos,
    cargar: cargarCubreCantosPorComponente,
    agregar: agregarCubreCanto,
    guardarCantidad: guardarCantidadCubreCanto,
    incrementarCantidad: incrementarCantidadCubreCanto,
    decrementarCantidad: decrementarCantidadCubreCanto,
    remover: removerCubreCanto,
} = useEntidadPorComponente({
    label: 'Cubre Canto',
    primaryIdField: 'acabado_cubre_canto_id',
    alternateIdField: 'acabado_cubre_cantos_id',
    nestedKeys: ['acabado_cubre_canto', 'acabadoCubreCanto'],
    idAccessors: ['acabado_cubre_canto_id', 'acabado_cubre_cantos_id', 'acabadoCubreCanto.id', 'acabado_cubre_canto.id'],
    costFields: ['costo_unitario', 'costo', 'precio'],
    disponiblesMap: cubreCantosDisponiblesMap,
    store: storeAcabadoCubreCantosPorComponente,
    storeCrear: 'crearAcabadoCubreCantoPorComponente',
    storeActualizar: 'actualizarAcabadoCubreCantoPorComponente',
    storeEliminar: 'eliminarAcabadoCubreCantoPorComponente',
    storeFetch: 'fetchAcabadoCubreCantosPorComponente',
    componenteId,
    mostrarMensaje,
});

const busquedaTableroDebounced = createDebouncedRef(busquedaTablero);
const busquedaEstructuraDebounced = createDebouncedRef(busquedaEstructura);
const busquedaCubreCantoDebounced = createDebouncedRef(busquedaCubreCanto);

// Cargar componente (placeholder - actualizar con API real)
const cargarComponente = async () => {
    try {
        cargando.value = true;
        const response = await getComponenteById(componenteId.value || route.params.id);
        const data = response.data || response;
        
        formData.value = {
            nombre: data.nombre || '',
            codigo: data.codigo || '',
            descripcion: data.descripcion || '',
            costo_unitario: data.costo_unitario || data.costo_total || '',
            materiales: data.materiales || [],
            acabado: data.acabado_id || null,
        };
        
        // Cargar catálogos relacionados en paralelo
        await Promise.all([
            cargarMaterialesPorComponente(),
            cargarTablerosPorComponente(async () => {
                if (!tablerosDisponibles.value.length) {
                    await cargarCatalogo('/acabado-tableros', tablerosDisponibles);
                }
            }),
            cargarEstructurasPorComponente(async () => {
                if (!estructurasDisponibles.value.length) {
                    await storeEstructuras.fetchEstructuras();
                    estructurasDisponibles.value = storeEstructuras.estructuras || [];
                }
            }),
            cargarCubreCantosPorComponente(async () => {
                if (!cubreCantosDisponibles.value.length) {
                    await storeAcabadoCubreCantos.fetchAcabadoCubreCantos();
                    cubreCantosDisponibles.value = storeAcabadoCubreCantos.acabadoCubreCantos || [];
                }
            }),
        ]);
    } catch (err) {
        error.value = 'Error al cargar el componente';
        console.error(err);
    } finally {
        cargando.value = false;
    }
};

// Cargar materiales por componente
const cargarMaterialesPorComponente = async () => {
    try {
        // Cargar todos los materiales y sus relaciones con el componente
        await Promise.all([
            storeMateriales.fetchMaterialesAction(),
            storeMaterialesPorComponente.fetchMaterialesPorComponenteAction(),
        ]);
        
        // Filtrar y enriquecer con datos del material
        if (!componenteId.value) {
            materialesDelComponente.value = [];
            return;
        }

        const materialesRelacion = storeMaterialesPorComponente.getMaterialesPorComponente(componenteId.value);
        
        materialesDelComponente.value = materialesRelacion.map(rel => ({
            ...rel,
            material: storeMateriales.materiales.find(m => m.id === rel.material_id) || {}
        }));
    } catch (err) {
        console.error('Error cargando materiales por componente:', err);
    }
};

// Formatear moneda
const formatCurrency = (value) => {
    if (!value) return '0.00';
    return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const removerMaterial = async (materialId) => {
    try {
        // Encontrar el registro de material-por-componente para este material
        const materialComp = materialesDelComponente.value.find(m => m.id === materialId);
        
        if (materialComp && materialComp.id) {
            // Eliminar del backend
            await storeMaterialesPorComponente.eliminarMaterialPorComponenteAction(materialComp.id);
            
            // Actualizar lista local
            materialesDelComponente.value = materialesDelComponente.value.filter(m => m.id !== materialComp.id);
            mostrarMensaje('✅ Material eliminado', 'success', 2000);
        }
    } catch (err) {
        console.error('Error eliminando material:', err);
        mostrarMensaje('❌ Error al eliminar material', 'error', 3000);
    }
};

// Incrementar cantidad de material
const incrementarCantidad = (item) => {
    if (item && typeof item.cantidad === 'number') {
        item.cantidad = Math.floor(item.cantidad) + 1;
    } else if (item) {
        item.cantidad = 2;
    }
    if (item && item.material_id) {
        guardarCantidadMaterial(item);
    }
};

// Decrementar cantidad de material
const decrementarCantidad = (item) => {
    if (item && typeof item.cantidad === 'number' && item.cantidad > 1) {
        item.cantidad = Math.max(1, Math.floor(item.cantidad) - 1);
    }
    if (item && item.material_id) {
        guardarCantidadMaterial(item);
    }
};

const guardarCantidadMaterial = async (item) => {
    if (!item || !item.id) return;
    
    const cantidadFinal = Math.round(item.cantidad || 1);
    const maxCantidad = 50;
    
    if (cantidadFinal > maxCantidad) {
        mostrarMensaje(`📦 La cantidad máxima permitida es ${maxCantidad} unidades`, 'warning', 3000);
        item.cantidad = maxCantidad;
        return;
    }
    
    item.cantidad = cantidadFinal;
    
    try {
        const itemComp = materialesDelComponente.value.find(i => i.id === item.id);
        if (!itemComp?.id) return;

        await storeMaterialesPorComponente.actualizarMaterialPorComponenteAction(itemComp.id, { cantidad: cantidadFinal });
    } catch (err) {
        console.error('Error guardando cantidad de material:', err);
        mostrarMensaje('❌ Error al actualizar cantidad de material', 'error', 3000);
    }
};

// Cargar catálogos de forma genérica
const cargarCatalogo = async (endpoint, targetRef) => {
    try {
        const response = await api.get(endpoint);
        const data = response.data.data || response.data || [];
        targetRef.value = Array.isArray(data) ? data : [];
    } catch (err) {
        console.error(`Error cargando ${endpoint}:`, err);
        targetRef.value = [];
    }
};

// Abrir selectores genérico
const abrirSelector = async (endpoint, catalogRef, showRef) => {
    await cargarCatalogo(endpoint, catalogRef);
    showRef.value = true;
};

const abrirSelectorMateriales = () => abrirSelector('/materiales', materialesDisponibles, mostrarSelectorMateriales);
const abrirSelectorTableros = () => abrirSelector('/acabado-tableros', tablerosDisponibles, mostrarSelectorTableros);
const abrirSelectorEstructuras = async () => {
    await storeEstructuras.fetchEstructuras();
    estructurasDisponibles.value = storeEstructuras.estructuras || [];
    mostrarSelectorEstructuras.value = true;
};
const abrirSelectorCubreCantos = async () => {
    await storeAcabadoCubreCantos.fetchAcabadoCubreCantos();
    cubreCantosDisponibles.value = storeAcabadoCubreCantos.acabadoCubreCantos || [];
    mostrarSelectorCubreCantos.value = true;
};

// Helper para filtrar por búsqueda y por items existentes
const filtrarCatalogo = (catalog, busqueda, itemsExistentes) => {
    // itemsExistentes puede ser un array de objetos o un array de IDs
    const existentesIds = new Set(Array.isArray(itemsExistentes) 
        ? itemsExistentes.map(item => typeof item === 'object' ? item.id : item)
        : []);
    
    const filtrados = catalog.filter(item => !existentesIds.has(item.id));
    
    if (!busqueda.trim()) return filtrados;
    
    const busquedaLower = busqueda.toLowerCase();
    return filtrados.filter(item => 
        item.nombre.toLowerCase().includes(busquedaLower) ||
        item.codigo.toLowerCase().includes(busquedaLower)
    );
};

// Computed properties para filtros
const materialesFiltrados = computed(() => {
    const materialesAgregados = materialesDelComponente.value.map(m => m.material_id);
    return filtrarCatalogo(materialesDisponibles.value, busquedaMaterialDebounced.value, materialesAgregados);
});

const tablerosFiltrados = computed(() => {
    const tablerosAgregados = tablerosDelComponente.value.map(t => t.tablero_id);
    return filtrarCatalogo(tablerosDisponibles.value, busquedaTableroDebounced.value, tablerosAgregados);
});

const estructurasFiltradas = computed(() => {
    const estructurasAgregadas = estructurasDelComponente.value.map(e => obtenerIdEstructuraRelacion(e));
    return filtrarCatalogo(estructurasDisponibles.value, busquedaEstructuraDebounced.value, estructurasAgregadas);
});

const cubreCantosFiltrados = computed(() => {
    const cubreCantosAgregados = acabadoCubreCantosDelComponente.value.map(c => obtenerIdCubreCantoRelacion(c));
    return filtrarCatalogo(cubreCantosDisponibles.value, busquedaCubreCantoDebounced.value, cubreCantosAgregados);
});

// Métodos simplificados
const agregarMaterial = async (material) => {
    try {
        if (!material || !material.id) return;
        
        const yaExiste = materialesDelComponente.value.some(m => m.material_id === material.id);
        if (yaExiste) {
            mostrarMensaje('⚠️ Este material ya está agregado', 'warning', 2000);
            return;
        }
        
        const resultado = await storeMaterialesPorComponente.crearMaterialPorComponenteAction({
            componente_id: componenteId.value,
            material_id: material.id,
            cantidad: 1
        });
        
        const datosResultado = resultado.data || resultado;
        materialesDelComponente.value.push({
            id: datosResultado.id,
            componente_id: datosResultado.componente_id,
            material_id: datosResultado.material_id,
            cantidad: datosResultado.cantidad,
            created_at: datosResultado.created_at,
            material: { ...material }
        });
        
        mostrarMensaje('✅ Material agregado', 'success', 2000);
        mostrarSelectorMateriales.value = false;
        busquedaMaterial.value = '';
    } catch (err) {
        console.error('Error agregando material:', err);
        mostrarMensaje('❌ Error al agregar material', 'error', 3000);
    }
};

// Cargar acabados disponibles
const cargarAcabados = async () => {
    try {
        const response = await api.get('/acabados');
        const data = response.data.data || response.data || [];
        acabadosDisponibles.value = Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('Error al cargar acabados:', err);
        acabadosDisponibles.value = [];
    }
};

// Abrir selector de acabados
const abrirSelectorAcabados = async () => {
    await cargarAcabados();
    mostrarSelectorAcabados.value = true;
};

// Agregar acabado seleccionado
const agregarAcabado = (acabado) => {
    if (acabado) {
        formData.value.acabado = {
            ...acabado
        };
        mostrarSelectorAcabados.value = false;
        busquedaAcabado.value = '';
    }
};

// Filtrar acabados disponibles
const acabadosFiltrados = computed(() => {
    if (busquedaAcabadoDebounced.value.trim()) {
        const busqueda = busquedaAcabadoDebounced.value.toLowerCase();
        return acabadosDisponibles.value.filter(a => 
            a.nombre.toLowerCase().includes(busqueda) ||
            a.codigo.toLowerCase().includes(busqueda)
        );
    }
    
    return acabadosDisponibles.value;
});

// Validar formulario
const validar = () => {
    errors.value = {};
    
    if (!formData.value.nombre.trim()) {
        errors.value.nombre = 'El nombre es requerido';
    }
    
    if (formData.value.costo_unitario === '' || formData.value.costo_unitario <= 0) {
        errors.value.costo_unitario = 'El costo unitario debe ser mayor a 0';
    }
    
    return Object.keys(errors.value).length === 0;
};

// Guardar cambios
const guardarComponente = async () => {
    if (!validar()) return;
    
    try {
        guardando.value = true;
        error.value = null;
        
        const datos = {
            nombre: formData.value.nombre.trim(),
            codigo: formData.value.codigo.trim(),
            descripcion: formData.value.descripcion.trim(),
            costo_unitario: parseFloat(formData.value.costo_unitario),
        };
        
        // Agregar acabado_id si existe
        if (formData.value.acabado && formData.value.acabado.id) {
            datos.acabado_id = formData.value.acabado.id;
        }
        
        await api.put(`/componentes/${componenteId.value || route.params.id}`, datos);
        router.push('/componentes');
    } catch (err) {
        error.value = 'Error al guardar los cambios';
        console.error(err);
        console.error('Detalles:', err.response?.data);
    } finally {
        guardando.value = false;
    }
};

// Cargar datos al montar
onMounted(async () => {
    await cargarComponente();
});
</script>

<style scoped>
/* ========== Container ========== */
.editar-componente-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 40px 20px;
    min-height: 100vh;
}

/* ========== Header ========== */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    background: linear-gradient(135deg, #ffffff 0%, #f8f7f6 100%);
    padding: 24px 28px;
    border-radius: 12px;
    border: 1px solid #e8e3dd;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    gap: 16px;
    flex-wrap: wrap;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.btn-back {
    padding: 8px 16px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    box-shadow: 0 2px 6px rgba(212, 165, 116, 0.2);
}

.btn-back:hover {
    background: linear-gradient(135deg, #c89564 0%, #b88454 100%);
    transform: translateX(-2px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.back-arrow {
    font-size: 16px;
}

.header-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.page-title {
    font-size: 24px;
    font-weight: 800;
    color: #2c2c2c;
    margin: 0;
    letter-spacing: -0.3px;
}

.header-subtitle {
    font-size: 14px;
    color: #888;
    margin: 0;
    font-weight: 500;
}

.header-right {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
}

.badge-saving {
    background: linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%);
    color: #856404;
    border: 1px solid #ffc107;
    animation: pulse-badge 1.5s ease-in-out infinite;
}

.badge-status {
    background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
    color: #155724;
    border: 1px solid #28a745;
}

@keyframes pulse-badge {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}

.badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
}

.badge-code {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    box-shadow: 0 2px 6px rgba(212, 165, 116, 0.25);
}

/* ========== Alerts ========== */
.alert {
    padding: 14px 18px;
    border-radius: 10px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 500;
    font-size: 14px;
    animation: slideDown 0.3s ease-out;
}

.alert-icon {
    font-size: 18px;
    flex-shrink: 0;
}

.alert-text {
    flex: 1;
}

.alert-close {
    background: none;
    border: none;
    font-size: 22px;
    cursor: pointer;
    color: inherit;
    padding: 0;
    opacity: 0.6;
    transition: opacity 0.2s;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.alert-close:hover {
    opacity: 1;
}

.alert-error {
    background: #fff5f5;
    color: #c53030;
    border: 1px solid #feb2b2;
    border-left: 4px solid #e53e3e;
}

/* ========== Toast Messages ========== */
.custom-message {
    padding: 14px 20px;
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    animation: slideDown 0.3s ease-out;
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 480px;
    z-index: 2000;
    margin: 0;
    backdrop-filter: blur(8px);
}

.message-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 1rem;
}

.message-text {
    flex: 1;
    font-size: 0.95rem;
}

.message-close {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 1.4rem;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.2s;
    flex-shrink: 0;
}

.message-close:hover {
    opacity: 0.7;
    transform: scale(1.1);
}

.message-warning {
    background: linear-gradient(135deg, #fff8e1 0%, #fffde7 100%);
    color: #f57f17;
    border-left: 4px solid #fbc02d;
}

.message-success {
    background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
    color: #2e7d32;
    border-left: 4px solid #4caf50;
}

.message-error {
    background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
    color: #c62828;
    border-left: 4px solid #f44336;
}

.message-info {
    background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
    color: #1565c0;
    border-left: 4px solid #2196f3;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.3s ease;
}

.slide-down-enter-from {
    opacity: 0;
    transform: translateY(-20px);
}

.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

/* ========== Loading ========== */
.loading-state {
    text-align: center;
    padding: 80px 24px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #ede7e0;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #ede7e0;
    border-top-color: #d4a574;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 16px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.loading-state p {
    font-size: 15px;
    margin: 0;
    color: #8b7355;
    font-weight: 500;
}

/* ========== Stats Bar ========== */
.stats-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
    gap: 12px;
    margin-bottom: 24px;
}

.stat-card {
    background: white;
    border: 1px solid #e8e3dd;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    transition: all 0.3s;
}

.stat-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
}

.stat-card--highlight {
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    border-color: #d4a574;
}

.stat-icon {
    font-size: 24px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f5f1ed 0%, #faf7f2 100%);
    border-radius: 10px;
    flex-shrink: 0;
}

.stat-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.stat-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 700;
    color: #8b7355;
}

.stat-value {
    font-size: 15px;
    font-weight: 700;
    color: #5a4037;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.stat-value small {
    font-size: 11px;
    font-weight: 600;
    color: #8b7355;
}

/* ========== Info Card ========== */
.info-card {
    background: white;
    border-radius: 12px;
    padding: 28px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #ede7e0;
}

.section-title {
    font-size: 18px;
    font-weight: 700;
    color: #5a4037;
    margin: 0 0 20px 0;
    padding-bottom: 14px;
    border-bottom: 2px solid #f5f1ed;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 14px;
    border-bottom: 2px solid #f5f1ed;
}

.section-header .section-title {
    margin: 0;
    padding: 0;
    border: none;
}

.btn-action-header {
    padding: 8px 18px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 2px 6px rgba(212, 165, 116, 0.2);
    white-space: nowrap;
}

.btn-action-header:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.35);
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group.full-width {
    grid-column: 1 / -1;
}

.form-label {
    font-weight: 600;
    color: #5a4037;
    font-size: 14px;
    letter-spacing: 0.3px;
}

.form-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e0d5c7;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    box-sizing: border-box;
    transition: all 0.3s;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    color: #5a4037;
}

.form-input::placeholder {
    color: #c4a882;
    opacity: 0.7;
}

.form-input:hover {
    border-color: #d4a574;
    background: linear-gradient(135deg, #fff5ea 0%, #fffbf5 100%);
}

.form-input:focus {
    outline: none;
    background: white;
    border-color: #c89564;
    box-shadow: 0 0 0 4px rgba(212, 165, 116, 0.15);
}

.textarea-input {
    resize: vertical;
    min-height: 70px;
}

.error-text {
    display: block;
    color: #c62828;
    font-size: 13px;
}

/* ========== Tableros Section ========== */
.tableros-metrics {
    display: flex;
    gap: 10px;
    margin-bottom: 18px;
    flex-wrap: wrap;
}

.metric-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: #f5f1ed;
    border-radius: 20px;
    border: 1px solid #e8e3dd;
}

.metric-pill--accent {
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    border-color: #d4a574;
}

.metric-number {
    font-size: 14px;
    font-weight: 800;
    color: #5a4037;
}

.metric-label {
    font-size: 11px;
    font-weight: 600;
    color: #8b7355;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.tablero-card {
    display: flex;
    align-items: center;
    padding: 14px 16px;
    background: white;
    border: 1px solid #e8e3dd;
    border-radius: 10px;
    gap: 16px;
    margin-bottom: 10px;
    transition: all 0.25s ease;
}

.tablero-card:hover {
    border-color: #d4a574;
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.12);
}

.tablero-card-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
}

.tablero-avatar {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #f5f1ed 0%, #faf7f2 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
    border: 1px solid #e8e3dd;
}

.tablero-info {
    min-width: 0;
}

.tablero-name {
    font-weight: 700;
    color: #2c2c2c;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.tablero-code {
    font-size: 12px;
    color: #888;
    margin-top: 2px;
}

.tablero-card-center {
    flex-shrink: 0;
}

.tablero-pricing {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
}

.tablero-unit-price {
    font-size: 12px;
    color: #8b7355;
    font-weight: 500;
}

.tablero-unit-price small {
    font-size: 10px;
}

.tablero-subtotal {
    font-size: 15px;
    font-weight: 800;
    color: #2e7d32;
}

.tablero-card-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
}

.quantity-controls-compact {
    display: flex;
    align-items: center;
    gap: 0;
    border: 2px solid #e8e3dd;
    border-radius: 8px;
    overflow: hidden;
    background: #f9f7f4;
}

.btn-qty {
    width: 32px;
    height: 34px;
    border: none;
    background: transparent;
    color: #5a4037;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}

.btn-qty:hover {
    background: #e8e3dd;
}

.btn-qty--minus:hover {
    background: #ffebee;
    color: #c62828;
}

.btn-qty--plus:hover {
    background: #e8f5e9;
    color: #2e7d32;
}

.qty-input {
    width: 48px;
    height: 34px;
    border: none;
    border-left: 1px solid #e8e3dd;
    border-right: 1px solid #e8e3dd;
    text-align: center;
    font-size: 14px;
    font-weight: 700;
    color: #5a4037;
    background: white;
    -moz-appearance: textfield;
    appearance: textfield;
}

.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.qty-input:focus {
    outline: none;
    background: #fffdf9;
}

.btn-delete-sm {
    width: 34px;
    height: 34px;
    background: #fff5f5;
    border: 1px solid #fed7d7;
    border-radius: 8px;
    color: #c53030;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}

.btn-delete-sm:hover {
    background: #fed7d7;
    border-color: #fc8181;
    transform: scale(1.08);
}

/* ========== Empty State ========== */
.empty-state-inline {
    text-align: center;
    padding: 40px 20px;
    color: #888;
}

.empty-state-inline .empty-icon {
    font-size: 40px;
    margin-bottom: 12px;
}

.empty-state-inline p {
    margin: 0 0 16px;
    font-size: 15px;
    color: #888;
    font-weight: 500;
}

.btn-empty-action {
    padding: 10px 24px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 2px 8px rgba(212, 165, 116, 0.25);
}

.btn-empty-action:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(212, 165, 116, 0.35);
}

/* ========== Form Actions ========== */
.form-actions {
    display: flex;
    gap: 14px;
    justify-content: flex-end;
    padding-top: 8px;
}

.form-actions--sticky {
    position: sticky;
    bottom: 0;
    background: linear-gradient(to top, #ffffff 60%, rgba(255,255,255,0.95) 80%, rgba(255,255,255,0) 100%);
    padding: 20px 0 8px;
    z-index: 10;
    margin-top: 8px;
}

/* ========== Acabado Card Inline ========== */
.acabado-card-inline {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 18px;
    background: linear-gradient(135deg, #faf7f2 0%, #fff9f0 100%);
    border: 1px solid #e8e3dd;
    border-radius: 10px;
    transition: all 0.3s;
}

.acabado-card-inline:hover {
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.12);
}

.acabado-card-icon {
    font-size: 28px;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    border-radius: 10px;
    flex-shrink: 0;
}

.acabado-card-info {
    flex: 1;
    min-width: 0;
}

.acabado-card-name {
    font-size: 15px;
    font-weight: 700;
    color: #5a4037;
    margin-bottom: 2px;
}

.acabado-card-desc {
    font-size: 12px;
    color: #8b7355;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.acabado-card-price {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    flex-shrink: 0;
}

.acabado-price-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 700;
    color: #8b7355;
}

.acabado-price-value {
    font-size: 16px;
    font-weight: 800;
    color: #d4a574;
}

/* ========== Section Header ========== */
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.section-title {
    font-size: 16px;
    font-weight: 700;
    color: #5a4037;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.btn-action-header {
    padding: 7px 16px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 700;
    transition: all 0.3s;
    box-shadow: 0 2px 6px rgba(212, 165, 116, 0.2);
}

.btn-action-header:hover {
    background: linear-gradient(135deg, #c89564 0%, #b88454 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.btn-primary,
.btn-secondary {
    padding: 14px 28px;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.btn-primary {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
    box-shadow: 0 3px 10px rgba(76, 175, 80, 0.25);
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(76, 175, 80, 0.35);
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.btn-secondary {
    background: white;
    color: #666;
    border: 2px solid #e0d5c7;
    box-shadow: none;
}

.btn-secondary:hover {
    background: #f5f1ed;
    border-color: #d4a574;
    color: #5a4037;
}

/* Modal Styles */
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
    animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
    from {
        background: rgba(0, 0, 0, 0);
    }
    to {
        background: rgba(0, 0, 0, 0.6);
    }
}

.modal-content {
    background: white;
    border-radius: 14px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    max-height: 80vh;
    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

.modal-content-large {
    max-width: 650px;
}

.modal-header {
    padding: 22px 24px;
    border-bottom: 2px solid #f0ebe5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    border-radius: 14px 14px 0 0;
}

.modal-title {
    font-size: 18px;
    font-weight: 700;
    color: #5a4037;
    margin: 0;
    letter-spacing: 0.3px;
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    color: #999;
    cursor: pointer;
    padding: 0;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 6px;
}

.modal-close:hover {
    background: #f5f1ed;
    color: #5a4037;
    transform: rotate(90deg);
}

.modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
}

.selected-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.items-subtitle {
    font-size: 14px;
    font-weight: 700;
    color: #5a4037;
    margin: 0 0 12px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.list-enter-active {
    transition: all 0.3s ease;
}
.list-leave-active {
    transition: all 0.25s ease;
}
.list-enter-from {
    opacity: 0;
    transform: translateY(-8px);
}
.list-leave-to {
    opacity: 0;
    transform: translateX(20px);
}

.items-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
}

.selected-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    border-left: 4px solid #d4a574;
    border-radius: 6px;
    gap: 12px;
}

.selected-item-edit {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 18px;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    border-left: 4px solid #d4a574;
    border-radius: 8px;
    gap: 16px;
    flex-wrap: wrap;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 6px rgba(212, 165, 116, 0.08);
}

.selected-item-edit:hover {
    box-shadow: 0 6px 16px rgba(212, 165, 116, 0.15);
    transform: translateY(-2px);
    border-left-color: #c89564;
}

.quantity-input-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
    position: relative;
}

.quantity-input-group label {
    font-size: 11px;
    font-weight: 700;
    color: #8b7355;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.quantity-input {
    width: 70px;
    padding: 10px 12px;
    border: 2px solid #d4a574;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 700;
    color: #5a4037;
    text-align: center;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(212, 165, 116, 0.1);
}

.quantity-input:hover {
    border-color: #c89564;
    background: linear-gradient(135deg, #fff5ea 0%, #fffbf5 100%);
    box-shadow: 0 4px 8px rgba(212, 165, 116, 0.15);
    transform: translateY(-1px);
}

.quantity-input:focus {
    outline: none;
    border-color: #c89564;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.3);
    background: white;
    transform: translateY(-2px);
}

.quantity-input::placeholder {
    color: #d4a574;
    opacity: 0.5;
}

/* Controles de cantidad con botones +/- */
.quantity-controls {
    display: flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    border-radius: 8px;
    padding: 4px;
    border: 2px solid #e8ddd7;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.quantity-controls:hover {
    border-color: #d4a574;
    background: linear-gradient(135deg, #fff5ea 0%, #fffbf5 100%);
    box-shadow: 0 4px 8px rgba(212, 165, 116, 0.1);
}

.btn-qty-control {
    width: 32px;
    height: 32px;
    border: 2px solid #d4a574;
    border-radius: 6px;
    background: white;
    color: #5a4037;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    box-shadow: 0 2px 4px rgba(212, 165, 116, 0.08);
}

.btn-qty-control:hover {
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border-color: #c89564;
    transform: scale(1.08);
    box-shadow: 0 4px 8px rgba(212, 165, 116, 0.2);
}

.btn-qty-control:active {
    transform: scale(0.95);
    box-shadow: 0 2px 4px rgba(212, 165, 116, 0.1);
}

.btn-qty-minus:hover {
    background: linear-gradient(135deg, #ff9999 0%, #ff8888 100%);
    border-color: #c62828;
}

.btn-qty-plus:hover {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    border-color: #2e7d32;
}

.item-info {
    flex: 1;
}

.item-name {
    font-weight: 700;
    color: #5a4037;
    font-size: 14px;
    margin-bottom: 4px;
}

.item-code {
    font-size: 12px;
    color: #8b7355;
    margin-bottom: 4px;
}

.item-price {
    font-size: 13px;
    color: #d4a574;
    font-weight: 600;
}

.item-subtotal {
    margin-top: 4px;
    font-size: 12px;
    font-weight: 700;
    color: #2e7d32;
}

.btn-remove {
    background: #fff5f5;
    color: #c53030;
    border: 1px solid #fed7d7;
    width: 34px;
    height: 34px;
    border-radius: 8px;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: none;
}

.btn-remove:hover {
    background: #fed7d7;
    color: #c53030;
    border-color: #fc8181;
    transform: scale(1.08);
    box-shadow: none;
}

.btn-remove:active {
    transform: scale(0.95);
}

.horas-summary {
    margin-top: 16px;
    padding: 14px 16px;
    background: linear-gradient(135deg, #f0f4f8 0%, #f8fafc 100%);
    border-left: 4px solid #059669;
    border-radius: 6px;
}

.horas-counter {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 18px;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    border-left: 4px solid #d4a574;
    border-radius: 8px;
    gap: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 6px rgba(212, 165, 116, 0.08);
}

.horas-counter:hover {
    box-shadow: 0 6px 16px rgba(212, 165, 116, 0.15);
    transform: translateY(-2px);
    border-left-color: #c89564;
}

.counter-info {
    flex: 1;
}

.counter-label {
    font-size: 11px;
    font-weight: 700;
    color: #8b7355;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
}

.counter-value {
    font-size: 24px;
    font-weight: 700;
    color: #5a4037;
}

.horas-total {
    font-size: 13px;
    font-weight: 600;
    color: #5a4037;
    margin: 0 0 8px 0;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.horas-cost {
    font-size: 13px;
    font-weight: 600;
    color: #5a4037;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.add-section {
    margin-bottom: 28px;
    padding: 18px 0;
    border-bottom: 2px solid #e8ddd7;
}

.btn-add-material {
    width: 100%;
    padding: 14px 24px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    letter-spacing: 0.3px;
}

.btn-add-material:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(212, 165, 116, 0.4);
}

.btn-add-material:active {
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(212, 165, 116, 0.3);
}

.select-bar {
    display: flex;
    gap: 12px;
    align-items: center;
}

.material-select {
    flex: 1;
    padding: 12px;
    border: 2px solid #e0d5c7;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    color: #5a4037;
    background: white;
    cursor: pointer;
    transition: all 0.3s;
    appearance: none;
    padding-right: 32px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23d4a574' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 32px;
}

.material-select:focus {
    outline: none;
    border-color: #d4a574;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
    background-color: #fff9f0;
}

.material-select:disabled {
    background-color: #f0f0f0;
    color: #8b7355;
    cursor: not-allowed;
}

.btn-add {
    background: #d4a574;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    white-space: nowrap;
    flex-shrink: 0;
}

.btn-add:hover:not(:disabled) {
    background: #c89564;
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(212, 165, 116, 0.3);
}

.btn-add:active:not(:disabled) {
    transform: translateY(0);
}

.btn-add:disabled {
    background: #c0a589;
    cursor: not-allowed;
    opacity: 0.6;
}

.search-bar {
    margin-bottom: 16px;
}

.search-input {
    width: 100%;
    padding: 12px;
    border: 2px solid #e0d5c7;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    transition: all 0.3s;
}

.search-input:focus {
    outline: none;
    border-color: #d4a574;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
    background: #fff9f0;
}

.available-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 300px;
    overflow-y: auto;
    padding: 8px;
    background: #f5f1ed;
    border-radius: 6px;
}

.available-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: white;
    border: 1px solid #e0d5c7;
    border-radius: 4px;
    transition: all 0.3s;
    gap: 12px;
}

.available-item:hover {
    background: #fff9f0;
    border-color: #d4a574;
    box-shadow: 0 2px 4px rgba(212, 165, 116, 0.2);
}

.empty-search {
    padding: 24px;
    text-align: center;
    color: #8b7355;
    font-size: 14px;
    background: #f5f1ed;
    border-radius: 6px;
}

.selected-item-full {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    border-left: 4px solid #d4a574;
    border-radius: 6px;
    gap: 16px;
}

.item-info-full {
    flex: 1;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #e8ddd7;
}

.info-row:last-child {
    border-bottom: none;
}

.info-label {
    font-weight: 600;
    color: #8b7355;
    font-size: 13px;
}

.info-value {
    font-weight: 700;
    color: #d4a574;
    font-size: 14px;
}

.btn-remove-large {
    padding: 8px 12px;
    background: #ffebee;
    color: #c62828;
    border: 1px solid #c62828;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 600;
    white-space: nowrap;
}

.btn-remove-large:hover {
    background: #ff9999;
    color: white;
}

.btn-change-item {
    padding: 8px 12px;
    background: #e3f2fd;
    color: #1976d2;
    border: 1px solid #1976d2;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 600;
    white-space: nowrap;
    width: 100%;
}

.btn-change-item:hover {
    background: #90caf9;
    color: white;
}

.empty-list {
    text-align: center;
    padding: 32px 24px;
    color: #999;
}

.empty-list p {
    margin: 0;
    font-size: 16px;
}

/* Estilos adicionales */
.edit-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-group-small {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-group-small label {
    font-size: 12px;
    font-weight: 700;
    color: #5a4037;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.form-input-small {
    padding: 10px 12px;
    border: 2px solid #d4a574;
    border-radius: 6px;
    font-size: 13px;
    font-family: inherit;
    color: #5a4037;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-sizing: border-box;
}

.form-input-small:hover {
    border-color: #c89564;
    background: linear-gradient(135deg, #fff5ea 0%, #fffbf5 100%);
}

.form-input-small:focus {
    outline: none;
    border-color: #c89564;
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.2);
    background: white;
}

.form-input-small::placeholder {
    color: #d4a574;
    opacity: 0.5;
}

.button-group-vertical {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.button-group-horizontal {
    display: flex;
    gap: 8px;
    margin-top: 12px;
}

.btn-edit-item {
    padding: 10px 16px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 6px rgba(212, 165, 116, 0.15);
}

.btn-edit-item:hover {
    background: linear-gradient(135deg, #c89564 0%, #b88454 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.25);
}

.btn-save {
    flex: 1;
    padding: 12px 16px;
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 6px rgba(76, 175, 80, 0.15);
}

.btn-save:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.25);
}

.btn-cancel {
    flex: 1;
    padding: 12px 16px;
    background: linear-gradient(135deg, #9e9e9e 0%, #757575 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 6px rgba(158, 158, 158, 0.15);
}

.btn-cancel:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(158, 158, 158, 0.25);
}

.modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #e8ddd7;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    background: #faf7f2;
}

/* Estilos para el modal de selección de materiales */
.modal-content-large {
    max-width: 700px;
    max-height: 85vh;
}

.search-section {
    margin-bottom: 24px;
}

.search-input {
    width: 100%;
    padding: 14px 16px;
    border: 2px solid #e0d5c7;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    transition: all 0.3s;
    background: linear-gradient(135deg, #fff9f0 0%, #fffcf8 100%);
}

.search-input::placeholder {
    color: #d4a574;
    opacity: 0.6;
}

.search-input:focus {
    outline: none;
    border-color: #d4a574;
    box-shadow: 0 0 0 4px rgba(212, 165, 116, 0.2);
    background: white;
}

.materiales-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
}

.material-card {
    background: white;
    border: 2px solid #e8ddd7;
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 6px rgba(212, 165, 116, 0.08);
}

.material-card.selected {
    border: 3px solid #4CAF50;
    box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.2), 0 12px 30px rgba(76, 175, 80, 0.35);
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(76, 175, 80, 0.04) 100%);
    transform: scale(1.02);
    position: relative;
}

.material-card.selected::before {
    content: '✓';
    position: absolute;
    top: 12px;
    right: 12px;
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 18px;
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
    z-index: 10;
}

.material-card:hover {
    border-color: #d4a574;
    box-shadow: 0 8px 20px rgba(212, 165, 116, 0.25);
    transform: translateY(-4px);
}

.material-card.selected:hover {
    border-color: #4CAF50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.15), 0 8px 20px rgba(76, 175, 80, 0.3);
}

.card-header {
    padding: 18px;
    background: linear-gradient(135deg, #f5f1ed 0%, #faf7f2 100%);
    border-bottom: 2px solid #e8ddd7;
}

.card-name {
    font-weight: 700;
    color: #5a4037;
    font-size: 15px;
    margin-bottom: 8px;
    line-height: 1.4;
}

.card-badge {
    display: inline-block;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    padding: 5px 12px;
    border-radius: 14px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 4px rgba(212, 165, 116, 0.2);
}

.card-body {
    padding: 18px;
    flex: 1;
}

.card-label {
    font-size: 12px;
    color: #8b7355;
    margin: 0 0 6px 0;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
}

.card-price {
    font-size: 24px;
    font-weight: 700;
    color: #d4a574;
    margin: 0;
}

.card-footer {
    padding: 14px 18px;
    background: linear-gradient(135deg, #f5f1ed 0%, #faf7f2 100%);
    border-top: 2px solid #e8ddd7;
}

.btn-select {
    width: 100%;
    padding: 12px 16px;
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 6px rgba(76, 175, 80, 0.15);
    letter-spacing: 0.3px;
}

.btn-select:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.btn-select:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(76, 175, 80, 0.15);
}

.btn-select-active {
    background: linear-gradient(135deg, #388E3C 0%, #2E7D32 100%);
    cursor: default;
}

.btn-select-active:disabled {
    opacity: 1;
}

.btn-add-material {
    width: 100%;
    padding: 14px 24px;
    background: linear-gradient(135deg, #d4a574 0%, #c89564 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    margin-bottom: 0;
}

.btn-add-material:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 165, 116, 0.3);
}

.btn-add-material:active {
    transform: translateY(0);
}

/* ========== Responsive ========== */
@media (max-width: 768px) {
    .editar-componente-container {
        padding: 16px 12px;
    }

    .page-header {
        flex-direction: column;
        align-items: flex-start;
        padding: 18px 16px;
    }

    .header-left {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .header-right {
        margin-top: 10px;
    }

    .stats-bar {
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    }

    .info-card {
        padding: 18px 14px;
    }

    .info-grid {
        grid-template-columns: 1fr;
    }

    .tablero-card {
        flex-wrap: wrap;
        gap: 10px;
    }

    .tablero-card-left {
        flex: 1 1 100%;
    }

    .tablero-card-center {
        flex: 1;
    }

    .tablero-card-right {
        flex: 0 0 auto;
    }

    .tableros-metrics {
        flex-direction: column;
    }

    .acabado-card-inline {
        flex-wrap: wrap;
        gap: 12px;
    }

    .acabado-card-price {
        align-items: flex-start;
        flex-basis: 100%;
    }

    .section-header {
        flex-wrap: wrap;
        gap: 8px;
    }

    .form-actions {
        flex-direction: column-reverse;
    }

    .form-actions--sticky {
        padding: 16px 0 4px;
    }

    .btn-primary,
    .btn-secondary {
        width: 100%;
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .page-title {
        font-size: 20px;
    }

    .stats-bar {
        grid-template-columns: 1fr 1fr;
    }

    .tablero-pricing {
        align-items: flex-start;
    }
}
</style>
