"use strict";

const { Router } = require("express");
const { authenticateToken } = require("./auth.middleware");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./auth.middleware");

const router = Router();

router.post("/refresh", authenticateToken, (req, res) => {
    try {
        const user = req.user;

        const newToken = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role,
                lastActivity: Date.now()
            },
            JWT_SECRET,
            { expiresIn: "15m" }
        );

        res.json({
            token: newToken,
            expiresIn: 15 * 60 * 1000 // 15 minutes
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;