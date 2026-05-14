// ========================================
// FIREBASE IMPORTS
// ========================================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getAuth }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ========================================
// FIREBASE CONFIG
// ========================================

const firebaseConfig = {

  apiKey: "AIzaSyCc5laFC90yEyFzILiySJR5sOu2kiv2TOk",

  authDomain: "resident-news.firebaseapp.com",

  projectId: "resident-news",

  storageBucket: "resident-news.firebasestorage.app",

  messagingSenderId: "1001105473483",

  appId: "1:1001105473483:web:cf35521a04e7457d2e804e",

  measurementId: "G-RF4KZWHWCP"

};


// ========================================
// INITIALIZE FIREBASE
// ========================================

const app = initializeApp(firebaseConfig);


// ========================================
// SERVICES
// ========================================

const auth = getAuth(app);

const db = getFirestore(app);


// ========================================
// EXPORT
// ========================================

export { auth, db };