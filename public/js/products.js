let productContainer = document.querySelector(".product-grid");

let smallInfo = document.querySelector(".small-info");
let paginationInfo = document.querySelector(".pagination-info");

let topCategoryProducts = [];
let currentPage = 1;
const limit = 12;

window.addEventListener('DOMContentLoaded', (e) => {
    const prams = new URLSearchParams(window.location.search);
    const categoryId = prams.get('categoryId');
    
    let url;

    if (categoryId) {
        url = `products/api/get-products?category=${categoryId}`;

        document.querySelectorAll(".category-link").forEach(link => {
            if (link.dataset.category_id === categoryId) {
                link.classList.add("active"); 
            } else { 
                link.classList.remove("active");
            }
        });
    }
    else {
        url = 'products/api/get-products?';
    }

    fetch(url)
    .then(res => res.json())
    .then(data =>{
        topCategoryProducts = data;
        renderProducts(topCategoryProducts);
    });
});


function showRenderProducts(products) {
    products.forEach(items => {
        if(!items.thumbnail){
            const discount = (items.price) - ((items.product_discount_persentage * items.price)/100);
            const card = `
            <div class="product-card">
                    <div class="discount-badge">${items.product_discount_persentage}%</div>
                    <a href="/product-view?categoryId=${items.category_id}&productId=${items.product_id}" category_id="${items.category_id}" product_id="${items.product_id}"><div class="product-image"><img src="${items.image_url}" alt="${items.title}"></div></a>
                    <div class="price">$${discount.toFixed(2)} <span><i class="fa-solid fa-circle-plus add-to-cart" style="color: #000000;"></i></span></div>
                    <div class="desc">${items.title}</div>
            </div>
        `;
        productContainer.innerHTML += card;
        }else{
            const discount = (items.price) - ((items.product_discount_persentage * items.price)/100);
            const card = `
            <div class="product-card">
                    <div class="discount-badge">${items.product_discount_persentage}%</div>
                    <a href="/product-view?categoryId=${items.category_id}&productId=${items.product_id}" category_id="${items.category_id}" product_id="${items.product_id}"><div class="product-image"><img src="${items.thumbnail}" alt="${items.title}"></div></a>
                    <div class="price"><span class="discount-price">$${discount.toFixed(2)}</span> <span><i class="fa-solid fa-circle-plus add-to-cart" style="color: #000000;"></i></span></div>
                    <div class="desc">${items.title}</div>
            </div>
        `;
        productContainer.innerHTML += card;
        }
        
    });
}

function renderProducts(categoryProducts) {    
    productContainer.innerHTML = '';

    const start = (currentPage - 1) * limit ;
    const end = start + limit;
    const products = categoryProducts.slice(start, end);

    showRenderProducts(products);

    let cart = document.querySelectorAll(".add-to-cart");
    cart.forEach(items => {
        items.addEventListener('click', (e)=>{
            
            addToCart(e.target);
        })
    })

    const startItem = start + 1;
    const endItem = Math.min(start + limit, categoryProducts.length);
    
    smallInfo.innerHTML = `Showing ${startItem}-${endItem} of ${categoryProducts.length} items`;
    paginationInfo.innerHTML = `Showing ${startItem}-${endItem} of ${categoryProducts.length} items`;

    document.getElementById('prev-btn').disabled = currentPage === 1;
    document.getElementById('next-btn').disabled = currentPage === Math.ceil(categoryProducts.length / limit);
}

document.querySelector("#next-btn").addEventListener('click', ()=>{
    if(currentPage < Math.ceil(topCategoryProducts.length / limit)){
        currentPage++;
        renderProducts(topCategoryProducts);
    }
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

document.querySelector("#prev-btn").addEventListener('click', ()=>{
    if(currentPage > 1){
        currentPage--;
        renderProducts(topCategoryProducts);
    }
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

async function addToCart(data){
    const card = data.closest('.product-card');
    const productData = card.querySelector('a');
    const productId = productData.getAttribute('product_id');

    try {
        const response = await fetch(`/cart/api/cart/add`,{
            method: 'POST',
            headers:{
                "content-type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify({ productId: productId})
        });
        const result = await response.json();
        if (result.status === "success") {
            showAddedToCartMessage(result.message);
          } else if (result.status === "unauthorized") {
            showWarning(result.message);
            //window.location.href = "/login";
          } else {
            showWarning(result.message);
          }
    } catch (error) {
        showWarning(result.message);
        
    }

    console.log(productId);
}

function showAddedToCartMessage(message) {
    let errorMessage = document.getElementById('warning-box');
    errorMessage.style.display = 'flex';
    document.getElementsByClassName('container')[0].style.filter = 'blur(2px)';
    errorMessage.style.opacity = '1';
    errorMessage.querySelector('.warning-message').textContent = "✅ " + message;

    setTimeout(() => {
        closeWarning();
    }, 2000);
}


function showWarning(message){
    let errorMessage = document.getElementById('warning-box');
    errorMessage.style.display = 'flex';
    document.getElementsByClassName('container')[0].style.filter = 'blur(2px)';
    errorMessage.style.opacity = '1';
    errorMessage.querySelector('.warning-message').textContent = "⚠️ " + message;
}

function closeWarning(){
    let errorMessage = document.getElementById('warning-box');
    errorMessage.style.display = 'none';
    document.getElementsByClassName('container')[0].style.filter = 'none';
}

document.addEventListener("DOMContentLoaded", () => {
    const searchBar = document.querySelector(".search-bar");
    const searchInput = searchBar.querySelector("input");
  
    // List of categories (DummyJSON)
    const categories = [
      "smartphones", "laptops", "fragrances", "skincare", "groceries",
      "home-decoration", "furniture", "tops", "womens-dresses",
      "womens-shoes", "mens-shirts", "mens-shoes", "mens-watches",
      "womens-watches", "womens-bags", "womens-jewellery",
      "sunglasses", "automotive", "motorcycle", "lighting"
    ];
  
    const dropdown = document.createElement("div");
    dropdown.classList.add("search-dropdown");
    searchBar.appendChild(dropdown);
  
    function showDropdown(items) {
      dropdown.innerHTML = ""; 
      items.forEach(cat => {
        const item = document.createElement("div");
        item.classList.add("search-dropdown-item");
        item.textContent = cat;
  
        item.addEventListener("click", () => {
          searchInput.value = cat;
          dropdown.style.display = "none";
        });
  
        dropdown.appendChild(item);
      });
      dropdown.style.display = items.length ? "block" : "none";
    }
  
    searchInput.addEventListener("focus", () => { 
      showDropdown(categories);
    });
  
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase();
      const filtered = categories.filter(cat => cat.toLowerCase().includes(query));
      showDropdown(filtered);
    });
  
    document.addEventListener("click", (e) => {
      if (!searchBar.contains(e.target)) {
        dropdown.style.display = "none";
      }
    });
  });
  