<template>
  <div class="change-password">
    <h2>Cambiar contraseña</h2>
    <p>Tu seguridad nos importa.</p>
    <form @submit.prevent="onChangePassword">
      <label>
        <input v-model="newPassword" type="password" required placeholder="Nueva contraseña"/>
      </label>

      <label>
        <input v-model="confirmPassword" type="password" required  placeholder="Confirmar contraseña"/>
      </label>

      <button type="submit">Guardar nueva contraseña</button>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { updatePassword } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig";

const router = useRouter();
const newPassword = ref("");
const confirmPassword = ref("");
const error = ref("");
const success = ref("");

function onChangePassword() {
  error.value = "";
  success.value = "";

  if (newPassword.value !== confirmPassword.value) {
    error.value = "Las contraseñas no coinciden";
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    error.value = "No hay usuario autenticado";
    return;
  }

  // 🔹 Actualizar la contraseña en Firebase Authentication
  updatePassword(user, newPassword.value)
    .then(function () {
      const userRef = doc(db, "usuarios", user.uid);
      // 🔹 Actualizamos el campo de contraseña temporal
      return updateDoc(userRef, { contraseñaTemporal: false });
    })
    .then(function () {
      const userRef = doc(db, "usuarios", user.uid);
      return getDoc(userRef);
    })
    .then(function (snap) {
      const data = snap.data();
      success.value = "Contraseña actualizada correctamente";

      // Redirección según rol
      setTimeout(function () {
        if (data.rol === "admin") {
          router.push("/panel-admin");
        } else {
          router.push("/panel-empleado");
        }
      }, 1500);
    })
    .catch(function (err) {
      console.error(err);
      error.value = "Error al cambiar la contraseña.";
    });
}
</script>

<style scoped>
 @import url("../../styles/CambioContraseña.css"); 
</style>
