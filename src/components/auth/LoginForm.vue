<template>
  <div class="login-page">
    <!-- Fondo degradado y overlay -->
    <div class="overlay"></div>
    <!-- Formulario -->
    <div class="login-container">
      <form @submit.prevent="handleLogin" class="login-form">
        <h2>Inicia sesión</h2>

        <div class="input-group">
          <input
            v-model="email"
            type="email"
            required
            placeholder=" "
            id="email"
          />
          <label for="email">Correo corporativo</label>
        </div>

        <div class="input-group">
          <input
            v-model="password"
            type="password"
            required
            placeholder=" "
            id="password"
          />
          <label for="password">Contraseña</label>
    <div class="info-login">
      <p class="first-access">Cambia la contraseña en tu primer acceso</p>
      <p class="unique-access">ACCESO ÚNICO PARA TRABAJADORES</p>
    </div>
        </div>

        <button type="submit" :disabled="loading">
          {{ loading ? "Entrando..." : "Acceder" }}
        </button>

        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>

    <!-- Burbuja tipo chat (derecha) -->
    <div class="chat-bubbles">
      <div class="bubble bubble-1">👋 ¡Hola de nuevo!</div>
      <div class="bubble bubble-2">📊 Revisa tus tareas</div>
      <div class="bubble bubble-3">💼 Gestiona tu equipo</div>
      <div class="bubble bubble-4">💬 Conecta con tus compañeros</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig";

const router = useRouter();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const handleLogin = async () => {
  error.value = "";
  loading.value = true;

  try {
    const cred = await signInWithEmailAndPassword(auth, email.value, password.value);
    const uid = cred.user.uid;
    const snap = await getDoc(doc(db, "usuarios", uid));

    if (!snap.exists()) throw new Error("Usuario no encontrado");

    const data = snap.data();
    if (data.contraseñaTemporal) router.push("/cambiar-password");
    else router.push(data.rol === "admin" ? "/panel-admin" : "/panel-empleado");
  } catch (err) {
    error.value = "Correo o contraseña incorrectos";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@import "@/styles/LoginForm.css";
</style>
