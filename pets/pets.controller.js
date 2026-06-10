"use strict";

const store = require("./store");

async function listPets(req, res) {
  try {
    const { page, limit, search, species, status } = req.query;
    const result = await store.getAll({ page, limit, search, species, status });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getPet(req, res) {
  try {
    const pet = await store.getById(req.params.id);
    if (!pet) return res.status(404).json({ error: "Pet not found" });
    res.json(pet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createPet(req, res) {
  try {
    const allowed = ["name", "species", "breed", "age", "weight", "status", "ownerName", "ownerEmail", "ownerPhone", "lastVisit", "nextAppointment", "medicalNotes", "vaccinations"];
    const fields = {};
    for (const key of allowed) { fields[key] = req.body[key]; }

    const pet = await store.create(fields);
    res.status(201).json(pet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updatePet(req, res) {
  try {
    const allowed = ["name", "species", "breed", "age", "weight", "status", "ownerName", "ownerEmail", "ownerPhone", "lastVisit", "nextAppointment", "medicalNotes", "vaccinations"];
    const changes = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) changes[key] = req.body[key];
    }

    const updated = await store.update(req.params.id, changes);
    if (!updated) return res.status(404).json({ error: "Pet not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deletePet(req, res) {
  try {
    const deleted = await store.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Pet not found" });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listPets, getPet, createPet, updatePet, deletePet };