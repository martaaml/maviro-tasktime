<template>
  <div class="perfil-container">
    <!-- Header dinámico -->
    <HeaderAdmin v-if="esAdmin" />
    <HeaderEmpleado v-else />

    <h2>Mi Perfil</h2>

    <div class="glass">
      <!-- Foto del usuario -->
      <div class="perfil-foto">
        <img :src="usuario.fotoURL || '/default-avatar.png'" alt="Foto de perfil" />
        <label for="subirFoto" class="btn-subir">Cambiar foto</label>
        <input type="file" id="subirFoto" @change="subirFoto" />
      </div>

      <!-- Información del usuario -->
      <div class="perfil-info">
        <div class="campo">
          <label>Nombre</label>
          <input type="text" v-model="usuario.nombre" disabled />
        </div>

        <div class="campo">
          <label>Apellidos</label>
          <input type="text" v-model="usuario.apellidos" disabled />
        </div>

        <div class="campo">
          <label>Correo corporativo</label>
          <input type="email" v-model="usuario.email" />
        </div>

        <div class="campo">
          <label>Puesto</label>
          <input type="text" v-model="usuario.puesto" disabled />
        </div>

        <div class="campo">
          <label>Departamento</label>
          <input type="text" v-model="usuario.departamento" disabled />
        </div>

        <div class="acciones">
        <button class="btn-cambios" @click="editarDatos">Editar datos</button>
          <button class="btn-password" @click="cambiarPassword">Cambiar contraseña</button>
        </div>

        <p v-if="mensaje" :class="mensajeTipo">{{ mensaje }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { auth, db } from "@/firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import HeaderAdmin from "@/components/layout/header/HeaderAdmin.vue";
import HeaderEmpleado from "@/components/layout/header/HeaderEmpleado.vue";

const usuario = ref({});
const esAdmin = ref(false);
const mensaje = ref("");
const mensajeTipo = ref("");

// Cargar datos del usuario
onMounted(() => {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "usuarios", user.uid);
  getDoc(userRef)
    .then((snap) => {
      if (snap.exists()) {
        usuario.value = snap.data();
        esAdmin.value = usuario.value.rol === "admin";
      }
    })
    .catch((err) => console.error("Error al obtener usuario:", err));
});

// Cambiar contraseña
function cambiarPassword() {
  mensaje.value = "Redirigiendo al cambio de contraseña...";
  mensajeTipo.value = "exito";
  setTimeout(() => {
    window.location.href = "/cambiar-password";
  }, 1000);
}

//Editar correo
const editarDatos = function() {
  try {
    const user = auth.currentUser;
    if (!user) {
      mensaje.value = "No hay usuario autenticado";
      mensajeTipo.value = "error";
      return;
    }

    updateDoc(doc(db, "usuarios", user.uid), {
      email: usuario.value.email,
    })
      .then(() => {
        mensaje.value = "Correo actualizado correctamente";
        mensajeTipo.value = "exito";
      })
      .catch((err) => {
        console.error("Error al actualizar el correo:", err);
        mensaje.value = "❌ Cambio de correo fallido";
        mensajeTipo.value = "error";
      });

  } catch (err) {
    console.error("Error general:", err);
    mensaje.value = "❌ Ocurrió un error inesperado";
    mensajeTipo.value = "error";
  }
};


// Subir foto (solo mensaje temporal)
function subirFoto() {
 if (usuario.value.fotoURL) {
    mensaje.value = "Foto actualizada correctamente";
    mensajeTipo.value = "exito";
 } else {
    mensaje.value = "Foto no actualizada";
    mensajeTipo.value = "error";
 }  
}
</script>

<style scoped>
@import "@/styles/Perfil.css";
</style>
