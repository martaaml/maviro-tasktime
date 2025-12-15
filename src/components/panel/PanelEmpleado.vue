<template>
  <PanelBase>
    <!-- SIDEBAR -->
    <template #sidebar>
      <ul>
        <li>
          <button class="button-panel" @click="irA('/tarea-empleado')">
            🗂️ Ver mis tareas
          </button>
        </li>
        <li>
          <button class="button-panel" @click="irA('/fichaje')">
            🕒 Fichar
          </button>
        </li>
        <li>
          <button class="button-panel" @click="irA('/perfil')">
            👤 Perfil
          </button>
        </li>
      </ul>
    </template>

    <!-- CONTENIDO -->
    <h2 class="titulo-panel">Panel del empleado</h2>

    <div class="widgets-grid">
      <!-- TAREAS -->
      <div class="widget-card">
        <div class="widget-header">
          <h3>✅ Tareas pendientes</h3>
          <span class="contador">{{ tareasPendientes.length }}</span>
        </div>

        <p class="widget-intro">
          Tienes <b>{{ tareasPendientes.length }}</b> tareas activas.
        </p>

        <div v-if="proximaTarea" class="widget-preview">
          <h4>Próxima tarea</h4>
          <p>
            {{ proximaTarea.nombreTarea }}
            <span class="prioridad">{{ proximaTarea.prioridad }}</span>
          </p>
        </div>

        <button class="btn-ver" @click="irA('/tarea-empleado')">
          Ver todas
        </button>
      </div>

      <!-- FICHAJE -->
      <div class="widget-card">
        <div class="widget-header">
          <h3>🕒 Último fichaje</h3>
        </div>

        <p class="widget-intro">Última acción registrada</p>

        <div v-if="ultimoFichaje" class="widget-preview">
          <p>
            {{ ultimoFichaje.tipo }} —
            {{ new Date(ultimoFichaje.fecha).toLocaleString() }}
          </p>
        </div>

        <button class="btn-ver" @click="irA('/fichaje')">
          Ir a fichar
        </button>
      </div>

      <!-- PERFIL -->
      <div class="widget-card">
        <div class="widget-header">
          <h3>👤 Tu perfil</h3>
        </div>

        <p class="widget-intro">
          {{ usuario?.puesto }}
        </p>

        <div class="widget-preview">
          <p>{{ usuario?.departamento }}</p>
        </div>

        <button class="btn-ver" @click="irA('/perfil')">
          Ver perfil
        </button>
      </div>
    </div>
  </PanelBase>
</template>

<script setup>
import PanelBase from "./PanelBase.vue";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { auth, db } from "@/firebase/firebaseConfig";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";

const router = useRouter();
function irA(ruta) {
  router.push(ruta);
}

/* ESTADO */
const usuario = ref(null);
const tareasPendientes = ref([]);
const proximaTarea = ref(null);
const ultimoFichaje = ref(null);

/* CARGAR USUARIO */
function cargarUsuario() {
  const uid = auth.currentUser.uid;

  getDocs(collection(db, "usuarios")).then((snap) => {
    snap.forEach((doc) => {
      if (doc.id === uid) {
        usuario.value = doc.data();
      }
    });
  });
}

/* CARGAR TAREAS */
function cargarTareas() {
  const uid = auth.currentUser.uid;

  getDocs(
    query(
      collection(db, "tareas"),
      where("usuarioAsignado", "==", uid),
      where("estado", "==", "activa")
    )
  ).then((snap) => {
    const lista = [];
    snap.forEach((d) => lista.push({ id: d.id, ...d.data() }));
    tareasPendientes.value = lista;
    proximaTarea.value = lista[0] || null;
  });
}

/* CARGAR FICHAJE */
function cargarUltimoFichaje() {
  const uid = auth.currentUser.uid;

  getDocs(
    query(
      collection(db, "fichajes"),
      where("uid", "==", uid),
      orderBy("fecha", "desc"),
      limit(1)
    )
  ).then((snap) => {
    snap.forEach((d) => {
      ultimoFichaje.value = d.data();
    });
  });
}

onMounted(() => {
  if (!auth.currentUser) return;
  cargarUsuario();
  cargarTareas();
  cargarUltimoFichaje();
});
</script>

<style scoped>
@import "@/styles/Panel.css";
</style>
