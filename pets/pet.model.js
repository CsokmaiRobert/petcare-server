"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../src/db");
const { VALID_SPECIES, VALID_STATUSES } = require("./constants");

const Pet = sequelize.define("Pet", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: { type: DataTypes.STRING(100), allowNull: false },
    species: { type: DataTypes.STRING, allowNull: false },
    breed: { type: DataTypes.STRING(100), allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false },
    weight: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    ownerName: { type: DataTypes.STRING(150), allowNull: false },
    ownerEmail: { type: DataTypes.STRING, allowNull: false },
    ownerPhone: { type: DataTypes.STRING(20), allowNull: false },
    lastVisit: { type: DataTypes.DATEONLY, allowNull: false },
    nextAppointment: { type: DataTypes.DATEONLY, allowNull: true },
    medicalNotes: { type: DataTypes.TEXT, allowNull: true },
    vaccinations: { type: DataTypes.TEXT, allowNull: true },
}, {
    timestamps: true,
});

module.exports = Pet;