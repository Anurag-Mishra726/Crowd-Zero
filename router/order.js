import express from 'express';
import pool from '../models/db.js';

const router = express.Router();



// GET all orders for the logged-in user
router.get('/', async (req, res) => {
    if (!req.session || !req.session.isLoggedIn) {
        return res.render('order', { isLoggedIn: false})
    }

    const userId = req.session.userId;

    try {
        const connection = await pool.getConnection();

        const [orders] = await connection.execute(`
            SELECT 
                o.order_id,
                o.created_at,
                o.total_amount_in_inr,
                o.total_amount_in_dollor,
                o.payment_method,
                o.status,
                oi.product_id,
                oi.product_price,
                oi.product_discount_percentage,
                oi.quantity,
                p.title AS product_name
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            JOIN products p ON oi.product_id = p.product_id
            WHERE o.user_id = ?
            ORDER BY o.order_id DESC
        `, [userId]);

        connection.release();

        // Group products by order_id
        const ordersMap = {};
        orders.forEach(item => {
            if (!ordersMap[item.order_id]) {
                ordersMap[item.order_id] = {
                    order_id: item.order_id,
                    order_date: item.created_at,
                    total_amount_in_inr: item.total_amount_in_inr,
                    total_amount_in_dollor: item.total_amount_in_dollor,
                    payment_method: item.payment_method,
                    status: item.status,
                    products: []
                };
            }
            ordersMap[item.order_id].products.push({
                product_id: item.product_id,
                name: item.product_name,
                price: item.product_price,
                discount: item.product_discount_percentage,
                quantity: item.quantity
            });
        });

        const ordersList = Object.values(ordersMap);

        //console.log(ordersList[0].products);

        res.render('order', { showSearch: false, orders: ordersList });

    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to load orders");
    }
});

export default router;