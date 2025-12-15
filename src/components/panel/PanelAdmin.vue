<template>
  <PanelBase>
    <RouterView />
    <template #sidebar>
      <ul>
        <li><button v-on:click="irA('/admin/informes')" class="button-panel">📊 Ver informes</button></li>
        <li><button v-on:click="irA('/admin/tareas')" class="button-panel">🗂️ Gestionar tareas</button></li>
        <li><button v-on:click="irA('/admin/gestion-usuarios')" class="button-panel">👥 Gestionar usuarios</button></li>
        <li><button v-on:click="irA('/fichaje')" class="button-panel">🕒 Fichar</button></li>
      </ul>
    </template>

    <h2>Panel del administrador</h2>
    <p>Desde aquí puedes acceder a la gestión de tareas, usuarios e informes.</p>


  </PanelBase>
    <Footer />
</template>

<script setup>
import PanelBase from "./PanelBase.vue";
import { useRouter } from "vue-router";

const router = useRouter();
function irA(ruta) {
  router.push(ruta);
}
</script>

<style scoped>
@import "../../styles/Panel.css";
</style>
