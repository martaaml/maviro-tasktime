<template>
  <div class="tareas-empleado">
    <HeaderEmpleado />

    <div class="cabecera">
      <h1 class="titulo">Mis tareas</h1>
      <p class="subtitulo">Aquí puedes incurrir horas y cerrar tareas cuando estén listas.</p>
    </div>

    <div v-if="cargando" class="estado-carga">Cargando tareas...</div>
    <div v-else>
      <div v-if="tareas.length === 0" class="vacio">
        No tienes tareas asignadas ahora mismo.
      </div>

      <ListaTareas
        v-else
        :tareas="tareasVisibles"
        @incurrir="incurrirHoras"
        @cerrar="cerrarTarea"
      />
    </div>

    <p v-if="mensaje" class="mensaje">{{ mensaje }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import HeaderEmpleado from "@/components/layout/header/HeaderEmpleado.vue";
import { auth, db } from "@/firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";

import ListaTareas from "@/components/tareas/ListaTareas.vue";

const tareas = ref([]);
const cargando = ref(true);
const mensaje = ref("");

function setMensaje(txt) {
  mensaje.value = txt;
  setTimeout(() => (mensaje.value = ""), 2500);
}

function cargarTareas() {
  cargando.value = true;

  const user = auth.currentUser;
  if (!user) {
    cargando.value = false;
    setMensaje("No hay sesión activa.");
    return;
  }

  const q = query(
    collection(db, "tareas"),
    where("usuarioAsignado", "==", user.uid)
  );

  getDocs(q)
    .then((snap) => {
      tareas.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    })
    .catch((err) => {
      console.error(err);
      setMensaje("Error cargando tareas.");
    })
    .finally(() => {
      cargando.value = false;
    });
}

const tareasVisibles = computed(() => {
 
  return tareas.value.filter((t) => (t.estado || "").toLowerCase() !== "cerrada");
 
});

function incurrirHoras({ tareaId, horas }) {
  const h = Number(horas);
  if (!h || h <= 0) return;

  const t = tareas.value.find((x) => x.id === tareaId);
  if (!t) return;

  const incurridasActual = Number(t.horasIncurridas || 0);
  const restantesActual = Number(t.horasRestantes || 0);

  const nuevasIncurridas = incurridasActual + h;
  const nuevasRestantes = Math.max(0, restantesActual - h);

  const refDoc = doc(db, "tareas", tareaId);

  updateDoc(refDoc, {
    horasIncurridas: nuevasIncurridas,
    horasRestantes: nuevasRestantes,
    actualizadaEn: new Date().toISOString(),
  })
    .then(() => {
      // actualizar estado local
      t.horasIncurridas = nuevasIncurridas;
      t.horasRestantes = nuevasRestantes;

      setMensaje(`Horas registradas: +${h}h`);
    })
    .catch((err) => {
      console.error(err);
      setMensaje("No se pudieron registrar las horas.");
    });
}

function cerrarTarea(tareaId) {
  const t = tareas.value.find((x) => x.id === tareaId);
  if (!t) return;

  const refDoc = doc(db, "tareas", tareaId);

  updateDoc(refDoc, {
    estado: "cerrada",
    actualizadaEn: new Date().toISOString(),
  })
    .then(() => {
      // animación: quitamos de la lista (ListaTareas usa transition-group)
      t.estado = "cerrada";
     
      setMensaje("Tarea cerrada ✅");
    })
    .catch((err) => {
      console.error(err);
      setMensaje("No se pudo cerrar la tarea.");
    });
}

onMounted(() => {
  cargarTareas();
});
</script>

<style scoped>
.tareas-empleado {
  width: 100%;
  min-height: 100vh;
  padding: 0;
  margin: 0;
}

.cabecera {
  padding: 18px 22px;
}

.titulo {
  margin: 0;
  font-size: 2.2rem;
  font-weight: 800;
  color: #0f2b46;
}

.subtitulo {
  margin: 6px 0 0;
  color: #3b556b;
  font-weight: 500;
}

.estado-carga {
  padding: 18px 22px;
  color: #2b3d4d;
}

.vacio {
  padding: 18px 22px;
  color: #2b3d4d;
  font-weight: 600;
}

.mensaje {
  position: fixed;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #065f46;
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 700;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 25px rgba(0,0,0,.08);
}
</style>
