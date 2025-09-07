import pool from '../models/db.js';

export async function buyNowData(userId) {
    try {
        const [row] = await pool.execute(
            `SELECT c.cart_id, c.user_id, p.product_id, c.quantity, p.title, p.price, p.product_discount_persentage, c.added_at
            FROM products p
            JOIN cart c ON c.product_id = p.product_id
            WHERE c.user_id = ?
            ORDER BY c.added_at DESC
            LIMIT 1;`,
            [userId]
        );

        if (row.length === 0) {
            return {lastAddedItem: [], lastAddedItemSubTotalPrice: 0, lasteAddeditemGrandTotal: 0};
        }

        let lastAddedItemSubTotalPrice = 0;
        let lasteAddeditemGrandTotal = 0;

        const lastAddedItem =  row.map(items =>{
            const discountedPrice = parseFloat(items.price) - ((parseFloat(items.product_discount_persentage) * parseFloat(items.price)) / 100);
            const totalPrice = discountedPrice.toFixed(2) * items.quantity;
            lastAddedItemSubTotalPrice += parseFloat(items.price) * items.quantity;
            lasteAddeditemGrandTotal += totalPrice; 
            
            return {
                ...items,
                discountedPrice: discountedPrice.toFixed(2),
                totalPrice: totalPrice.toFixed(2),
            };
        });  
        return {lastAddedItem, lastAddedItemSubTotalPrice, lasteAddeditemGrandTotal};

    } catch (error) {
        console.error("Database query failed", error);
        return {lastAddedItem: [], lastAddedItemSubTotalPrice: 0, lasteAddeditemGrandTotal: 0};
    }
}