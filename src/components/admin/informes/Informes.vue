<template>
  <div class="informes">
    <HeaderAdmin />

    <h1 class="titulo">Informes</h1>

    <section class="bloque">
      <h2>Horas trabajadas por departamento</h2>

      <select v-model="departamentoHoras" class="select">
        <option disabled value="">Selecciona un departamento</option>
        <option v-for="d in departamentos" :key="d" :value="d">
          {{ d }}
        </option>
      </select>

      <canvas ref="chartHoras"></canvas>
    </section>

    <section class="bloque">
      <h2>Estado de tareas</h2>

      <label class="switch">
        <input type="checkbox" v-model="usarDepartamentoTareas" />
        <span class="slider"></span>
        <span class="texto-switch"> Filtrar por departamento </span>
      </label>

      <select
        v-if="usarDepartamentoTareas"
        v-model="departamentoTareas"
        class="select"
      >
        <option disabled value="">Selecciona un departamento</option>
        <option v-for="d in departamentos" :key="d" :value="d">
          {{ d }}
        </option>
      </select>
      <canvas ref="chartTareas"></canvas>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import HeaderAdmin from "@/components/layout/header/HeaderAdmin.vue";
import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import Chart from "chart.js/auto";

const chartHoras = ref(null);
const chartTareas = ref(null);
let graficoHoras = null;
let graficoTareas = null;


const usuarios = ref([]);
const fichajes = ref([]);
const tareas = ref([]);

const departamentos = ref([]);
const departamentoHoras = ref("");
const usarDepartamentoTareas = ref(false);
const departamentoTareas = ref("");


function cargarDatos() {
  Promise.all([
  getDocs(collection(db, "usuarios")),
  getDocs(collection(db, "fichajes")),
  getDocs(collection(db, "tareas")),
  ]).then(([uSnap, fSnap, tSnap]) => {
    usuarios.value = uSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    fichajes.value = fSnap.docs.map(d => d.data());
    tareas.value = tSnap.docs.map(d => d.data());

    departamentos.value = [ 
      ...new Set(usuarios.value.map(u => u.departamento).filter(Boolean)),
  ];
  });
}


function pintarHoras() {
  if (!departamentoHoras.value) return;

    const usuariosDepto = usuarios.value.filter(
    u => u.departamento === departamentoHoras.value
  );

  const labels = usuariosDepto.map(u => u.nombre);
  const data = usuariosDepto.map(u => {
  const totalMin = fichajes.value
  .filter(f => f.uid === u.id)
  .reduce((sum, f) => sum + (f.duracionMin || 0), 0);

  return Math.round((totalMin / 60) * 10) / 10;
  });

  if (graficoHoras) graficoHoras.destroy();

  graficoHoras = new Chart(chartHoras.value, { type: "bar",data: {labels,
datasets: [{
  label: "Horas trabajadas",
  data,
  backgroundColor: "#60a5fa", },],},
  options: { responsive: true,},});
}


function pintarTareas() {
let lista = tareas.value;

  if (usarDepartamentoTareas.value && departamentoTareas.value) {
    lista = lista.filter(
    t => t.departamento === departamentoTareas.value
    );
  }

  let pendientes = 0;
  let activas = 0;
  let cerradas = 0;

  lista.forEach(t => {
  if (t.estado === "cerrada") cerradas++;
  else if ((t.horasIncurridas || 0) > 0) activas++;
  else pendientes++;});

  if (graficoTareas) graficoTareas.destroy();

  graficoTareas = new Chart(chartTareas.value, {
  type: "pie",
  data: {
  labels: ["Pendientes", "Activas", "Cerradas"],
  datasets: [{data: [pendientes, activas, cerradas],
  backgroundColor: ["#facc15", "#60a5fa", "#22c55e"],},],},
  options: {
  responsive: true,},
  });
}


watch(departamentoHoras, pintarHoras);
watch([usarDepartamentoTareas, departamentoTareas], pintarTareas);

//Init
onMounted(() => {
  cargarDatos();
});
</script>
<style scoped>

.informes {
  padding: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.titulo {
  margin-bottom: 1rem;
  font-size: 2rem;
}

.bloque {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.bloque h2 {
  font-size: 1.25rem;
  margin-top: 0;
  margin-bottom: 0.8rem;
}

.select {
  margin: 0.5rem 0;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 0.95rem;
}

.switch {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
  cursor: pointer; 
  font-size: 0.95rem; 
}


.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  width: 25px;
  height: 18px; 
  border-radius: 18px;
  background-color: #ccc;
  transition: 0.4s;
  position: relative;
}


.slider:before {
  position: absolute;
  content: "";
  height: 10px; 
  width: 10px; 
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4); 
}


.switch input:checked + .slider {
  background-color: #60a5fa;
}

.switch input:checked + .slider:before {
  /* Mueve el círculo a la derecha */
  transform: translateX(14px);
}

.texto-switch {
  font-weight: 50;
  font-size: 0.95rem;
}
</style>