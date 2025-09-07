import pool from "../models/db.js"

export async function getUserProfileData(userId) {
   try {
    const [row] = await pool.query( `
        SELECT 
            u.user_id, u.name, u.email,
            p.phone_number, p.street_address, p.city, p.state, p.country, p.zip_code
        FROM user u
        LEFT JOIN profile p ON u.user_id = p.user_id
        WHERE u.user_id = (?); 
    `, [userId]);
return row.length > 0 ? row[0] : null;
   } catch (error) {
    throw new Error("Database query failed")    
   }
}

