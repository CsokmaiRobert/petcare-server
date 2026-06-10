"use strict";

const { Sequelize } = require("sequelize");
const path = require("path");
const fs = require("fs");

let storagePath;

if (process.env.RAILWAY_VOLUME_MOUNT_PATH) {
    storagePath = path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, "database.sqlite");
} else if (process.env.NODE_ENV === 'production') {
    storagePath = "/data/database.sqlite";
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