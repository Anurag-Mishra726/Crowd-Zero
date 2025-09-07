import express from "express";
import pool from '../models/db.js';
import { getUserProfileData } from "../services/profileServices.js";

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


router.get("/", async(req, res) =>{
    
    if (!req.session || !req.session.isLoggedIn) {
        return res.render('profile', {isLoggedIn: false});
    }

    try {
        const userId = req.session.userId;
        const profile = await getUserProfileData(userId);

        if(!profile){
            return res.status(404).render('user-not-found');
        }
        res.render("profile", {
            showSearch: false,
            user: profile
        });
    } catch (error) {
        res.send("Internal server error");
    }

    // try {

    //     const userId = req.session.userId;

    //     const [row] = await pool.query( `
    //         SELECT 
    //             u.user_id, u.name, u.email,
    //             p.phone_number, p.street_address, p.city, p.state, p.country, p.zip_code
    //         FROM user u
    //         LEFT JOIN profile p ON u.user_id = p.user_id
    //         WHERE u.user_id = (?); 
    //     `, [userId]);

    //     if(row.length === 0){
    //         return res.status(404).render('user-not-found');  
    //     }

    //     res.render("profile",{
    //         showSearch:false,
    //         user: row[0]
    //     });

    // } catch (error) {
    //     res.send("Internal server error")
    // }
});

router.post("/update/profile", requireLogin, async(req, res) => {
    try {
        const userId = req.session.userId;
        const { phone_number, street_address, city, state, country, zip_code } = req.body;

        const [row, fields] = await pool.query(`SELECT * FROM profile WHERE user_id = ?`, [userId]);
        
        if (row.length > 0) {
            await pool.query(`
                UPDATE profile 
                SET phone_number = (?), street_address = (?), city = (?), state = (?), country = (?), zip_code = (?) 
                WHERE user_id = (?)
                `, [phone_number, street_address, city, state, country, zip_code, userId]);

            return res.json({
                succes: true,
                message: "Profile updated successfully"
            });
        } else{
            await pool.query(`
                INSERT INTO profile (user_id, phone_number, street_address, city, state, country, zip_code)
                VALUES (?,?,?,?,?,?,?)
                `, [userId, phone_number, street_address, city, state, country, zip_code]);
                res.json({ 
                    succes: true, 
                    message: "Profile created successfully "
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            succes: false, message: "Internal Server Error try again later !!"
        })
    }
  });
  

export default router;