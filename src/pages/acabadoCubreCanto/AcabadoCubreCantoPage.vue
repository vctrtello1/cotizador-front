<template>
	<div class="acabado-cubre-cantos-container">
		<div class="page-header">
			<h1 class="page-title">Acabado Cubre Cantos</h1>
			<button class="btn-primary" @click="$router.push('/nuevo-acabado-cubre-canto')">✨ Nuevo Acabado Cubre Canto</button>
		</div>

		<div class="search-bar">
			<input
				v-model="searchTerm"
				type="text"
				class="search-input"
				placeholder="Buscar por nombre, código o descripción..."
			/>
			<button
				v-if="searchTerm"
				class="search-clear"
				@click="searchTerm = ''"
				aria-label="Limpiar búsqueda"
			>
				✕
			</button>
		</div>

		<div v-if="error" class="error-message">
			<span>⚠️ {{ error }}</span>
			<button @click="error = null" class="error-close">✕</button>
		</div>

		<div v-if="exito" class="success-message">
			<span>✓ {{ exito }}</span>
			<button @click="exito = null" class="error-close">✕</button>
		</div>

		<div v-if="cargando" class="loading-state">
			<p>Cargando acabados cubre cantos...</p>
		</div>

		<div v-else-if="filteredAcabadoCubreCantos.length === 0" class="empty-state">
			<p>No hay acabados cubre cantos registrados.</p>
			<button class="btn-primary" @click="$router.push('/nuevo-acabado-cubre-canto')">✨ Crear Primer Acabado Cubre Canto</button>
		</div>

		<div v-else class="acabado-cubre-cantos-grid">
			<div
				v-for="acabado in filteredAcabadoCubreCantos"
				:key="acabado.id"
				class="acabado-cubre-canto-card"
			>
				<div class="acabado-cubre-canto-header">
					<h3 class="acabado-cubre-canto-nombre">{{ acabado.nombre || 'Sin nombre' }}</h3>
					<span v-if="acabado.codigo" class="acabado-cubre-canto-codigo">{{ acabado.codigo }}</span>
				</div>

				

				<div v-if="acabado.costo_unitario !== undefined" class="acabado-cubre-canto-info">
					<div class="info-item">
						<label>💰 Costo</label>
						<span>${{ formatCurrency(acabado.costo_unitario || 0) }}</span>
					</div>
				</div>

				<div class="card-actions">
					<button class="btn-edit" @click="editarAcabadoCubreCanto(acabado.id)">Editar</button>
					<button class="btn-delete" @click="confirmarEliminar(acabado.id)">Eliminar</button>
				</div>
			</div>
		</div>

		<!-- Modal de confirmación de eliminación -->
		<div v-if="modalEliminar" class="modal-overlay" @click.self="modalEliminar = false">
			<div class="modal-content">
				<h3>Confirmar eliminación</h3>
				<p>¿Estás seguro de que deseas eliminar este acabado cubre canto?</p>
				<div class="modal-actions">
					<button class="btn-secondary" @click="modalEliminar = false">Cancelar</button>
					<button class="btn-delete" @click="eliminarAcabadoCubreCanto">Eliminar</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { fetchAcabadoCubreCantos, eliminarAcabadoCubreCanto as deleteAcabadoCubreCanto } from '@/http/acabado_cubre-cantos-api.js';

const router = useRouter();

const acabadoCubreCantos = ref([]);
const cargando = ref(true);
const error = ref(null);
const exito = ref(null);
const modalEliminar = ref(false);
const acabadoCubreCantoAEliminar = ref(null);
const searchTerm = ref('');

const cargarAcabadoCubreCantos = async () => {
	try {
		cargando.value = true;
		error.value = null;
		const response = await fetchAcabadoCubreCantos();
		const data = Array.isArray(response) ? response : (response.data || response || []);
		acabadoCubreCantos.value = data;
	} catch (err) {
		console.error(err);
		error.value = 'Error al cargar los acabados cubre cantos';
		acabadoCubreCantos.value = [];
	} finally {
		cargando.value = false;
	}
};

const editarAcabadoCubreCanto = (id) => {
	router.push(`/editar-acabado-cubre-canto/${id}`);
};

const confirmarEliminar = (id) => {
	acabadoCubreCantoAEliminar.value = id;
	modalEliminar.value = true;
};

const eliminarAcabadoCubreCanto = async () => {
	try {
		await deleteAcabadoCubreCanto(acabadoCubreCantoAEliminar.value);
		exito.value = 'Acabado cubre canto eliminado correctamente';
		modalEliminar.value = false;
		await cargarAcabadoCubreCantos();
	} catch (err) {
		error.value = 'Error al eliminar el acabado cubre canto';
		console.error(err);
	}
};

const formatCurrency = (value) => {
	if (!value) return '0.00';
	return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const filteredAcabadoCubreCantos = computed(() => {
	const term = searchTerm.value.trim().toLowerCase();
	if (!term) return acabadoCubreCantos.value;

	return acabadoCubreCantos.value.filter((acabado) => {
		const nombre = (acabado.nombre || '').toLowerCase();
		const codigo = (acabado.codigo || '').toLowerCase();
		const descripcion = (acabado.descripcion || '').toLowerCase();
		return nombre.includes(term) || codigo.includes(term) || descripcion.includes(term);
	});
});

onMounted(() => {
	cargarAcabadoCubreCantos();
});
</script>

<style scoped>
.acabado-cubre-cantos-container {
	padding: 2rem;
	max-width: 1400px;
	margin: 0 auto;
}

.page-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 2rem;
	padding-bottom: 1.5rem;
	border-bottom: 2px solid #e0e0e0;
}

