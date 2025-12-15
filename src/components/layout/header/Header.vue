<template>
  <header class="main-header">
    <!-- IZQUIERDA -->
    <div class="header-left">
      <img class="logo" src="../../../assets/logo.png" alt="logo" width="40" height="40" />
      <h1 class="empresa">Maviro</h1>
    </div>

    <!-- DERECHA -->
    <div class="header-right">
      <span class="bienvenida">Bienvenid@</span>
      <nav class="menu-iconos">
        <!-- Perfil -->
        <button title="Perfil" @click="irA('/perfil')">
          <img src="../../../assets/perfil.svg" alt="Perfil" width="40" height="40"></img>
        </button>
        <!-- Cerrar sesión -->
        <button title="Cerrar sesión" @click="cerrarSesion">
          <img src="../../../assets/logout.svg" alt="Cerrar sesión"  width="40" height="40"></img>
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref } from "vue";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";

const router = useRouter();


function irA(ruta) {
  router.push(ruta);
}

function cerrarSesion() {
  signOut(auth)
    .then(() => {
      localStorage.removeItem("userData");
      router.push("/login");
    })
    .catch((error) => console.error("Error al cerrar sesión:", error));
}
</script>
<style scoped>
@import url("../../../styles/Header.css");
</style>