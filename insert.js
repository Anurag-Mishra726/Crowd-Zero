import pool from './models/db.js';

async function insertCategoriesData(){
    const categoriesData = await fetch("https://dummyjson.com/products/categories");
    const categoriesDataInJson = await categoriesData.json();

     categoriesDataInJson.map(async (items) => {
        try {
            const [result] = await pool.query(
                "INSERT INTO categories (slug, category_name, category_url) VALUE (?, ?, ?)", [items.slug, items.name, items.url]
            );
        } catch (error) {
            console.error("Error : ", error)
        }
    });
}

async function insertProductData(){
    const [categories] = await pool.query("SELECT category_url, category_id FROM categories");

    categories.map(async(items)=>{
        let productData = await fetch(`${items.category_url}`);
        let productDataInJson = await productData.json();

        productDataInJson.products.forEach(async(element) => {
            try {
                const [productTableResult] = await pool.query(
                    "INSERT INTO products ( category_id, thumbnail, availability_status, product_brand, product_description, product_discount_persentage, price, return_policy, stock_quantity, title) VALUE (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [
                        items.category_id, 
                        element.thumbnail,
                        element.availabilityStatus,
                        element.brand,
                        element.description,
                        element.discountPercentage,
                        element.price,
                        element.returnPolicy,
                        element.stock,
                        element.title
                    ]
                );

                const productId = productTableResult.insertId;

                for(const tagName of element.tags){
                    await pool.query("INSERT IGNORE INTO tags (tag_name) VALUE (?)" , [tagName]);

                    const [tagRows] = await pool.query("SELECT tag_id FROM tags WHERE tag_name = ?" , [tagName]);

                    if (tagRows.length > 0) {
                        const tag_id = tagRows[0].tag_id;

                        await pool.query("INSERT IGNORE INTO product_tag (product_id, tag_id) VALUE (?, ?)", [productId, tag_id]);
                    }
                }

                

                for (let imageUrl of element.images) {
                    await pool.query(
                        "INSERT INTO product_images (product_id, image_url) VALUE (?, ?)",
                        [productId, imageUrl]
                    );
                }

                for(let reviews of element.reviews){
                    await pool.query("INSERT INTO reviews (product_id, reviewer_name, reviewer_email, rating, comment, review_date) VALUE (?, ?, ?, ?, ?, ?)", [ 
                        productId, 
                        reviews.reviewerName, 
                        reviews.reviewerEmail, 
                        reviews.rating, 
                        reviews.comment, 
                        reviews.date
                    ]);
                }


            } catch (error) {
                console.error("Error occurred : ", error);
            }
        });

    })
}


async function start() {
    try {
      //await insertCategoriesData();
      //await insertProductData();
      console.log("All data inserted successfully");
    } catch (err) {
      console.error(err);
    }
  }
  
  //start();