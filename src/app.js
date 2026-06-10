"use strict";

const express = require("express");
const petsRouter = require("../pets/pets.routes");
const authRouter = require("../auth/auth.routes");
const sessionRouter = require("../auth/session.routes");
const allowedOrigin = process.env.ALLOWED_ORIGIN || "http://localhost:4200";

function createApp() {
  const app = express();

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });

  app.use(express.json());

  app.use("/api/auth", authRouter);
  app.use("/api/pets", petsRouter);
  app.use("/api/session", sessionRouter);

  app.use((req, res) => res.status(404).json({ error: "Not found" }));
  return app;
}

module.exports = { createApp };