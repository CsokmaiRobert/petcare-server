"use strict";

const { Sequelize } = require("sequelize");
const path = require("path");
const fs = require("fs");

let storagePath;

if (process.env.RAILWAY_VOLUME_MOUNT_PATH) {
    storagePath = path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, "database.sqlite");
} else if (process.env.DATA_DIR) {
    storagePath = path.join(process.env.DATA_DIR, "database.sqlite");
} else if (process.env.NODE_ENV === 'production') {
    console.warn("DATA_DIR not set, using fallback ./data");
    storagePath = path.join(__dirname, "../data", "database.sqlite");
} else {
    storagePath = path.join(__dirname, "../database.sqlite");
}

const dbDir = path.dirname(storagePath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: storagePath,
    logging: false,
});

module.exports = sequelize;