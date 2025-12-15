<template>
  <article class="tarjeta" :class="`prio-${prioridadNormalizada}`">
    <div class="contenido">
      <div class="fila-superior">
        <h2 class="nombre">{{ tarea.nombreTarea }}</h2>
        <span class="prioridad">
          <b>{{ prioridadTexto }}</b>
        </span>
      </div>

      <p class="descripcion">{{ tarea.descripcion }}</p>

      <div class="fila-datos">
        <p><b>ESTADO:</b> {{ estadoTexto }}</p>
        <p><b>RESTANTES:</b> {{ tarea.horasRestantes ?? 0 }}h</p>
        <p><b>TIEMPO INCURRIDO:</b> {{ tarea.horasIncurridas ?? 0 }}h</p>
      </div>
    </div>

    <div class="acciones">
      <button
        class="btn icono cerrar"
        title="Cerrar tarea"
        @click="confirmarCerrar"
        :disabled="estadoTexto === 'cerrada'"
      >
        <img
          src="../../assets/cerrar.svg"
          alt="Cerrar tarea"
          width="24"
          height="24"
        />
      </button>

      <button class="btn icono sumar" title="Incurrir horas" @click="abrirModalHoras">
        ➕
      </button>
    </div>

    <transition name="pop">
      <div v-if="modalHoras" class="overlay" @click.self="cerrarModalHoras">
        <div class="modal">
          <h3>Incurrir horas</h3>
          <p class="mini">Se restarán de “restantes” y se sumarán a “incurridas”.</p>

          <div class="campo">
            <input
              v-model.number="horas"
              type="number"
              min="1"
              step="1"
              placeholder="Horas"
            />
          </div>

          <div class="modal-acciones">
            <button class="btn-sec" type="button" @click="cerrarModalHoras">
              Cancelar
            </button>
            <button class="btn-pri" type="button" @click="enviarHoras">
              Guardar
            </button>
          </div>
        </div>
      </div>
    </transition>
  </article>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  tarea: { type: Object, required: true },
});

const emit = defineEmits(["incurrir", "cerrar"]);

const modalHoras = ref(false);
const horas = ref(1);

const prioridadNormalizada = computed(() =>
  String(props.tarea.prioridad || "media").toLowerCase()
);

const prioridadTexto = computed(() => {
  const p = prioridadNormalizada.value;
  if (p === "alta") return "Alta";
  if (p === "baja") return "Baja";
  return "Media";
});

const estadoTexto = computed(() => {
  const e = String(props.tarea.estado || "activa").toLowerCase();
  if (e === "cerrada") return "cerrada";
  return "activa";
});

function abrirModalHoras() {
  modalHoras.value = true;
  horas.value = 1;
}

function cerrarModalHoras() {
  modalHoras.value = false;
}

function enviarHoras() {
  const h = Number(horas.value);
  if (!h || h <= 0) return;
  emit("incurrir", { tareaId: props.tarea.id, horas: h });
  cerrarModalHoras();
}

function confirmarCerrar() {
  if (estadoTexto.value === "cerrada") return;
  if (!confirm("¿Seguro que quieres cerrar esta tarea?")) return;
  emit("cerrar", props.tarea.id);
}
</script>
<style scoped>

.tarjeta {
  width: 95%;
  background: #fff;
  border-radius: 18px;
  padding: 20px 20px; /* Padding generoso */
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}


.tarjeta:hover {
  transform: translateY(-4px) scale(1.005);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.10);
}

/* borde luminoso (mantenido) */
.tarjeta.prio-alta {
  box-shadow:
    0 0 0 2px rgba(219, 208, 60, 0.87),
    0 0 24px rgba(157, 63, 121, 0.929),
    0 0 18px rgba(250, 204, 21, 0.10);
}
.tarjeta.prio-media {
  box-shadow:
    0 0 0 2px rgba(232, 193, 39, 0.845),
    0 0 24px rgba(208, 30, 190, 0.668),
    0 0 18px rgba(73, 128, 201, 0.832);
}
.tarjeta.prio-baja {
  box-shadow:
    0 0 0 2px rgba(79, 123, 192, 0.873),
    0 0 24px rgba(250, 204, 21, 0.10),
    0 0 18px rgba(244, 63, 94, 0.06);
}

.contenido {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.fila-superior {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 14px;
}

.nombre {
  margin: 0;
  font-size: 1.89rem;
  font-weight: 900;
  color: #0f2b46;
  letter-spacing: 0.2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prioridad {
  font-weight: 700;
  font-size: 1.8rem;
  color: #1b456c;
  opacity: 0.92;
  white-space: nowrap;
}

.descripcion {
  margin: 10px 0 12px;
  font-size: 1.3rem;
  color: #223548;
  opacity: 0.9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fila-datos {
  display: flex;
  gap: 26px;
  flex-wrap: wrap;
  font-size: 1.08rem;
  color: #223548;
}

.fila-datos b {
  color: #0f2b46;
}

/* botones derecha */
.acciones {
  display: flex;
  gap: 10px;
  margin-left: 20px;
  flex-shrink: 0;
}

.btn.icono {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  font-size: 1.2rem;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.btn.icono img {
    width: 30px;
    height: 30px;
}

.btn.icono:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.btn.icono:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Modal (Mantenido consistente) */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 16px;
}

.modal {
  width: 420px;
  max-width: 100%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 18px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal h3 {
  margin: 0 0 6px;
  color: #0f2b46;
}

.mini {
  margin: 0 0 12px;
  color: #223548;
  opacity: 0.85;
}

.campo input {
  width: 100%;
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.14);
  font-size: 1rem;
  outline: none;
}

.modal-acciones {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}

.btn-sec,
.btn-pri {
  border: none;
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
}

.btn-sec {
  background: rgba(148, 163, 184, 0.25);
  color: #0f2b46;
}

.btn-pri {
  background: rgba(59, 130, 246, 0.85);
  color: #fff;
}

.pop-enter-active,
.pop-leave-active {
  transition: all 0.18s ease;
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
</style>