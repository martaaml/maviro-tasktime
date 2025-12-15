<template>
  <div class="lista-tareas">
    <transition-group name="salida" tag="div" class="lista">
      <TarjetaTarea
        v-for="t in tareas"
        :key="t.id"
        :tarea="t"
        @incurrir="(payload) => emit('incurrir', payload)"
        @cerrar="(id) => emit('cerrar', id)"
      />
    </transition-group>
  </div>
</template>

<script setup>
import TarjetaTarea from "@/components/tareas/TarjetaTarea.vue";

const props = defineProps({
  tareas: { type: Array, default: () => [] },
});

const emit = defineEmits(["incurrir", "cerrar"]);
</script>

<style scoped>
.lista-tareas {
  width: 100%;
  padding: 0 18px 26px;
}

.lista {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* animación “borrar/cerrar” */
.salida-enter-active,
.salida-leave-active {
  transition: all 0.25s ease;
}
.salida-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.salida-leave-to {
  opacity: 0;
  transform: translateX(18px);
  filter: blur(2px);
}
</style>
