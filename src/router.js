import { createRouter, createWebHistory } from "vue-router";
import LoginForm from "@/components/auth/LoginForm.vue";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm.vue";
import PanelAdmin from "@/components/panel/PanelAdmin.vue";
import PanelEmpleado from "@/components/panel/PanelEmpleado.vue";
import GestionUsuarios from "@/components/admin/usuarios/GestionUsuarios.vue";
import Fichar from "@/components/fichaje/fichar.vue";
import GestionTarea from "@/components/admin/tareas/GestionTarea.vue";
import Perfil from "@/components/perfil/Perfil.vue";
import TareasEmpleado from "@/components/tareas/TareasEmpleado.vue";
import Informes from "./components/admin/informes/Informes.vue";
import { auth, db } from "@/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: LoginForm },
  { path: "/cambiar-password",component: ChangePasswordForm, meta: { requiereAuth: true }, },
  { path: "/panel-admin", component: PanelAdmin, meta: { requiereAuth: true, rol: "admin" },},
  { path: "/panel-empleado", component: PanelEmpleado, meta: { requiereAuth: true, rol: "empleado" },},
  { path: "/fichaje", component: Fichar, meta: { requiereAuth: true } },
  { path: "/admin/tareas",component: GestionTarea, meta: { requiereAuth: true, rol: "admin" },},
  { path: "/admin/gestion-usuarios", component: GestionUsuarios, meta: { requiereAuth: true, rol: "admin" },},
  { path: "/perfil", component: Perfil, meta: { requiereAuth: true } },
  { path: "/tarea-empleado", component: TareasEmpleado, meta: { requiereAuth: true, rol: "empleado" },},
  { path: "/admin/informes", component: Informes, meta: { requiereAuth: true, rol: "admin" },},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (!to.meta.requiereAuth) {
    next();
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    next("/login");
    return;
  }

  try {
    const userRef = doc(db, "usuarios", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      next("/login");
      return;
    }

    const data = snap.data();
    const esAdmin = data.rol === "admin";

    if (data.contraseñaTemporal && to.path !== "/cambiar-password" && !from.path.includes("/admin/gestion-usuarios")) {
      next("/cambiar-password");
      return;
    }

    if (to.meta.rol) {
      if (to.meta.rol === "admin" && !esAdmin) {
        next("/panel-empleado");
      } else if (to.meta.rol === "empleado" && esAdmin) {
        next("/panel-admin");
      } else {
        next();
      }
    } else {
      next();
    }
  } catch (err) {
    console.error("Error al verificar rol:", err);
    next("/login");
  }
});
 export default router;