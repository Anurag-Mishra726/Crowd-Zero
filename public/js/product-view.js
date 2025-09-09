window.addEventListener('DOMContentLoaded', (e) => {
    const prams = new URLSearchParams(window.location.search);
    const categoryId = prams.get('categoryId');
    const productId = prams.get("productId");

    if (!categoryId || !productId) {
        document.body.innerHTML = "Something went wrong"
        return;
    }else{
        fetch(`/product-view/api/produtc-view?category=${categoryId}&product=${productId}`)
        .then(res=> res.json())
        .then(data => {
            renderProductView(data);
        });

        fetch(`/product-view/api/product/reviews?productId=${productId}`)
        .then(res=> res.json())
        .then(data => {
            renderReviews(data);
        })
    }
});


function renderProductView(product) {
    const imgSrc = document.querySelector(".main-image-wrapper > img");
    const otherImages = document.querySelector(".thumbnail-images");
    const productTitle = document.querySelectorAll(".product_title");
    const originalProductPrice = document.querySelectorAll(".original_price");
    const discountProductPrice = document.querySelectorAll(".discount_price");
    const cartBtn = document.querySelector(".add-to-cart-btn");
    const buyNow = document.querySelector(".buy-now-btn");
    const discountPercentage = document.querySelector(".discount_percentage");
    const productDescription = document.querySelector(".product-description");
    const productBrand = document.querySelectorAll(".product_brand");
    const productCategry = document.querySelectorAll(".product_category");
    const product_Description = document.querySelector(".product_description");
    const productAvailability = document.querySelector(".product_availability");
    const returnpolicy = document.querySelector(".return_policy");

    imgSrc.src = product[0].thumbnail;
    imgSrc.alt = product[0].title;

    cartBtn.dataset.product_id = product[0].product_id;
    buyNow.dataset.product_id = product[0].product_id;
    if (product.length > 1) {
        otherImages.innerHTML = '';
        product.forEach((element, index) => {
            if (element.image_url) {
                if (index == 0) {
                    const image = `<img src="${element.image_url}" alt="${element.title}" class="thumbnail-image active">`;
                    otherImages.innerHTML += image;
                }else{
                    const image = `<img src="${element.image_url}" alt="${element.title}" class="thumbnail-image">`;
                    otherImages.innerHTML += image;
                }
            }
        });
    }

    const thumbnailImage = document.querySelectorAll(".thumbnail-image");
    const mainImage = document.querySelector(".main-image");
    const zoomResult = document.getElementById("zoomResult");
    let currentSrc = mainImage.src;
    const zoomCategories = [
        "Fragrances",
        "Home Decoration",
        "Furniture",
        "Mens Shirts",
        "Laptops",
        "Mens Watches",
        "Mens Shoes",
        "Mobile Accessories",
        "Smartphones",
        "Sunglasses",
        "Tablets",
        "Tops",
        "Womens Bags",
        "Womens Dresses",
        "Womens Jewellery",
        "Womens Shoes",
        "Womens Watches"
      ];
      
    if(zoomCategories.includes(product[0].category_name)){
        enableZoom(mainImage, zoomResult);
    }

    thumbnailImage.forEach(thumb => {

        thumb.addEventListener('mouseover', () => {
            mainImage.src = thumb.src;
        });

        thumb.addEventListener('mouseout', ()=>{
            mainImage.src = currentSrc;
        })

        thumb.addEventListener('click', () => {
            mainImage.src = thumb.src;
            currentSrc = thumb.src;
            thumbnailImage.forEach(item => {
                if (mainImage.src === item.src) {
                    item.classList.add('active');
                }else{
                    item.classList.remove('active');
                }
            })
        });
    });

    productTitle.forEach(productTitle => { productTitle.innerHTML = product[0].title; });
    originalProductPrice.forEach(price => {price.innerHTML = "$" + product[0].price});
    discountPercentage.innerHTML = product[0].product_discount_persentage;
    const discount = (product[0].price) - ((product[0].product_discount_persentage * product[0].price)/100);
    discountProductPrice.forEach(discountPrice => {discountPrice.innerHTML = "$" + discount.toFixed(2)});
    product_Description.innerHTML = `<strong>Description: </strong> ${product[0].product_description}`;
    productBrand.forEach(brand => {
        brand.innerHTML = product[0].product_brand ? `<strong>Brand: </strong> ${product[0].product_brand}` : `<strong>Brand: </strong>Generic`;
    });
    productCategry.forEach(category => {
        category.innerHTML = `<strong>Category: </strong> ${product[0].category_name}`;
    });
    productDescription.innerHTML = `${product[0].product_description}`;
    productAvailability.innerHTML = product[0].availability_status;
    returnpolicy.innerHTML = product[0].return_policy;

}

const btnInc = document.querySelector(".btn-inc");
const btnDec = document.querySelector(".btn-dec");
const quantity = document.querySelector(".quantity-input");
let quantityValue = 1;

btnDec.addEventListener("click", ()=>{
    if(quantity.value > 1){
        quantityValue--;
        quantity.value = quantityValue;
    }
});

btnInc.addEventListener("click", ()=>{
    if (quantityValue >= 5) {
        return;
    }
    quantityValue++;
    quantity.value = quantityValue;
});

function enableZoom(mainImage, zoomResult){
    mainImage.addEventListener('mousemove', (e)=>{
        zoomResult.style.display = "block";
        const rect = mainImage.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;

        zoomResult.style.backgroundImage = `url(${mainImage.src})`;
        zoomResult.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
    });

    mainImage.addEventListener("mouseleave", () => {
        zoomResult.style.display = "none";
    });
}

