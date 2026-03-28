import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAPUoVsepM28Z-_HhBwsjJdWGNqaV0pJjg",
  authDomain: "scrambl-8c67d.firebaseapp.com",
  projectId: "scrambl-8c67d",
  storageBucket: "scrambl-8c67d.firebasestorage.app",
  messagingSenderId: "237042809885",
  appId: "1:237042809885:web:6e87d5444f05302fca9af4",
  measurementId: "G-060JNPH3K4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
