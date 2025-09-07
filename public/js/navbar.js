document.querySelector(".dropdown").addEventListener("click", function(e) {
    let element = document.querySelector(".dropdown-content");
    if (element.style.visibility === "hidden") {
        element.style.visibility = "visible";
    } else{
        element.style.visibility = "hidden";
    }

    document.addEventListener("click", function(event) {
        if (element.style.visibility === "visible"
            && !element.contains(event.target) && 
            !document.querySelector(".dropdown").contains(event.target)) {
            element.style.visibility = "hidden";          
        }
    });
}); 


document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.querySelector(".product-search input");
    const dropdown = document.getElementById("search-categoryDropdown");
  
    const categories = [
      "smartphones", "laptops", "fragrances", "skincare", "groceries",
      "home-decoration", "furniture", "tops", "womens-dresses", "womens-shoes",
      "mens-shirts", "mens-shoes", "mens-watches", "womens-watches","vehicle",
      "womens-bags", "womens-jewellery", "sunglasses","tablets",
      "motorcycle","kitchen-accessories", "beauty","mobile-accessories", "sports-accessories",
     ];
    
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
      dropdown.style.display = "block";
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
      if (!e.target.closest(".product-search")) {
        dropdown.style.display = "none";
      }
    });
  });
  