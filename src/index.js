"use strict";

const http = require("http");
const { createApp } = require("./app");
const sequelize = require("./db");

const PORT = process.env.PORT || 3000;

const app = createApp();

sequelize.sync({ alter: true }).then(async () => {
  http.createServer(app).listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch(err => {
  console.error("Database synchronization failed:", err);
  process.exit(1);
});