// configs/firebase/config.ts

import { Platform } from "react-native";

import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  // @ts-ignore
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";
import { getDatabase } from "firebase/database";

import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey:
    process.env.FIREBASE_API_KEY ||
    "AIzaSyALrGDEbr0nKD5vi7GgXb1h2xkKidodNnA",

  authDomain:
    process.env.FIREBASE_AUTH_DOMAIN ||
    "tgv-tahoua.firebaseapp.com",

  projectId:
    process.env.FIREBASE_PROJECT_ID ||
    "tgv-tahoua",

  storageBucket:
    process.env.FIREBASE_STORAGE_BUCKET ||
    "tgv-tahoua.firebasestorage.app",

  messagingSenderId:
    process.env.FIREBASE_MESSAGING_SENDER_ID ||
    "165912984724",

  appId:
    process.env.FIREBASE_APP_ID ||
    "1:165912984724:web:68d7ee8506a6cac7534881",

  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  databaseURL:
    process.env.FIREBASE_DATABASE_URL ||
    "https://tgv-tahoua-default-rtdb.europe-west1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);

/**
 * Firebase Auth
 */
export const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(
          ReactNativeAsyncStorage,
        ),
      });

/**
 * Cloud Firestore
 *
 * Utilise cette instance pour :
 * - collections
 * - documents
 * - queries Firestore
 */
export const db = getFirestore(app);
export const firestore = getFirestore(app);

/**
 * Firebase Realtime Database
 *
 * Utilise cette instance pour :
 * - ref()
 * - onValue()
 * - onChildAdded()
 * - onChildChanged()
 * - onChildRemoved()
 * - set()
 * - remove()
 * - update()
 */
export const database = getDatabase(app);

/**
 * Firebase Cloud Messaging
 *
 * Activé uniquement sur Web dans cette configuration.
 */
export const messaging =
  Platform.OS === "web"
    ? getMessaging(app)
    : null;

export { firebaseConfig };

export default app;

