
const sliderWrapper = document.getElementById('sliderWrapper');
const images = sliderWrapper.children;
let currentIndex = 0;

const firstClone = images[0].cloneNode(true);
sliderWrapper.appendChild(firstClone);

const totalSlides = sliderWrapper.children.length;
function slideImage() {
  currentIndex++;
  sliderWrapper.style.transition = 'transform 0.5s ease-in-out';
  sliderWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;

  if (currentIndex === totalSlides - 1) {
    setTimeout(() => {
      sliderWrapper.style.transition = 'none';
      sliderWrapper.style.transform = `translateX(0%)`;
      currentIndex = 0;
    }, 500);
  }
}

setInterval(slideImage, 5000);






/* async function productData() {
    let data = await fetch("https://dummyjson.com/products/category/fragrances");
    let dataInJson = await data.json();
  
    // Get only the "name" values
    console.log(dataInJson);

    dataInJson.products.forEach(element => {
      const uniqueTags = new Set();
              if (element.tags && Array.isArray(element.tags)) {
                  element.tags.forEach(tag =>{
                      uniqueTags.add(tag);
                  });
              }
      const uniqueSet = new Set();
      uniqueSet.add(uniqueTags)
              console.log(uniqueSet);
  });
    
  }
  
  productData(); */

