import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc, updateDoc, where } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

export {
  app,
  db,
  auth,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
};
