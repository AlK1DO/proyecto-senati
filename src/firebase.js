import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDSOudFqVpVMt7j0adc-VCD8GxFWlIerMI",
  authDomain: "sistema-de-facturacion-19da0.firebaseapp.com",
  projectId: "sistema-de-facturacion-19da0",
  storageBucket: "sistema-de-facturacion-19da0.firebasestorage.app",
  messagingSenderId: "826816256426",
  appId: "1:826816256426:web:d316913f2d6b8c382233d3",
  measurementId: "G-636ZSV9TM7"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
