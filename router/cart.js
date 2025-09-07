import express from "express";
import pool from '../models/db.js';
import { cartItemsData } from '../services/cartServices.js'

const router = express.Router();

const requireLogin = (req, res, next) => {
    if (!req.session || !req.session.isLoggedIn) {
        return res.status(401).json({
        status: "unauthorized",
        message: "You must be logged in to view or update cart",
        isLoggedIn: false
        });
    }
    next();
};

router.get("/", async (req, res) =>{
    if (!req.session || !req.session.isLoggedIn) {
        return res.render('cart', {isLoggedIn: false, cartItems: []});
    }

    try {
        const userId = req.session.userId;
        const {newPrice, subTotal, grandTotal} = await cartItemsData(userId);
        if (!newPrice) {
            return res.render('cart', { 
                showSearch: false,
                cartItems: [],
                message: "empty"
            });
        }

        res.render('cart', {
            showSearch: false,
            cartItems: newPrice,
            subTotal: subTotal,
            grandTotal: grandTotal,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
});

router.get("/updatedData", requireLogin, async(req, res) => {
    try {
        const userId = req.session.userId;
        const [cartItems] = await pool.query(
            `SELECT c.cart_id ,c.user_id, p.product_id, c.quantity, p.title, p.price,  p.product_discount_persentage,p.thumbnail
            FROM products p
            JOIN cart c
            ON c.product_id = p.product_id
            WHERE c.user_id = (?);
        `, [userId]);

        if (cartItems.length === 0) {
            // If the cart is empty, render the cart page with an empty cart message
            return res.render('cart', { 
                showSearch: false,
                cartItems: [],
                message: "empty"
            });
            
        } else{
            let subTotal = 0;
            let grandTotal = 0;

            const newPrice=  cartItems.map(items =>{
                const discountedPrice = parseFloat(items.price) - ((parseFloat(items.product_discount_persentage) * parseFloat(items.price)) / 100);
                const totalPrice = discountedPrice.toFixed(2) * items.quantity;
                subTotal += parseFloat(items.price) * items.quantity;
                grandTotal += totalPrice; 
                
                return {
                    ...items,
                    discountedPrice: discountedPrice.toFixed(2),
                    totalPrice: totalPrice.toFixed(2),
                };
            });            

             res.json({
                cartItems: newPrice,
                subTotal: subTotal.toFixed(2),
                grandTotal: grandTotal.toFixed(2),
            });
        }        
        
    } catch (error) {
        //console.error("Error fetching cart:", error);
        return res.status(500).json({
            status: "error",
            message: "Internal Server Error"
        });
        
    }
})

router.post("/api/cart/add", requireLogin, async(req, res) =>{
    try {
        const productId = req.body.productId;
        const quantity = req.body.quantity || 1;
        const userId = req.session.userId;

        const [rows] = await pool.query(
            "SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?",
            [userId, productId]
        );

        if (rows.length > 0) {
            await pool.query(
                "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?",
                [quantity, userId, productId]
            );
        }else {
            const query = `INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)`;
            await pool.execute(query, [userId, productId, quantity]);
        }

        res.json({ status: "success", message: "Product added to cart" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to add product to cart" });
    }
});

router.patch("/api/cart/:productId", requireLogin, async (req, res) =>{
    try {
        const userId = req.session.userId;
        const productId = req.params.productId;
        const newQuantity = req.body.quantity;

        if (newQuantity < 1) {
            return res.status(400).json({ status: "error", message: "Quantity must be at least 1" });
        }

        const [result] = await pool.query(
            "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?",
            [newQuantity, userId, productId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: "error", message: "Cart item not found" });
        }

        res.json({ status: "success", message: "Cart updated successfully" });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to update cart" });
    }
});

router.delete('/api/cart/:productId', requireLogin, async (req, res)=>{
    try {
        const userId = req.session.userId;
        const productId = req.params.productId;
        
        const result = await pool.query(`DELETE FROM cart WHERE user_id = ? AND product_id = ?`, [userId, productId]);
        if (result[0].affectedRows === 0) {
            return res.status(404).json({ status: "error", message: "Cart item not found" });
        }
        res.json({ status: "success", message: "Item removed from cart" }); 
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "error", message: "Failed to remove item from cart" });
    }
})

export default router;