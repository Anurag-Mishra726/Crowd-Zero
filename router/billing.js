import express from "express";
import { getUserProfileData } from "../services/profileServices.js";
import { cartItemsData } from '../services/cartServices.js';
import { buyNowData } from "../services/buyNow.js";
import pool from "../models/db.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const router = express.Router();

const requireLogin = (req, res, next) => {
    if (!req.session || !req.session.isLoggedIn) {
        return res.status(401).json({
        status: "unauthorized",
        message: "You must be logged in to place Order",
        isLoggedIn: false
        });
    }
    next();
};

router.get("/", async (req, res) => {
    if (!req.session || !req.session.isLoggedIn) {
        return res.render('billing', { isLoggedIn: false });
    }

    const from = req.query.from;

    try {
        const userId = req.session.userId;

        const { newPrice, subTotal, grandTotal } = await cartItemsData(userId);
        if (!newPrice) {
            return res.render('billing', { 
                showSearch: false,
                cartItems: [],
                message: "empty"
            });
        }

        const profile = await getUserProfileData(userId);
        if (!profile) {
            return res.status(404).render('user-not-found');
        }
        try {
            
            if (from === "buyNow") {

                const {lastAddedItem, lastAddedItemSubTotalPrice, lasteAddeditemGrandTotal} = await buyNowData(userId);

                if(lastAddedItem.length === 0){
                    return res.render('billing', {
                        showSearch: false,
                        cartItems: newPrice,
                        subTotal: subTotal,
                        grandTotal: grandTotal,
                        user: profile,
                        lastAddedItem: [],

                    });
                }

                return res.render('billing',{
                    showSearch: false,
                    cartItems: newPrice,
                    subTotal: subTotal,
                    grandTotal: grandTotal,
                    user: profile,
                    lastAddedItem: lastAddedItem,
                    lastAddedItemSubTotalPrice: lastAddedItemSubTotalPrice,
                    lasteAddeditemGrandTotal: lasteAddeditemGrandTotal,
                    status: "success"
                });
                
            }
        } catch (error) {
            return res.render('billing', {
                showSearch: false,
                cartItems: newPrice,
                subTotal: subTotal,
                grandTotal: grandTotal,
                user: profile,
                message: "Could not retrieve buy now item"
            });
        }

        res.render('billing', {
            showSearch: false,
            cartItems: newPrice,
            subTotal: subTotal,
            grandTotal: grandTotal,
            user: profile,
            lastAddedItem: [],
            lastAddedItemSubTotalPrice: 0,
            lasteAddeditemGrandTotal: 0,
        });

    } catch (error) {
        console.error("Billing route error:", error);
        return res.status(500).send("Internal Server Error");
    }
});


router.post("/api/order", requireLogin, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const userId = req.session.userId;
        const paymentMethod = req.body.paymentMethod;

        if (req.query.from == 'buyNow') {
            const {lastAddedItem, lastAddedItemSubTotalPrice, lasteAddeditemGrandTotal} = await buyNowData(userId);

            if(lastAddedItem.length === 0){
                return res.json({status: "error", message: "No items found to place order"});
            }

            const product = lastAddedItem[0];

            let totalAmountInDollor ;
            let totalAmountInInr;
            if (lasteAddeditemGrandTotal <= 100) {
                totalAmountInDollor = Number((lasteAddeditemGrandTotal + 50).toFixed(2));    
                totalAmountInInr = Number((totalAmountInDollor * 80).toFixed(2));            
            }else{
                totalAmountInDollor = lasteAddeditemGrandTotal;
                totalAmountInInr = Number((totalAmountInDollor * 80).toFixed(2));
            }
            let result;
            if(paymentMethod === 'cash'){
                
                [result] = await connection.execute(`
                    INSERT INTO orders (user_id, total_amount_in_dollor, total_amount_in_inr, payment_method)
                    VALUES (?, ?, ?, ?)`,
                    [userId, totalAmountInDollor, totalAmountInInr, "cash"]
                );
            }else if(paymentMethod === 'online'){
                const options = {
                    amount: Math.round(totalAmountInInr * 100), // amount in the smallest currency unit
                    currency: "INR",
                    receipt: `rcpt_order_${userId}_${Date.now()}`,
                    notes:{userId: userId.toString(), purpose: "order_payment"},
                };

                const razorpayOrder = await razorpay.orders.create(options);

                [result] = await connection.execute(`
                    INSERT INTO orders (user_id, razorpay_id, total_amount_in_dollor, total_amount_in_inr, payment_method, status)
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [userId, razorpayOrder.id, totalAmountInDollor, totalAmountInInr, "online", "pending"]
                );

                await connection.commit();

                return res.json({
                    status: "created",
                    razorpayOrderId: razorpayOrder.id,
                    amount: options.amount,
                    currency: options.currency,
                    key: process.env.RAZORPAY_KEY_ID
                });
            }
                  
            const newOrderId = result.insertId;

            const [orderItem] = await connection.execute(`
                INSERT INTO order_items(order_id, product_id, quantity, product_price, product_discount_percentage)
                VALUES (?, ?, ?, ?, ?)`,
                [newOrderId, product.product_id, product.quantity, product.price, product.product_discount_persentage]
            );

            const [deleteCart] = await connection.execute(`
                DELETE FROM cart WHERE cart_id = ?`,
                [product.cart_id]
            );
            await connection.commit();
            return res.json({status: "success", message: "Order placed successfully"});
            
        }else{
            const { newPrice, subTotal, grandTotal } = await cartItemsData(userId);

            if (newPrice.length === 0) {
                return res.json({status: "error", message: "No items found to place order"});
            }

            let totalAmountInDollor ;
            let totalAmountInInr ;
            if (grandTotal <= 100) {
                totalAmountInDollor = Number((grandTotal + 50).toFixed(2));    
                totalAmountInInr = Number((totalAmountInDollor * 80).toFixed(2));            
            }else{
                totalAmountInDollor = grandTotal;
                totalAmountInInr = Number((totalAmountInDollor * 80).toFixed(2));
            }
            let result;
            if(paymentMethod === 'cash'){
                
                [result] = await connection.execute(`
                    INSERT INTO orders (user_id, total_amount_in_dollor, total_amount_in_inr, payment_method)
                    VALUES (?, ?, ?, ?)`,
                    [userId, totalAmountInDollor, totalAmountInInr, "cash"]
                );
            }else if(paymentMethod === 'online'){
                const options = {
                    amount: Math.round(totalAmountInInr * 100), 
                    currency: "INR",
                    receipt: `rcpt_order_${userId}_${Date.now()}`,
                    notes:{userId: userId.toString(), purpose: "order_payment"},
                };

                const razorpayOrder = await razorpay.orders.create(options);

                [result] = await connection.execute(`
                    INSERT INTO orders (user_id, razorpay_id, total_amount_in_dollor, total_amount_in_inr, payment_method, status)
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [userId, razorpayOrder.id, totalAmountInDollor, totalAmountInInr, "online", "pending"]
                );

                await connection.commit();

                return res.json({
                    status: "created",
                    razorpayOrderId: razorpayOrder.id, 
                    amount: options.amount,
                    currency: options.currency,
                    key: process.env.RAZORPAY_KEY_ID
                });
            }

            const newOrderId = result.insertId;

            for (const product of newPrice) {
                const [orderItem] = await connection.execute(`
                    INSERT INTO order_items(order_id, product_id, quantity, product_price, product_discount_percentage)
                    VALUES (?, ?, ?, ?, ?)`,
                    [newOrderId, product.product_id, product.quantity, product.price, product.product_discount_persentage]
                );
            }

            const cartIds = newPrice.map(p => p.cart_id);
            if (cartIds.length > 0) {
                await connection.query(`DELETE FROM cart WHERE cart_id IN (?)`, [cartIds]);
            }

            await connection.commit();
            return res.json({status: "success", message: "Order placed successfully"});
                      
        }
        
    } catch (error) {
        await connection.rollback();
        console.log(error);
        res.json({status: "error", message: "Order placed failed!! Try again later"})
    }finally{
        connection.release();
    }    
});


