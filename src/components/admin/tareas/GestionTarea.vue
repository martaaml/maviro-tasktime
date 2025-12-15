<script setup>
import { ref, onMounted, computed, watch } from "vue";
import HeaderAdmin from "../../layout/header/HeaderAdmin.vue";
import { db } from "../../../firebase/firebaseConfig";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";


const mostrarFormulario = ref(false);
const mostrarFiltros = ref(false);
const editando = ref(false);
const tareaEditandoId = ref(null);

// Campos del formulario
const nombreTarea = ref("");
const descripcion = ref("");
const estado = ref("activa"); // puede ser activa o cerrada
const prioridad = ref("media"); // puede ser alta, media o baja
const horasIncurridas = ref(0);
const horasRestantes = ref(0);
const usuarioAsignado = ref("");
const departamento = ref("");

// Datos
const tareas = ref([]);
const usuarios = ref([]);

// Borrado animado
const borrandoIds = ref(new Set());

// Cargar usuarios
function cargarUsuarios() {
  getDocs(collection(db, "usuarios"))
    .then((snap) => {
      usuarios.value = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
    })
    .catch(console.error);
}

// Cargar tareas
function cargarTareas() {
  getDocs(collection(db, "tareas"))
    .then((snap) => {
      tareas.value = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
    })
    .catch(console.error);
}

// Formulario
function abrirFormularioNueva() {
  limpiarFormulario();
  mostrarFormulario.value = true;
}

// Editar tarea
function editarTarea(tarea) {
  mostrarFormulario.value = true;
  editando.value = true;
  tareaEditandoId.value = tarea.id;

  nombreTarea.value = tarea.nombreTarea || "";
  descripcion.value = tarea.descripcion || "";
  estado.value = tarea.estado || "activa";
  prioridad.value = tarea.prioridad || "media";
  horasIncurridas.value = Number(tarea.horasIncurridas || 0);
  horasRestantes.value = Number(tarea.horasRestantes || 0);
  usuarioAsignado.value = tarea.usuarioAsignado || "";
  departamento.value = tarea.departamento || "";
}

// Guardar tarea
function guardarTarea() {
  const data = {
    nombreTarea: nombreTarea.value,
    descripcion: descripcion.value,
    estado: estado.value,
    prioridad: prioridad.value,
    horasIncurridas: Number(horasIncurridas.value),
    horasRestantes: Number(horasRestantes.value),
    usuarioAsignado: usuarioAsignado.value,
    departamento: departamento.value, // NUEVO
    actualizadaEn: new Date().toISOString(),
  };

  // Si estamos editando
  if (editando.value && tareaEditandoId.value) {
    updateDoc(doc(db, "tareas", tareaEditandoId.value), data)
      .then(() => {
        cerrarFormulario();
        cargarTareas();
      })
      .catch(console.error);

      // Si no estamos editando
  } else {
    addDoc(collection(db, "tareas"), {
      ...data,
      creadaEn: new Date().toISOString(),
    })
      .then(() => {
        cerrarFormulario();
        cargarTareas();
      })
      .catch(console.error);
  }
}

// Eliminar tarea
function eliminarTarea(tareaId) {
  if (!confirm("¿Eliminar esta tarea?")) return;

  // animación
  borrandoIds.value.add(tareaId);

  setTimeout(() => {
    deleteDoc(doc(db, "tareas", tareaId))
      .then(() => {
        borrandoIds.value.delete(tareaId);
        cargarTareas();
      })
      .catch((err) => {
        borrandoIds.value.delete(tareaId);
        console.error(err);
      });
  }, 350);
}

function cerrarFormulario() {
  mostrarFormulario.value = false;
  limpiarFormulario();
}

function limpiarFormulario() {
  nombreTarea.value = "";
  descripcion.value = "";
  estado.value = "activa";
  prioridad.value = "media";
  horasIncurridas.value = 0;
  horasRestantes.value = 0;
  usuarioAsignado.value = "";
  departamento.value = "";
  editando.value = false;
  tareaEditandoId.value = null;
}

// Filtrar tareas
const filtroUsuario = ref("");
const filtroDepartamento = ref("");
const filtroEstado = ref("");
const filtroPrioridad = ref("");

const tareasFiltradas = computed(() => {
  return tareas.value.filter((t) => {
    if (filtroUsuario.value && t.usuarioAsignado !== filtroUsuario.value) return false;
    if (filtroDepartamento.value && (t.departamento || "") !== filtroDepartamento.value) return false;
    if (filtroEstado.value && t.estado !== filtroEstado.value) return false;
    if (filtroPrioridad.value && t.prioridad !== filtroPrioridad.value) return false;
    return true;
  });
});

const departamentosDisponibles = computed(() => {
  const set = new Set();
  usuarios.value.forEach((u) => {
    if (u.departamento) set.add(u.departamento);
  });
  return Array.from(set).sort();
});


