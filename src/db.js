"use strict";

const { Sequelize } = require("sequelize");

let sequelize;

if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
        logging: false,
    });
} else {
    const path = require("path");
    const fs = require("fs");
    let storagePath = path.join(__dirname, "../database.sqlite");

    if (process.env.DATA_DIR) {
        storagePath = path.join(process.env.DATA_DIR, "database.sqlite");
    }

    const dbDir = path.dirname(storagePath);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    sequelize = new Sequelize({
        dialect: "sqlite",
        storage: storagePath,
        logging: false,
    });
}

module.exports = sequelize;