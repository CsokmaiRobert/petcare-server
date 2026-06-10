"use strict";

const { Op } = require("sequelize");
const Pet = require("./pet.model");
const sequelize = require("../src/db");

async function getAll({
  page = 1,
  limit = 10,
  search = "",
  species = "",
  status = "",
} = {}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  const whereClause = {};

  if (species) {
    whereClause.species = species;
  }

  if (status) {
    whereClause.status = status;
  }

  if (search) {
    const searchTarget = `%${search.toLowerCase()}%`;
    whereClause[Op.or] = [
      sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', searchTarget),
      sequelize.where(sequelize.fn('LOWER', sequelize.col('ownerName')), 'LIKE', searchTarget),
      sequelize.where(sequelize.fn('LOWER', sequelize.col('species')), 'LIKE', searchTarget),
      sequelize.where(sequelize.fn('LOWER', sequelize.col('breed')), 'LIKE', searchTarget),
    ];
  }

  const { count, rows } = await Pet.findAndCountAll({
    where: whereClause,
    limit: limitNum,
    offset: offset,
    order: [["createdAt", "DESC"]],
  });

  const totalPages = Math.ceil(count / limitNum) || 1;

  return {
    data: rows,
    total: count,
    page: pageNum,
    limit: limitNum,
    totalPages,
  };
}

async function getById(id) {
  return await Pet.findByPk(id);
}

async function create(fields) {
  return await Pet.create(fields);
}

async function update(id, changes) {
  const pet = await Pet.findByPk(id);
  if (!pet) return null;
  return await pet.update(changes);
}

async function remove(id) {
  const pet = await Pet.findByPk(id);
  if (!pet) return false;
  await pet.destroy();
  return true;
}


module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};