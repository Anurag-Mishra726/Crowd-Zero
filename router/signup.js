import express from "express";
import bcrypt from 'bcrypt';

import pool from '../models/db.js';

const router = express.Router();
const saltRounds = 10;

router.get('/', (req, res)=> {
    res.render('signup');
});

router.post('/', async(req, res)=>{
    const acceptedValues = [true, "true", 1, "1"];
    const {name, email, password, confirmPassword, terms} = req.body;

    let ipAddress ='unknown';

    try{
        let rawIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        if (typeof rawIP === 'string' && rawIP.includes(',')) {
            rawIP = rawIP.split(',')[0].trim();
          }
        
          if (typeof rawIP === 'string' && rawIP.includes('::ffff:')) {
            ipAddress = rawIP.split('::ffff:')[1];
          } else if (typeof rawIP === 'string') {
            ipAddress = rawIP;
          }
    }catch(err){
        ipAddress = 'unknown';
    }

    const validateForm = await validateSignupData({
            name, 
            email, 
            password, 
            confirmPassword, 
            terms,
            acceptedValues
    });    

    if (!validateForm.isValid) {
        return res.status(400).json({ 
            status: 'error', 
            message: validateForm.message 
        });
    }

    const checkEmailExist = await checkUserAccount(email);

    if (checkEmailExist.status === 'failed') {
        return res.status(500).json({ 
            status: 'error', 
            message: 'Something went wrong! Please try again later.', 
            error: 'Internal server error' 
        });
    }
    
    if (!checkEmailExist.isValid) {
        return res.status(409).json({
            status: 'error',
            message: checkEmailExist.message
        });
    }
    
    try{
        const hashPassword = await bcrypt.hash(password, saltRounds);

        const termsAccepted = acceptedValues.includes(terms) ? 1 : 0;

        const [result] = await pool.query(
            'INSERT INTO user (name, email, password, terms_accepted, ip_address) value (?, ?, ?, ?, ?)', [name, email, hashPassword, termsAccepted, ipAddress]
        );

        res.status(201).json({
            status:'success', 
            message: 'User registered successfully', 
            redirectTo: '/login' 
        });
    }catch(error){
        console.error(error.message);
        console.error(error);
        res.status(500).json({ 
            status:'error', 
            message:'Something went wrong! Please try again later.', 
            error: 'Internal server error' 
        });
    }
});

async function validateSignupData({name, email, password, confirmPassword, terms, acceptedValues}) {

    if (!name || !email || !password || !confirmPassword || terms === undefined) {
        return { isValid: false, message: "Missing fields" };
    }
    
    if (!name || name.trim().length === 0) {
        return { isValid: false, message: 'Invalid name' };
    }

    if(name.length < 2){
        return {isValid: false, message: 'Name is too short.'};
    } 

    const trimmed = name.trim();
    const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;

    if (!nameRegex.test(trimmed)) {
        return { isValid: false, message: 'Invalid name' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
        return { isValid: false, message: 'Invalid email address' };
    }

    if (!password || password.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters' };
    }
    
    if (password !== confirmPassword) {
        return { isValid: false, message: 'Passwords do not match' };
    }

    if (!acceptedValues.includes(terms)) {
        return {isValid: false, message: "You must accept the Terms & Conditions" };
    }

    return { isValid: true };
}

async function checkUserAccount(email) {
    try {
        const [userAccount] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);

        if (userAccount.length > 0) {
            return { isValid: false, message: 'User already exists.' };
        } else {
            return { isValid: true }; 
        }

    } catch (err) {
        console.error('Database error:', err);
        return { status: 'failed' };
    }
}


export default router;