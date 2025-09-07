import express from 'express';
import pool from '../models/db.js';

const router = express.Router();

const requireLogin = (req, res, next) => {
    if (!req.session || !req.session.isLoggedIn) {
      return res.status(401).json({
        succes: false,
        message: "You must be logged in to view Profile",
        isLoggedIn: false
      });
    }
    next();
};


router.get("/", async(req, res)=>{
    res.render('product-view', {showSearch: true});
});

router.get('/api/produtc-view', async (req, res) => {
    try {
        const categoryId = req.query.category
        const productId = req.query.product

        const query = `
            SELECT i.image_id, p.category_id, c.category_name, p.product_id, p.title, p.product_brand, p.thumbnail, p.price, p.product_discount_persentage, p.availability_status,p.return_policy, p.product_description, i.image_url 
            FROM products p 
            JOIN product_images i
            JOIN categories c 
            on p.product_id = i.product_id
            WHERE  p.product_id = (?) AND c.category_id = (?);
            `;

        const productView = await pool.execute(query, [productId, categoryId]);
        //console.log(productView[0]);

        res.json(productView[0]);
    } catch (error) {
        console.error("Error fetching product view:", error);
    }
});

router.get('/api/product/reviews', async(req, res) => {
    try {
        const productId = req.query.productId;
        const query = `
            select reviewer_name, rating, comment, review_date from reviews where product_id = (?);
        `;

        const reviews = await pool.execute(query, [productId]);
        res.json(reviews[0]);
    } catch (error) {
        console.log(error);
    }
})


router.post('/submit-review', requireLogin, async (req, res) => {

    const {product_id, reviewer_name, reviewer_email, rating, comment, review_date } = req.body;

    if (!reviewer_name || !reviewer_email || !comment || !rating || !product_id || !review_date) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {

        const checkQuery = `
            SELECT * FROM reviews 
            WHERE product_id = ? AND reviewer_email = ?;
        `;
        const [existingReview] = await pool.query(checkQuery, [product_id, reviewer_email]);

        if (existingReview.length > 0) {
            return res.status(400).json({
                message: 'You have already reviewed this product. You can update your existing review instead of adding a new one.'
            });
        }

        const query = `
            INSERT INTO reviews (product_id, reviewer_name, reviewer_email, rating, comment, review_date)
            VALUES (?, ?, ?, ?, ?, ?);
        `;
        const values = [product_id, reviewer_name, reviewer_email, rating, comment, review_date];

        const result = await pool.query(query, values);
        
        if (result.length > 0) {
            return res.status(200).json({ message: 'Review posted successfully!' });
        } else {
            return res.status(500).json({ message: 'Failed to post review. No rows were returned from the query.' });
        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'A server error occurred while posting your review.' });
    }
});

export default router;