"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../src/db");

const User = sequelize.define("User", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING(20),
        defaultValue: "USER",
        allowNull: false,
    },
}, {
    timestamps: true,
});

module.exports = User;