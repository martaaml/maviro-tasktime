<template>
    <header class="header-empleado">

    <div class="header-left">
    <img class="logo" src="../../../assets/logo.png" alt="logo" width="50" height="50" v-on:click="irA('/panel-empleado')">
    </img>
    <h1 class="empresa">Maviro</h1>
    </div>
    <class class="header-right">
    <span class="bienvenida">Bienvenid@</span>

    <!--Navegador de admin-->
    <nav class="menu-iconos">
        <!--Icono para mis tareas -->
        <button tittle="Tareas" v-on:click="irA('/tarea-empleado')">
            <img src="../../../assets/tareas.svg" alt="Mis tareas" width="40" height="40"></img>
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
    </class>
</header>

</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
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
    .catch((err) => {
        console.error("Error al cerrar sesión:", err);
    });
}
</script>

<style scoped>
@import "@/styles/Header.css";
</style>
