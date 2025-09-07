import express from "express";
import pool from "../models/db.js"; 

const router = express.Router();

router.post("/api/newsletter", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    const [existing] = await pool.query("SELECT * FROM newsletter_subscribers WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email is already subscribed." });
    }

    await pool.query("INSERT INTO newsletter_subscribers (email) VALUES (?)", [email]);
    res.json({ success: true, message: "Subscribed successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error." });
  }
});

export default router;
