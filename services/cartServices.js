import pool from "../models/db.js"

export async function cartItemsData(userId) {
    try {
        const [cartItems] = await pool.query(
            `SELECT c.cart_id ,c.user_id, p.product_id, c.quantity, p.title, p.price,  p.product_discount_persentage,p.thumbnail
            FROM products p
            JOIN cart c
            ON c.product_id = p.product_id
            WHERE c.user_id = (?);
        `, [userId]);
        if (cartItems.length === 0) {
            return  { newPrice: [], subTotal: 0, grandTotal: 0 };
        }

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
        grandTotal = Number(grandTotal.toFixed(2));
        return {newPrice, subTotal, grandTotal };
    } catch (error) {
        //throw new Error("Database query failed");
        return { newPrice: [], subTotal: 0, grandTotal: 0 };
    }
}