.page-title {
	font-size: 2rem;
	font-weight: 600;
	color: #333;
	margin: 0;
}

.btn-primary {
	background-color: #4CAF50;
	color: white;
	padding: 0.75rem 1.5rem;
	border: none;
	border-radius: 4px;
	font-size: 1rem;
	cursor: pointer;
	transition: background-color 0.3s;
}

.btn-primary:hover {
	background-color: #45a049;
}

.search-bar {
	position: relative;
	margin-bottom: 1.5rem;
}

.search-input {
	width: 100%;
	padding: 0.75rem 2.5rem 0.75rem 1rem;
	border: 1px solid #e0e0e0;
	border-radius: 8px;
	font-size: 1rem;
	box-sizing: border-box;
	transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus {
	outline: none;
	border-color: #4CAF50;
	box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.15);
}

.search-clear {
	position: absolute;
	right: 0.75rem;
	top: 50%;
	transform: translateY(-50%);
	border: none;
	background: #f5f5f5;
	color: #666;
	width: 28px;
	height: 28px;
	border-radius: 50%;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background-color 0.2s, color 0.2s;
}

.search-clear:hover {
	background: #e0e0e0;
	color: #333;
}

.error-message {
	padding: 1rem;
	margin-bottom: 1.5rem;
	background-color: #ffebee;
	color: #c62828;
	border: 1px solid #ef5350;
	border-radius: 4px;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.success-message {
	padding: 1rem;
	margin-bottom: 1.5rem;
	background-color: #e8f5e9;
	color: #2e7d32;
	border: 1px solid #66bb6a;
	border-radius: 4px;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.error-close {
	background: none;
	border: none;
	color: inherit;
	cursor: pointer;
	font-size: 1.2rem;
}

.loading-state,
.empty-state {
	text-align: center;
	padding: 3rem 2rem;
	background-color: #f5f5f5;
	border-radius: 4px;
	color: #666;
}

.loading-state p,
.empty-state p {
	margin: 0 0 1.5rem 0;
	font-size: 1.1rem;
}

.acabado-cubre-cantos-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 1.5rem;
}

.acabado-cubre-canto-card {
	background: white;
	border: 1px solid #e0e0e0;
	border-radius: 8px;
	padding: 1.5rem;
	transition: box-shadow 0.3s, transform 0.3s;
	display: flex;
	flex-direction: column;
}

.acabado-cubre-canto-card:hover {
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	transform: translateY(-2px);
}

.acabado-cubre-canto-header {
	display: flex;
	justify-content: space-between;
	align-items: start;
	margin-bottom: 1rem;
}

.acabado-cubre-canto-nombre {
	font-size: 1.2rem;
	font-weight: 600;
	color: #333;
	margin: 0;
	flex: 1;
}

.acabado-cubre-canto-codigo {
	background-color: #e8f5e9;
	color: #2e7d32;
	padding: 0.25rem 0.75rem;
	border-radius: 4px;
	font-size: 0.85rem;
	font-weight: 500;
	white-space: nowrap;
	margin-left: 0.5rem;
}

.acabado-cubre-canto-descripcion {
	color: #666;
	font-size: 0.95rem;
	margin: 0.5rem 0 1rem 0;
	line-height: 1.4;
	flex-grow: 1;
}

.acabado-cubre-canto-info {
	display: grid;
	grid-template-columns: 1fr;
	gap: 1rem;
	margin: 1rem 0 0 0;
	padding: 1.2rem;
	background: linear-gradient(135deg, #f5f5f5 0%, #f9f9f9 100%);
	border: 2px solid #d4a574;
	border-radius: 8px;
}

.info-item {
	display: flex;
	flex-direction: column;
}

.info-item label {
	font-size: 0.85rem;
	color: #999;
	font-weight: 600;
	margin-bottom: 0.5rem;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.info-item span {
	font-size: 1.3rem;
	color: #d4a574;
	font-weight: 700;
}

.card-actions {
	display: flex;
	gap: 0.75rem;
	margin-top: 1rem;
}

.btn-edit,
.btn-delete {
	flex: 1;
	padding: 0.6rem 1rem;
	border: none;
	border-radius: 4px;
	font-size: 0.9rem;
	cursor: pointer;
	transition: opacity 0.3s;
}

.btn-edit {
	background-color: #2196F3;
	color: white;
}

.btn-edit:hover {
	opacity: 0.8;
}

.btn-delete {
	background-color: #f44336;
	color: white;
}

.btn-delete:hover {
	opacity: 0.8;
}

.btn-secondary {
	background-color: #9e9e9e;
	color: white;
	padding: 0.75rem 1.5rem;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	transition: background-color 0.3s;
}

.btn-secondary:hover {
	background-color: #757575;
}

.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
}

.modal-content {
	background: white;
	padding: 2rem;
	border-radius: 8px;
	max-width: 400px;
	width: 90%;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
	margin: 0 0 1rem 0;
	color: #333;
}

.modal-content p {
	color: #666;
	margin: 0 0 1.5rem 0;
}

.modal-actions {
	display: flex;
	gap: 1rem;
	justify-content: flex-end;
}

.modal-actions button {
	padding: 0.75rem 1.5rem;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-size: 1rem;
}

.modal-actions .btn-secondary {
	background-color: #9e9e9e;
	color: white;
	flex: 1;
}

.modal-actions .btn-delete {
	background-color: #f44336;
	color: white;
	flex: 1;
}
</style>
