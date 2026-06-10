"use strict";

const { Router } = require("express");
const controller = require("./pets.controller");
const { validateCreate, validateUpdate } = require("./validation");
const { authenticateToken, requireRole } = require("../auth/auth.middleware");

const router = Router();

router.use(authenticateToken);
router.use(requireRole("USER"));

router.get("/", controller.listPets);
router.get("/:id", controller.getPet);
router.post("/", validateCreate, controller.createPet);
router.put("/:id", validateUpdate, controller.updatePet);
router.delete("/:id", controller.deletePet);

module.exports = router;