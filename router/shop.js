import express from "express";
import pool from '../models/db.js';

const router = express.Router();


router.get('/', async (req, res)=>{

    try {

        const data = await pool.query('SELECT category_id, category_name FROM categories LIMIT 16');

        const category = data[0].map(item => item.category_id);
        const categoryName = data[0].map(item => item.category_name);

        const thumbnails = await pool.query(`
            SELECT p.*
            FROM products p
            INNER JOIN (
                SELECT category_id, MIN(product_id) AS first_product_id
                FROM products
                WHERE category_id IN (?) 
                GROUP BY category_id
            ) x 
            ON p.category_id = x.category_id 
            AND p.product_id = x.first_product_id`,
            [category]
        );

        const mostPopularProducts = await pool.query(`
            WITH ranked_products AS (
                SELECT 
                    p.product_id,
                    p.title,
                    p.price,
                    p.thumbnail,
                    c.category_id,
                    c.category_name,
                    r.rating,
                    ROW_NUMBER() OVER (PARTITION BY c.category_id ORDER BY r.review_id DESC) AS rn
                FROM reviews r
                JOIN products p ON r.product_id = p.product_id
                JOIN categories c ON p.category_id = c.category_id
                WHERE r.rating = 5
            )
            SELECT 
                product_id,
                title,
                price,
                thumbnail,
                category_id,
                category_name,
                rating
            FROM ranked_products
            WHERE rn = 1 order by category_id desc LIMIT 10;
        `);

        // const isLoggedIn = req.session.isLoggedIn || false;
        // const userName = isLoggedIn ? req.session.userName : null;

        res.render('shop', {
            showSearch: true,
            categories: categoryName,
            thumbnails: thumbnails[0],
            mostPopularProducts: mostPopularProducts[0],
            // isLoggedIn: isLoggedIn,
            // userName: userName
        });
        

    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});



export default router;