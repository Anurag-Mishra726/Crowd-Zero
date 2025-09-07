import express from 'express';
import pool from '../models/db.js'

const router = express.Router();

router.get("/", (req, res)=>{
    res.render('contact', {showSearch: false});
});

router.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const query = `
            INSERT INTO contact_us (name, email, message)
            VALUES (?, ?, ?)
        `;
        const values = [name, email, message];

        console.log(name, email, message);

        const result = await pool.query(query, values);

        res.status(200).json({ message: 'Message sent successfully! We will get back to you soon.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send message. Please try again.' });
    }
});

export default router;