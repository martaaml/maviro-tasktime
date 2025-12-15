import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { auth } from "@/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

let app;

onAuthStateChanged(auth, () => {
  // Solo montamos la app una vez que Firebase ya sabe si hay usuario o no
  if (!app) {
    app = createApp(App).use(router).mount("#app");
  }
});
