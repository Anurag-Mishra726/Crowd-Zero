
/* async function productData() {
    let data = await fetch("https://dummyjson.com/products/categories");
    let dataInJson = await data.json();
  
    // Get only the "name" values
    console.log(dataInJson[0].name, dataInJson[0].slug);
    try {
        dataInJson.map(items => console.log(items.ur))
    } catch (error) {
        console.error(" Error : ",error);
    }
  }
  
  productData(); */


  async function productData() {
    let data = await fetch("https://dummyjson.com/products/category/fragrances");
    let dataInJson = await data.json();
    
    dataInJson.products.forEach(element => {
        
        /* element.reviews.map(items=>{
            console.log(items.reviewerName);
        }); */

       /*  for (const items of element.tags) {
            console.log(items);
        } */

            
            for(const tagName of element.tags){

                for (const items of tagName) {
                    console.log(items);
                }
                
            }
               
    });

  }
  
  productData();