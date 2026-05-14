// =========================================
// IMPORT FIREBASE
// =========================================

import { auth }
from "../js/firebase.js";

import {
signInWithEmailAndPassword,
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// =========================================
// ELEMENTS
// =========================================

const loginForm =
document.getElementById("loginForm");

const email =
document.getElementById("email");

const password =
document.getElementById("password");

const loginBtn =
document.getElementById("loginBtn");

const message =
document.getElementById("message");


// =========================================
// CHECK EXISTING SESSION
// =========================================

onAuthStateChanged(auth,(user)=>{

if(user){

window.location.href =
"dashboard.html";

}

});


// =========================================
// LOGIN FUNCTION
// =========================================

loginForm.addEventListener("submit", async(e)=>{

e.preventDefault();


// =========================================
// GET VALUES
// =========================================

const emailValue =
email.value.trim();

const passwordValue =
password.value.trim();


// =========================================
// VALIDATION
// =========================================

if(!emailValue || !passwordValue){

message.innerHTML =
"<span class='error'>Please fill all fields</span>";

return;

}


// =========================================
// LOADING STATE
// =========================================

loginBtn.innerHTML =
"LOGGING IN...";

loginBtn.disabled = true;

message.innerHTML = "";


// =========================================
// FIREBASE LOGIN
// =========================================

try{

await signInWithEmailAndPassword(
auth,
emailValue,
passwordValue
);


// SUCCESS MESSAGE

message.innerHTML =
"<span class='success'>Login successful...</span>";


// REDIRECT

setTimeout(()=>{

window.location.href =
"dashboard.html";

},1000);


}catch(error){

console.log(error);


// =========================================
// ERROR HANDLING
// =========================================

let errorMessage =
"Invalid admin credentials";


if(error.code === "auth/invalid-email"){

errorMessage =
"Invalid email address";

}

if(error.code === "auth/too-many-requests"){

errorMessage =
"Too many failed attempts. Try again later.";

}

if(error.code === "auth/network-request-failed"){

errorMessage =
"Network error. Check your internet.";

}


message.innerHTML =
`<span class="error">${errorMessage}</span>`;


// RESET BUTTON

loginBtn.innerHTML =
"LOGIN TO DASHBOARD";

loginBtn.disabled = false;

}

});