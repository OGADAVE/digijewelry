// =========================================
// IMPORTS
// =========================================

import { auth, db }
from "../js/firebase.js";

import {
collection,
addDoc,
getDocs,
deleteDoc,
doc,
updateDoc,
serverTimestamp,
query,
orderBy,
onSnapshot
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
signOut,
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// =========================================
// AUTH PROTECTION
// =========================================

onAuthStateChanged(auth,(user)=>{

if(!user){

window.location.href =
"admin-login.html";

}

});


// =========================================
// CLOUDINARY CONFIG
// =========================================

const CLOUD_NAME =
"dnjwoniyl";

const UPLOAD_PRESET =
"digijewelry";


// =========================================
// ELEMENTS
// =========================================

const productForm =
document.getElementById("productForm");

const productsContainer =
document.getElementById("productsContainer");

const logoutBtn =
document.getElementById("logoutBtn");

const submitBtn =
document.getElementById("submitBtn");

const formMessage =
document.getElementById("formMessage");

const previewContainer =
document.getElementById("previewContainer");

const imageInput =
document.getElementById("images");

const searchInput =
document.getElementById("searchInput");

const brandFilter =
document.getElementById("brandFilter");

const editModal =
document.getElementById("editModal");

const closeModal =
document.getElementById("closeModal");

const editForm =
document.getElementById("editForm");

const updateBtn =
document.getElementById("updateBtn");


// =========================================
// ANALYTICS ELEMENTS
// =========================================

const totalProductsEl =
document.getElementById("totalProducts");

const featuredProductsEl =
document.getElementById("featuredProducts");

const inStockProductsEl =
document.getElementById("inStockProducts");

const totalOrdersEl =
document.getElementById("totalOrders");


// =========================================
// PAGINATION
// =========================================

let currentPage = 1;

const productsPerPage = 8;


// =========================================
// DATA STORAGE
// =========================================

let allProducts = [];

let filteredProducts = [];


// =========================================
// IMAGE PREVIEW
// =========================================

imageInput.addEventListener("change", ()=>{

previewContainer.innerHTML = "";

const files = imageInput.files;

for(let file of files){

const reader = new FileReader();

reader.onload = (e)=>{

previewContainer.innerHTML += `

<img
src="${e.target.result}"
class="preview-image">

`;

};

reader.readAsDataURL(file);

}

});


// =========================================
// LOGOUT
// =========================================

logoutBtn.addEventListener("click", async()=>{

const confirmLogout =
confirm("Logout admin?");

if(!confirmLogout) return;

await signOut(auth);

window.location.href =
"admin-login.html";

});


// =========================================
// CLOUDINARY UPLOAD
// =========================================

async function uploadImage(file){

const formData = new FormData();

formData.append("file", file);

formData.append(
"upload_preset",
UPLOAD_PRESET
);

try{

const response = await fetch(

`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,

{
method:"POST",
body:formData
}

);

const data = await response.json();

return data.secure_url;

}catch(error){

console.log(error);

throw new Error(
"Image upload failed"
);

}

}


// =========================================
// ADD PRODUCT
// =========================================

productForm.addEventListener(
"submit",
async(e)=>{

e.preventDefault();


// =========================================
// GET VALUES
// =========================================

const name =
document.getElementById("name")
.value.trim();

const brand =
document.getElementById("brand")
.value.trim();

const price =
document.getElementById("price")
.value.trim();

const category =
document.getElementById("category")
.value.trim();

const description =
document.getElementById("description")
.value.trim();

const featured =
document.getElementById("featured")
.checked;

const inStock =
document.getElementById("inStock")
.checked;

const imageFiles =
imageInput.files;


// =========================================
// VALIDATION
// =========================================

if(
!name ||
!brand ||
!price ||
!category ||
!description
){

formMessage.innerHTML =
"<span class='error'>Please fill all fields</span>";

return;

}

if(imageFiles.length === 0){

formMessage.innerHTML =
"<span class='error'>Please select images</span>";

return;

}


// =========================================
// LOADING
// =========================================

submitBtn.innerHTML =
"UPLOADING PRODUCT...";

submitBtn.disabled = true;

formMessage.innerHTML = "";


// =========================================
// UPLOAD IMAGES
// =========================================

try{

let imageUrls = [];

for(let file of imageFiles){

const imageUrl =
await uploadImage(file);

imageUrls.push(imageUrl);

}


// =========================================
// SAVE PRODUCT
// =========================================

await addDoc(
collection(db,"products"),
{

name,
brand,
price:Number(price),
category,
description,

featured,
inStock,

images:imageUrls,

createdAt:serverTimestamp()

}

);


// =========================================
// SUCCESS
// =========================================

formMessage.innerHTML =
"<span class='success'>Product added successfully</span>";

productForm.reset();

previewContainer.innerHTML = "";

submitBtn.innerHTML =
"ADD PRODUCT";

submitBtn.disabled = false;

}catch(error){

console.log(error);

formMessage.innerHTML =
`<span class='error'>${error.message}</span>`;

submitBtn.innerHTML =
"ADD PRODUCT";

submitBtn.disabled = false;

}

});


// =========================================
// REALTIME PRODUCTS
// =========================================

function realtimeProducts(){

const q = query(
collection(db,"products"),
orderBy("createdAt","desc")
);

onSnapshot(q,(snapshot)=>{

allProducts = [];

snapshot.forEach((docSnap)=>{

allProducts.push({

id:docSnap.id,

...docSnap.data()

});

});

filteredProducts = [...allProducts];

updateAnalytics();

populateBrandFilter();

renderProducts();

});

}

realtimeProducts();


// =========================================
// ANALYTICS
// =========================================

function updateAnalytics(){

totalProductsEl.innerHTML =
allProducts.length;

featuredProductsEl.innerHTML =
allProducts.filter(
p => p.featured
).length;

inStockProductsEl.innerHTML =
allProducts.filter(
p => p.inStock
).length;

}


// =========================================
// BRAND FILTER
// =========================================

function populateBrandFilter(){

const brands =
[
...new Set(
allProducts.map(p => p.brand)
)
];

brandFilter.innerHTML = `
<option value="all">
All Brands
</option>
`;

brands.forEach((brand)=>{

brandFilter.innerHTML += `

<option value="${brand}">
${brand}
</option>

`;

});

}


// =========================================
// RENDER PRODUCTS
// =========================================

function renderProducts(){

productsContainer.innerHTML = "";

const start =
(currentPage - 1) * productsPerPage;

const end =
start + productsPerPage;

const paginatedProducts =
filteredProducts.slice(start,end);


if(paginatedProducts.length === 0){

productsContainer.innerHTML =
"<p>No products found.</p>";

return;

}


paginatedProducts.forEach((product)=>{

productsContainer.innerHTML += `

<div class="admin-product-card">

<img src="${product.images[0]}">

<div class="admin-product-content">

<div class="product-badges">

${product.featured ? `
<span class="badge featured-badge">
FEATURED
</span>
` : ""}

${product.inStock ? `
<span class="badge stock-badge">
IN STOCK
</span>
` : `
<span class="badge out-stock">
OUT OF STOCK
</span>
`}

</div>

<h3>
${product.name}
</h3>

<p>
${product.description.substring(0,90)}...
</p>

<div class="admin-price">

₦${Number(product.price)
.toLocaleString()}

</div>

<div class="product-actions">

<button
class="edit-btn"
data-id="${product.id}">

EDIT

</button>

<button
class="delete-btn"
data-id="${product.id}">

DELETE

</button>

</div>

</div>

</div>

`;

});


// =========================================
// EDIT EVENTS
// =========================================

document.querySelectorAll(".edit-btn")
.forEach((button)=>{

button.addEventListener("click", ()=>{

openEditModal(
button.dataset.id
);

});

});


// =========================================
// DELETE EVENTS
// =========================================

document.querySelectorAll(".delete-btn")
.forEach((button)=>{

button.addEventListener("click", ()=>{

deleteProduct(
button.dataset.id
);

});

});

}


// =========================================
// SEARCH
// =========================================

searchInput.addEventListener("input", ()=>{

const value =
searchInput.value.toLowerCase();

filteredProducts =
allProducts.filter((product)=>{

return(

product.name.toLowerCase()
.includes(value)

||

product.brand.toLowerCase()
.includes(value)

);

});

currentPage = 1;

renderProducts();

});


// =========================================
// FILTER
// =========================================

brandFilter.addEventListener("change", ()=>{

const brand =
brandFilter.value;

if(brand === "all"){

filteredProducts = [...allProducts];

}else{

filteredProducts =
allProducts.filter(

p => p.brand === brand

);

}

currentPage = 1;

renderProducts();

});


// =========================================
// PAGINATION
// =========================================

document.getElementById("nextPage")
.addEventListener("click", ()=>{

const totalPages =
Math.ceil(
filteredProducts.length /
productsPerPage
);

if(currentPage < totalPages){

currentPage++;

renderProducts();

updatePagination();

}

});


document.getElementById("prevPage")
.addEventListener("click", ()=>{

if(currentPage > 1){

currentPage--;

renderProducts();

updatePagination();

}

});


function updatePagination(){

document.getElementById(
"pageIndicator"
).innerHTML =

`Page ${currentPage}`;

}

updatePagination();


// =========================================
// DELETE PRODUCT
// =========================================

async function deleteProduct(id){

const confirmDelete =
confirm("Delete this product?");

if(!confirmDelete) return;

try{

await deleteDoc(
doc(db,"products",id)
);

}catch(error){

console.log(error);

alert(error.message);

}

}


// =========================================
// OPEN EDIT MODAL
// =========================================

function openEditModal(id){

const product =
allProducts.find(
p => p.id === id
);

if(!product) return;

editModal.classList.add("active");

document.getElementById("editId")
.value = id;

document.getElementById("editName")
.value = product.name;

document.getElementById("editBrand")
.value = product.brand;

document.getElementById("editPrice")
.value = product.price;

document.getElementById("editCategory")
.value = product.category;

document.getElementById("editDescription")
.value = product.description;

document.getElementById("editFeatured")
.checked = product.featured;

document.getElementById("editStock")
.checked = product.inStock;

}


// =========================================
// CLOSE MODAL
// =========================================

closeModal.addEventListener("click", ()=>{

editModal.classList.remove("active");

});


// =========================================
// UPDATE PRODUCT
// =========================================

editForm.addEventListener(
"submit",
async(e)=>{

e.preventDefault();

const id =
document.getElementById("editId")
.value;

const name =
document.getElementById("editName")
.value.trim();

const brand =
document.getElementById("editBrand")
.value.trim();

const price =
document.getElementById("editPrice")
.value.trim();

const category =
document.getElementById("editCategory")
.value.trim();

const description =
document.getElementById("editDescription")
.value.trim();

const featured =
document.getElementById("editFeatured")
.checked;

const inStock =
document.getElementById("editStock")
.checked;

const editImages =
document.getElementById("editImages")
.files;


updateBtn.innerHTML =
"UPDATING...";

updateBtn.disabled = true;

try{

const existingProduct =
allProducts.find(
p => p.id === id
);

let updatedImages =
existingProduct.images;


// =========================================
// REPLACE IMAGES
// =========================================

if(editImages.length > 0){

updatedImages = [];

for(let file of editImages){

const imageUrl =
await uploadImage(file);

updatedImages.push(imageUrl);

}

}


// =========================================
// UPDATE FIRESTORE
// =========================================

await updateDoc(
doc(db,"products",id),
{

name,
brand,
price:Number(price),
category,
description,

featured,
inStock,

images:updatedImages

}

);


editModal.classList.remove("active");

updateBtn.innerHTML =
"UPDATE PRODUCT";

updateBtn.disabled = false;

}catch(error){

console.log(error);

alert(error.message);

updateBtn.innerHTML =
"UPDATE PRODUCT";

updateBtn.disabled = false;

}

});


// =========================================
// MOCK ORDERS SYSTEM
// =========================================

const ordersContainer =
document.getElementById("ordersContainer");

function loadOrders(){

ordersContainer.innerHTML = `

<tr>

<td>John Doe</td>

<td>Rolex Gold Edition</td>

<td>₦320,000</td>

<td>

<span class="status pending">
Pending
</span>

</td>

<td>

<a
href="https://wa.me/234000000000"
target="_blank">

Contact

</a>

</td>

</tr>

<tr>

<td>David Smith</td>

<td>Patek Philippe</td>

<td>₦450,000</td>

<td>

<span class="status delivered">
Delivered
</span>

</td>

<td>

<a
href="https://wa.me/234000000000"
target="_blank">

Contact

</a>

</td>

</tr>

`;

totalOrdersEl.innerHTML = 2;

}

loadOrders();