function renderReviews(reviews){
    const reviewCardContainer = document.querySelector('.review-card-container');
    reviewCardContainer.innerHTML = ''

    const reviewCount = document.querySelector(".review-count");
    reviewCount.innerHTML = "";
    reviewCount.innerHTML = `(${reviews.length} review)`;

    const starRating = document.querySelector(".star-rating");
    starRating.innerHTML = '';
    let avgRating = 0;


    reviews.forEach(review =>{

        avgRating += review.rating;

        let reviewerName = (review.reviewer_name).split(' ');
        let avatar = reviewerName[0][0];
        let isoDate = review.review_date;
        let date = new Date(isoDate).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          });

        let rating = '' ;
        for (let i = 0; i < review.rating; i++) {
            rating += '<span>&#9733;</span>'
        }

        const reviewCard = `
            <div class="review-card">
                <div class="reviewer-header">
                    <div class="reviewer-avatar">${avatar}</div>
                    <div class="reviewer-info">
                        <div class="reviewer-name">${review.reviewer_name}</div>
                        <div class="review-stars">
                            ${rating}
                        </div>
                    </div>
                </div>
                <p class="review-text">${review.comment}</p>
                <div class="review-actions">
                    <span class="outer-span"><span class="review-action-link">Like</span> <span class="review-action-link">Reply</span></span> <span class="review-time">${date}</span>
                </div>
            </div>
        `
        reviewCardContainer.innerHTML += reviewCard;
    });


    let rating = Math.ceil((avgRating/(reviews.length)));
    for (let i = 0; i < rating; i++) {
        starRating.innerHTML += '<span>&#9733;</span>'
    }
    if (rating < 5) {
        for(let i = 0; i < (5-rating); i++){
            starRating.innerHTML += '<span>&#9734;'
        }
    }
}

let addToCartBtn = document.querySelector(".add-to-cart-btn");
addToCartBtn.addEventListener('click',async (e) => {
    await addToCartApi(e, 'cart');
});
let buyNow = document.querySelector(".buy-now-btn");
buyNow.addEventListener("click", async (e) =>{
    await addToCartApi(e, 'buynow');
    window.location.href = "/billing?from=buyNow";;
})

async function addToCartApi(e, action) {
    const productId = e.target.dataset.product_id;
    const quantityValue = document.querySelector(".quantity-input").value;
    try {
        const response = await fetch(`/cart/api/cart/add`,{
            method: 'POST',
            headers:{
                "content-type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify({ productId: productId, quantity: quantityValue, action: action })
        });

        const responseInJson = await response.json();
        if (responseInJson.status === "success") {
            showAddedToCartMessage(responseInJson.message);
          } else if (responseInJson.status === "unauthorized") {
            showWarning(responseInJson.message);
          } else {
            showWarning(responseInJson.message);
          }
    } catch (error) {
        showWarning("Server error. Please try again later.");
    }
}

function showAddedToCartMessage(message) {
    let errorMessage = document.getElementById('warning-box');
    errorMessage.style.display = 'flex';
    document.getElementsByClassName('product-container')[0].style.filter = 'blur(2px)';
    errorMessage.style.opacity = '1';
    errorMessage.querySelector('.warning-message').textContent = "✅ " + message;

    setTimeout(() => {
        closeWarning();
    }, 1500);
}

function showWarning(message){

    let errorMessage = document.getElementById('warning-box');
    errorMessage.style.display = 'flex';
    document.getElementsByClassName('product-container')[0].style.filter = 'blur(2px)';
    errorMessage.style.opacity = '1';
    errorMessage.querySelector('.warning-message').textContent = "⚠️ " + message;   

}

function closeWarning(){
    let errorMessage = document.getElementById('warning-box');
    errorMessage.style.display = 'none';
    document.getElementsByClassName('product-container')[0].style.filter = 'none';
}

const formStar = document.querySelector(".form-stars");
formStar.addEventListener('click', (e)=>{
    const clickedElement = e.target;
    if(clickedElement.classList.contains('review-stars')){
        document.querySelectorAll('.review-stars').forEach(i => {
            i.classList.remove('fa-solid');
            i.classList.add('fa-regular')
        });
        let currentElement = clickedElement.parentElement;

        while(currentElement){
            
            const starIcon = currentElement.querySelector('.review-stars');
                if (starIcon) {
                    starIcon.classList.remove('fa-regular');
                    starIcon.classList.add('fa-solid');
                }
            currentElement = currentElement.previousElementSibling;
        }
    }
}); 
window.addEventListener('DOMContentLoaded', ()=>{

const reviewForm = document.querySelector('#review-form');
const postReviewBtn = document.querySelector('.post-review-btn');

function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get("productId")); 
}
postReviewBtn.addEventListener('click', async (e) => {
    e.preventDefault(); 

    const name =  document.querySelector('.form-input').value;
    const email =  document.querySelector('input[name="email"]').value;
    const message =  document.querySelector('.form-textarea').value;

    const activeStars = document.querySelectorAll('.review-stars.fa-solid');
    const rating = activeStars.length > 0 ? activeStars.length : 1; 

    const productId = getProductIdFromUrl();

    if (!name || !email || !message || rating === 0) {
        showWarning('Please fill out all fields and select a rating.');
        return;
    }

    const reviewData = {
        product_id: productId,
        reviewer_name: name,
        reviewer_email: email,
        comment: message,
        rating: rating,
        review_date : new Date().toISOString()
    };

    try {
        const response = await fetch('/product-view/submit-review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reviewData),
        });

        const result = await response.json();

        if (response.ok) {
            showAddedToCartMessage(result.message);
            setTimeout(() => {  window.location.reload() }, 1000)
           
        } else {
            showWarning(result.message);
        }
    } catch (error) {
        console.error('Fetch error:', error);
        showWarning('An error occurred. Please try again later.');
    }
});
});