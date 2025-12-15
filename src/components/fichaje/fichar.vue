<template>
  <!-- Header dinámico -->
  <HeaderAdmin v-if="esAdmin" />
  <HeaderEmpleado v-else />

  <div class="fichaje-container">
    <div class="fichaje-card">
      <h2 class="titulo">Control de jornada</h2>

      <!-- Contador -->
      <div class="contador">
        {{ horas.toString().padStart(2, "0") }}:
        {{ minutos.toString().padStart(2, "0") }}:
        {{ segundos.toString().padStart(2, "0") }}
      </div>

      <!-- Botón -->
      <button class="btn-fichar" @click="toggleFichaje">
        {{ fichando ? "FICHAR SALIDA" : "FICHAR ENTRADA" }}
      </button>

      <p v-if="mensaje" class="mensaje">{{ mensaje }}</p>

      <!-- Ubicación -->
      <div v-if="mostrarUbicacion" class="ubicacion">
        <div id="map" class="mapa"></div>
        <p class="direccion">📍 {{ direccion }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { auth, db } from "@/firebase/firebaseConfig";
import { doc, getDoc, addDoc, collection, updateDoc } from "firebase/firestore";
import HeaderAdmin from "../layout/header/HeaderAdmin.vue";
import HeaderEmpleado from "../layout/header/HeaderEmpleado.vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


const esAdmin = ref(false);
const fichando = ref(false);
const horas = ref(0);
const minutos = ref(0);
const segundos = ref(0);
const mensaje = ref("");
const direccion = ref("");
const mostrarUbicacion = ref(false);

let intervalo = null;
let inicio = null;
let fichaId = null;
let mapa = null;
let marcador = null;


async function cargarRolUsuario() {
  const user = auth.currentUser;
  if (!user) return;

  const snap = await getDoc(doc(db, "usuarios", user.uid));
  if (snap.exists()) {
    esAdmin.value = snap.data().rol === "admin";
  }
}


function actualizarContador() {
  const diff = Date.now() - inicio;
  horas.value = Math.floor(diff / 3600000);
  minutos.value = Math.floor((diff % 3600000) / 60000);
  segundos.value = Math.floor((diff % 60000) / 1000);
}


async function toggleFichaje() {
  if (!fichando.value) iniciarFichaje();
  else finalizarFichaje();
}

async function iniciarFichaje() {
  const user = auth.currentUser;
  if (!user) return;

  inicio = Date.now();
  fichando.value = true;
  mostrarUbicacion.value = true;

  intervalo = setInterval(actualizarContador, 1000);

  // Crear registro en Firebase
  const docRef = await addDoc(collection(db, "fichajes"), {
    uid: user.uid,
    entrada: new Date(),
    salida: null,
    duracionMin: 0,
    direccionEntrada: "",
    direccionSalida: "",
  });

  fichaId = docRef.id;

  localStorage.setItem("fichajeActivo", "true");
  localStorage.setItem("fichajeInicio", inicio.toString());
  localStorage.setItem("fichaId", fichaId);

  obtenerUbicacion("entrada");
}

async function finalizarFichaje() {
  fichando.value = false;
  clearInterval(intervalo);

  const duracionMin = Math.floor((Date.now() - inicio) / 60000);
  mensaje.value = `Hoy has trabajado ${horas.value}h ${minutos.value}min`;

  await updateDoc(doc(db, "fichajes", fichaId), {
    salida: new Date(),
    duracionMin,
    direccionSalida: direccion.value,
  });

  localStorage.clear();
  obtenerUbicacion("salida");
}

/* ---------------- UBICACIÓN ---------------- */
function obtenerUbicacion(tipo) {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;

    if (!mapa) {
      mapa = L.map("map").setView([latitude, longitude], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapa);
    }

    if (marcador) marcador.remove();
    marcador = L.marker([latitude, longitude]).addTo(mapa);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
    );
    const data = await res.json();
    direccion.value = data.display_name || "Dirección no disponible";

    if (tipo === "entrada") {
      await updateDoc(doc(db, "fichajes", fichaId), {
        direccionEntrada: direccion.value,
      });
    }
  });
}

/* ---------------- MOUNT ---------------- */
onMounted(() => {
  cargarRolUsuario();

  const activo = localStorage.getItem("fichajeActivo");
  const inicioGuardado = localStorage.getItem("fichajeInicio");
  const idGuardado = localStorage.getItem("fichaId");

  if (activo && inicioGuardado && idGuardado) {
    fichando.value = true;
    inicio = parseInt(inicioGuardado);
    fichaId = idGuardado;
    intervalo = setInterval(actualizarContador, 1000);
    mostrarUbicacion.value = true;
    obtenerUbicacion("entrada");
  }
});

onUnmounted(() => clearInterval(intervalo));
</script>
<style scoped>
  @import "@/styles/fichar.css";  
</style>