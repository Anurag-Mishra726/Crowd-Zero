import express from "express";
import pool from "../models/db.js";

const router = express.Router();

router.get("/", (req, res) => { res.render("delet-account")});

router.post("/api/delete", async (req, res) => {
  if (!req.session || !req.session.isLoggedIn) {
    return res.status(401).json({
      status: "unauthorized",
      message: "You must be logged in",
      isLoggedIn: false
    });
  }

  try {
    const userId = req.session.userId;

    // delete user
    await pool.query("DELETE FROM user WHERE user_id = ?", [userId]);

    // destroy session
    req.session.destroy();

    res.status(200).json({
      status: "success",
      message: "Account deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error"
    });
  }
});

export default router;
