import express from "express";
import bcrypt from 'bcrypt';
import pool from '../models/db.js';

const router = express.Router();

router.get('/', (req, res)=>{
    res.render('login');
});

router.post('/', async (req, res)=>{
    const {email, password} = req.body; 

    const validateForm = await validateSignupData({
        email, 
        password, 
    });

    if (!validateForm.isValid) {
        return res.status(400).json({ 
            status: 'error', 
            message: validateForm.message 
        });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM user where email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(401).json({ status: 'error', message: 'Incorrect password' });
        }

        await pool.query("DELETE FROM sessions WHERE JSON_EXTRACT(data, '$.userId') = ?", [user.user_id]);

        req.session.regenerate(err => {
            if (err){
                res.status(500).json({ status: 'error', message: 'Server error. Please try again later.' });
            }

            req.session.userId = user.user_id;
            req.session.userName = user.name;
            req.session.userEmail = user.email;
            req.session.isLoggedIn = true;

            req.session.save(error => {
                    if (error) {
                        return res.status(500).json({
                            status: "error",
                            message: "Could not save session."
                    });
                }
            });
            const redirectTo = req.query.redirectTo || "/shop";
            res.status(200).json({ 
              status: "success", 
              message: "Logged in successfully", 
              redirectTo
            });
          });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'error', message: 'Server error. Please try again later.' });
    }
});

async function validateSignupData({email, password}) {

    if (!email || !password === undefined) {
        return { isValid: false, message: "Missing fields" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
        return { isValid: false, message: 'Invalid email address' };
    }

    if (password.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters' };
    }    

    return { isValid: true };
}


export default router;