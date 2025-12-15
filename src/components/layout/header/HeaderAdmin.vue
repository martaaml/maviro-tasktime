<template>
<header class="header-admin">

    <div class="header-left">
    <img class="logo" src="../../../assets/logo.png" alt="logo" width="50" height="50" v-on:click="irA('/panel-admin')">
    </img>
    <h1 class="empresa">Maviro</h1>
    </div>
    <div class="header-right">
    <span class="bienvenida">Bienvenid@</span>

    <!--Navegador de admin-->
    <nav class="menu-iconos">
        <!--Icnono para el informe -->
        <button title="Informes" v-on:click="irA('/admin/informes')">
            <img src="../../../assets/informes.svg" alt="Informes" width="40" height="40"></img>
        </button>
        <!--Icono para gestionar tareas -->
        <button title="Gestionar tareas" v-on:click="irA('/admin/tareas')">
            <img src="../../../assets/gestiontarea.svg" alt="Gestionar tareas" width="40" height="40"></img>
        </button>
        <!--Icono para gestionar usuarios -->
        <button title="Gestionar usuarios" v-on:click="irA('/admin/gestion-usuarios')">
            <img src="../../../assets/gestionarusuario.svg" alt="Gestionar usuarios" width="40" height="40"></img>
        </button>
        <!--Icono para perfil -->
        <button title="Perfil" v-on:click="irA('/perfil')">
        <img src="../../../assets/perfil.svg" alt="Perfil" width="40" height="40"></img>
        </button>
        <!--Icono para fichar -->
        <button title="Fichar" v-on:click="irA('/fichaje')">
        <img src="../../../assets/fichar.svg" alt="Fichar" width="40" height="40"></img>
        </button>
        <!--Icono para cerrar sesion -->
        <button title="Cerrar sesión" v-on:click="cerrarSesion" class="btn-logout">
          <img src="../../../assets/logout.svg" alt="Cerrar sesión"  width="40" height="40"></img>
        </button>
    </nav>
    </div>
</header>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";

const router = useRouter();
const nombreUsuario = ref(localStorage.getItem("nombre"));

function irA(ruta) {
  router.push(ruta);
}

function cerrarSesion() {
  signOut(auth)
    .then(() => {
      localStorage.removeItem("userData");
      router.push("/login");
    })
    .catch((err) => {
      console.error("Error al cerrar sesión:", err);
    });
}
</script>

<style scoped>
@import "@/styles/Header.css";
</style>