/* Autorrellenar departamento al seleccionar usuario */
watch(usuarioAsignado, (uid) => {
  const u = usuarios.value.find((x) => x.id === uid);
  if (u?.departamento) departamento.value = u.departamento;
});


function nombreUsuario(uid) {
  const u = usuarios.value.find((x) => x.id === uid);
  return u ? `${u.nombre || ""} ${u.apellido || ""}`.trim() : "—";
}

onMounted(() => {
  cargarUsuarios();
  cargarTareas();
});
</script>

<template>
  <HeaderAdmin />

  <div class="gestion-tareas">
    <div class="top-bar">
      <h1>Gestión de tareas</h1>

      <div class="top-actions">
        <button class="btn-top" type="button" @click="abrirFormularioNueva">
          + Crear nueva tarea
        </button>

        <button class="btn-top filtros" type="button" @click="mostrarFiltros = !mostrarFiltros">
          Filtros
        </button>
      </div>
    </div>

    <!-- FILTROS -->
    <div v-if="mostrarFiltros" class="filtros-panel">
      <select v-model="filtroUsuario">
        <option value="">Todos los usuarios</option>
        <option v-for="u in usuarios" :key="u.id" :value="u.id">
          {{ u.nombre }} {{ u.apellido }}
        </option>
      </select>

      <select v-model="filtroDepartamento">
        <option value="">Todos los departamentos</option>
        <option v-for="d in departamentosDisponibles" :key="d" :value="d">
          {{ d }}
        </option>
      </select>

      <select v-model="filtroEstado">
        <option value="">Todos los estados</option>
        <option value="activa">Activa</option>
        <option value="cerrada">Cerrada</option>
      </select>

      <select v-model="filtroPrioridad">
        <option value="">Todas las prioridades</option>
        <option value="alta">Alta</option>
        <option value="media">Media</option>
        <option value="baja">Baja</option>
      </select>
    </div>

    <!-- FORMULARIO -->
    <div v-if="mostrarFormulario" class="modal-overlay">
  <form class="form-tarea" @submit.prevent="guardarTarea">
    <h3>{{ editando ? "Editar tarea" : "Crear tarea" }}</h3>

    <input v-model="nombreTarea" placeholder="Nombre tarea" required />
    <textarea v-model="descripcion" placeholder="Descripción" required />

    <select v-model="estado">
      <option value="activa">Activa</option>
      <option value="cerrada">Cerrada</option>
    </select>

    <div class="prioridad-botones">
      <button 
        type="button" 
        @click="prioridad = 'alta'" 
        :class="{ 'prioridad-activa': prioridad === 'alta' }"
      >
        Alta
      </button>
      <button 
        type="button" 
        @click="prioridad = 'media'"
        :class="{ 'prioridad-activa': prioridad === 'media' }"
      >
        Media
      </button>
      <button 
        type="button" 
        @click="prioridad = 'baja'"
        :class="{ 'prioridad-activa': prioridad === 'baja' }"
      >
        Baja
      </button>
    </div>

    <input type="number" min="0" v-model.number="horasRestantes" placeholder="Horas restantes" />
    <input type="number" min="0" v-model.number="horasIncurridas" placeholder="Horas incurridas" />

    <select v-model="usuarioAsignado" required>
      <option disabled value="">Selecciona usuario</option>
      <option v-for="u in usuarios" :key="u.id" :value="u.id">
        {{ u.nombre }} {{ u.apellido }}
      </option>
    </select>

    <input v-model="departamento" placeholder="Departamento" />

    <div class="form-actions">
      <button type="button" class="btn-cancelar" @click="cerrarFormulario">
        Cancelar
      </button>
      <button type="submit">
        {{ editando ? "Guardar cambios" : "Crear tarea" }}
      </button>
    </div>
  </form>
</div>

    <!-- LISTA -->
    <section class="lista-tareas">
      <div
        v-for="t in tareasFiltradas"
        :key="t.id"
        class="tarea-card"
        :class="{ 'tarea-borrando': borrandoIds.has(t.id) }"
      >
        <!-- IZQUIERDA -->
        <div class="tarea-texto">
          <h4>
            {{ t.nombreTarea }}
            <span class="prioridad">{{ t.prioridad }}</span>
          </h4>

          <p class="descripcion">{{ t.descripcion }}</p>

          <div class="info-linea">
            <span>Estado: {{ t.estado }}</span>
            <span>Horas: {{ t.horasRestantes }}</span>
            <span>Usuario: {{ nombreUsuario(t.usuarioAsignado) }}</span>
          </div>
        </div>

        <!-- DERECHA -->
        <div class="acciones">
          <button type="button" class="btn-icon btn-editar" @click="editarTarea(t)" title="Editar">
            <img src="../../../assets/editar.svg" alt="Editar" width="30" height="30" />
          </button>

          <button type="button" class="btn-icon btn-eliminar" @click="eliminarTarea(t.id)" title="Eliminar">
            <img src="../../../assets/eliminar.svg" alt="Eliminar" width="30" height="30" />
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@import url("../../../styles/gestionTarea.css");
</style>
