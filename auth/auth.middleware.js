"use strict";

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "petcare_secret_key";
const SESSION_TIMEOUT_MS = process.env.SESSION_TIMEOUT_MS || 15 * 60 * 1000;

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Access token missing" });
    }

    jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
        if (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({ error: "Session expired. Please log in again." });
            }
            return res.status(403).json({ error: "Invalid token" });
        }

        if (decodedUser.lastActivity) {
            const now = Date.now();
            const timeSinceLastActivity = now - decodedUser.lastActivity;

            if (timeSinceLastActivity > SESSION_TIMEOUT_MS) {
                return res.status(401).json({
                    error: "Session expired due to inactivity. Please log in again."
                });
            }
        }

        req.user = decodedUser;
        next();
    });
}

function requireRole(role) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ error: `Forbidden: Requires ${role} role permissions` });
        }
        next();
    };
}

module.exports = { authenticateToken, requireRole, JWT_SECRET, SESSION_TIMEOUT_MS };