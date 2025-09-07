import express from 'express';
import pool from '../models/db.js';

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        
        const categoryData = await pool.query('SELECT category_id, category_name FROM categories');

        
        res.render("products",{
            showSearch: false,
            categoriesName: categoryData[0],
        });
         
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Internal Server Error");
    }

});

router.get("/api/get-products", async (req, res)=>{

    const categoryId = req.query.category;
    let query = `
        SELECT p.product_id, 
            p.title,
            p.price,
            p.product_discount_persentage,
            p.category_id, 
            img.image_url
        FROM products p
        JOIN (
            SELECT category_id, 
                MIN(product_id) AS first_product_id
            FROM products
            GROUP BY category_id
        ) first_products
            ON p.product_id = first_products.first_product_id
        LEFT JOIN (
            SELECT product_id, 
                MIN(image_id) AS first_image_id
            FROM product_images
            GROUP BY product_id
        ) first_images
            ON p.product_id = first_images.product_id
        LEFT JOIN product_images img
            ON img.image_id = first_images.first_image_id
    `;

    if (categoryId) {
        query = ` select category_id, product_id, price, product_discount_persentage, title, thumbnail from products where category_id = ${categoryId};`;
    }

    const categoryProducts = await pool.execute(query);

    res.json(categoryProducts[0]); 

})

  
  

export default router;