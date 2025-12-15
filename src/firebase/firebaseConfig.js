// Importaciones de Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCp5W4o8zuVe5LM0Tqlman29WKyTPijXy4", 
  authDomain: "maviro-d974c.firebaseapp.com",
  projectId: "maviro-d974c",
  storageBucket: "maviro-d974c.appspot.com",
  messagingSenderId: "791000300670",
  appId: "1:791000300670:web:f8fe873985176a94c36c2f",
  measurementId: "G-PGP82VVT7Y"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Servicios que vas a usar
const auth = getAuth(app);
const db = getFirestore(app);

// Exporta los servicios
export { auth, db };