router.post("/api/payment/verify", requireLogin, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Generate signature
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        return res.json({ status: "failed", message: "Payment verification failed" });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const userId = req.session.userId;   

        const [orderUpdate] = await connection.execute(
            `UPDATE orders 
                SET status = 'paid', razorpay_payment_id = ? 
                WHERE razorpay_id = ? AND user_id = ?`,
            [razorpay_payment_id, razorpay_order_id, userId]
        );
        
        const [rows] = await connection.execute(
            `SELECT order_id FROM orders WHERE razorpay_id = ? AND user_id = ?`,
            [razorpay_order_id, userId]
        );

        if (rows.length === 0) {
            throw new Error("Order not found after update");
        }
        const orderId = rows[0].order_id;

        if(req.query.from == 'buyNow'){
            const {lastAddedItem, lastAddedItemSubTotalPrice, lasteAddeditemGrandTotal} = await buyNowData(userId);

            const product = lastAddedItem[0];

            const [orderItem] = await connection.execute(`
                INSERT INTO order_items(order_id, product_id, quantity, product_price, product_discount_percentage)
                VALUES (?, ?, ?, ?, ?)`,
                [orderId, product.product_id, product.quantity, product.price, product.product_discount_persentage]
            );

            await connection.execute(
                `DELETE FROM cart WHERE cart_id = ?`,
                [product.cart_id]
            );
        }else{
            const { newPrice, subTotal, grandTotal } = await cartItemsData(userId);

            for (const product of newPrice) {
                const [orderItem] = await connection.execute(`
                    INSERT INTO order_items(order_id, product_id, quantity, product_price, product_discount_percentage)
                    VALUES (?, ?, ?, ?, ?)`,
                    [orderId, product.product_id, product.quantity, product.price, product.product_discount_persentage]
                );
            }

            const cartIds = newPrice.map(p => p.cart_id);
            if (cartIds.length > 0) {
                await connection.query(`DELETE FROM cart WHERE cart_id IN (?)`, [cartIds]);
            }
        }
        
        await connection.commit();
        return res.json({ status: "success", message: "Payment verified & order updated" });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.json({ status: "error", message: "Something went wrong" });
    } finally {
        connection.release();
    }
});

router.post("/api/order/cancel", requireLogin, async (req, res) => {
    const { razorpayOrderId } = req.body;
    const userId = req.session.userId;

    const connection = await pool.getConnection();
    try {
        const [result] = await connection.execute(
            `DELETE FROM orders WHERE razorpay_id = ? AND user_id = ? AND status = 'pending'`,
            [razorpayOrderId, userId]
        );
        res.json({ status: "cancelled" });
    } catch (err) {
        res.json({ status: "error", message: "Failed to cancel order" });
    } finally {
        connection.release();
    }
});

export default router;