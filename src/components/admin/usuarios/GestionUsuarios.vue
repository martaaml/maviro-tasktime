<template>
  <div class="gestion-usuarios">
    <HeaderAdmin />
    <h1 class="titulo">Gestión de Usuarios</h1>

    <div v-if="mensaje" :class="['mensaje', tipoMensaje]">{{ mensaje }}</div>

    <!-- Botón crear usuario -->
    <div class="form-crear">
      <button class="btn-crear" @click="abrirFormularioNuevo">
        Añadir nuevo empleado
      </button>
    </div>

    <!-- Usuarios -->
    <div class="grid-usuarios">
      <div
        v-for="user in usuarios"
        :key="user.id"
        class="tarjeta-usuario"
      >
        <div class="foto-container">
          <img
            class="foto-usuario"
            :src="user.foto || defaultAvatar"
            alt="Foto de usuario"
          />
        </div>

        <div class="tarjeta-contenido">
          <h3>{{ user.nombre }} {{ user.apellido }}</h3>
          <p class="puesto">{{ user.puesto || '—' }}</p>
          <div class="info-oculta">
            <p><strong>Correo:</strong> {{ user.email }}</p>
            <p><strong>Departamento:</strong> {{ user.departamento || 'Sin asignar' }}</p>
          </div>
        </div>

        <div class="acciones">
          <button
            @click="rellenarEdicion(user)"
            class="btn-icono btn-editar"
            title="Editar"
          >
            <img src="../../../assets/editar.svg" alt="Editar" width="30" height="30"></img>
          </button>
          <button
            @click="eliminarUsuario(user.id)"
            class="btn-icono btn-eliminar"
            title="Eliminar"
          >
            <img src="../../../assets/eliminar.svg" alt="Eliminar" width="30" height="30"></img>
          </button>
        </div>
      </div>
    </div>

    <!-- Formulario con efecto glass -->
    <transition name="fade-zoom">
      <div v-if="mostrarFormulario" class="overlay-form">
        <div class="form-glass">
          <h3>{{ editando ? "Editar usuario" : "Crear nuevo usuario" }}</h3>
          <form class="form-crear-glass" @submit.prevent="guardarUsuario">
            <label>
              <input v-model="nombre" type="text" required placeholder="Nombre"/>
            </label>
            <label>
              <input v-model="apellido" type="text" required  placeholder="Apellido"/>
            </label>
            <label>
              <input v-model="email" type="email" required placeholder="Correo"/>
            </label>
            <label>
              <input v-model="password" type="password" :disabled="editando" placeholder="Contraseña Temporal" required />
            </label>
            <label>
              <input v-model="departamento" type="text" placeholder="Departamento" />
            </label>
            <label>
              <input v-model="puesto" type="text" placeholder="Puesto" />
            </label>
            <label>
              <select v-model="rol" placeholder="Rol">
                <option value="empleado">Empleado</option>
                <option value="admin">Administrador</option>
              </select>
            </label>
            <label>
              <select v-model="estado" placeholder="Estado">
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </label>

            <div class="acciones-form" placeholder="Estado">
              <button type="button" class="btn-cancelar" @click="cerrarFormulario">
                Cancelar
              </button>
              <button type="submit" class="btn-guardar">
                {{ editando ? "Guardar cambios" : "Crear usuario" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db, auth } from "@/firebase/firebaseConfig";
import { collection, getDocs, setDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import HeaderAdmin from "@/components/layout/header/HeaderAdmin.vue";
import defaultAvatar from "@/assets/default-avatar.png";
import { signOut } from "firebase/auth";


// Variables
const nombre = ref("");
const apellido = ref("");
const email = ref("");
const password = ref("");
const rol = ref("empleado");
const estado = ref("activo");
const departamento = ref("");
const puesto = ref("");
const usuarios = ref([]);
const mensaje = ref("");
const tipoMensaje = ref("");
const mostrarFormulario = ref(false);
const editando = ref(false);
const usuarioEditandoId = ref(null);

// Mostrar mensaje
function mostrarMensaje(texto, tipo) {
  mensaje.value = texto;
  tipoMensaje.value = tipo;
  setTimeout(() => {
    mensaje.value = "";
    tipoMensaje.value = "";
  }, 3000);
}

// Cargar usuarios
function cargarUsuarios() {
  getDocs(collection(db, "usuarios"))
    .then((snap) => {
      usuarios.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    })
    .catch(() => mostrarMensaje("Error al cargar usuarios", "error"));
}

// Crear o editar usuario
function guardarUsuario() {
  const data = {
    nombre: nombre.value,
    apellido: apellido.value,
    email: email.value,
    rol: rol.value,
    estado: estado.value,
    contraseñaTemporal: true,
    departamento: departamento.value,
    puesto: puesto.value,
    fechaRegistro: new Date().toISOString(),
  };

  // Si estamos editando
  if (editando.value && usuarioEditandoId.value) {
    updateDoc(doc(db, "usuarios", usuarioEditandoId.value), data)
      .then(() => {
        mostrarMensaje("Usuario actualizado correctamente", "exito");
        cerrarFormulario();
        cargarUsuarios();
      })
      .catch(() => mostrarMensaje("Error al actualizar usuario", "error"));
  } else {
    // Crear nuevo usuario en Firebase Auth + Firestore
    createUserWithEmailAndPassword(auth, email.value, password.value)
      .then((cred) => {
        const uid = cred.user.uid;
        return setDoc(doc(db, "usuarios", uid), data);
      })
      .then(() => {
        
        mostrarMensaje("Usuario creado correctamente", "exito");
        cerrarFormulario();
        cargarUsuarios();
      })
      .catch((err) => {
        console.error(err);
        mostrarMensaje("Error al crear usuario", "error");
      });
  }
}

// Editar
function rellenarEdicion(user) {
  mostrarFormulario.value = true;
  editando.value = true;
  usuarioEditandoId.value = user.id;
  nombre.value = user.nombre;
  apellido.value = user.apellido;
  email.value = user.email;
  rol.value = user.rol;
  estado.value = user.estado;
  departamento.value = user.departamento || "";
  puesto.value = user.puesto || "";
  password.value = "";
}

// Eliminar
function eliminarUsuario(uid) {
  if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;
  deleteDoc(doc(db, "usuarios", uid))
    .then(() => {
      usuarios.value = usuarios.value.filter((u) => u.id !== uid);
      mostrarMensaje("Usuario eliminado correctamente", "exito");
    })
    .catch(() => mostrarMensaje("Error al eliminar usuario", "error"));
}

// Control de formulario
function abrirFormularioNuevo() {
  limpiarFormulario();
  mostrarFormulario.value = true;
}
function cerrarFormulario() {
  mostrarFormulario.value = false;
  limpiarFormulario();
}
function limpiarFormulario() {
  nombre.value = "";
  apellido.value = "";
  email.value = "";
  password.value = "";
  rol.value = "empleado";
  estado.value = "activo";
  departamento.value = "";
  puesto.value = "";
  editando.value = false;
  usuarioEditandoId.value = null;
}

onMounted(cargarUsuarios);
</script>

<style scoped>
@import "@/styles/gestionUsuarios.css";
</style>