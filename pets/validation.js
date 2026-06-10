"use strict";

const { VALID_SPECIES, VALID_STATUSES } = require("./constants");

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9\-+()\s]{7,20}$/;

function validatePetFields(body, requireAll = true) {
  const errors = [];

  const required = [
    "name",
    "species",
    "breed",
    "age",
    "weight",
    "status",
    "ownerName",
    "ownerEmail",
    "ownerPhone",
    "lastVisit",
  ];

  if (requireAll) {
    for (const field of required) {
      if (
        body[field] === undefined ||
        body[field] === null ||
        body[field] === ""
      ) {
        errors.push(`${field} is required`);
      }
    }
  }

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim().length === 0) {
      errors.push("name must be a non-empty string");
    } else if (body.name.trim().length > 100) {
      errors.push("name must be at most 100 characters");
    }
  }

  if (body.species !== undefined) {
    if (!VALID_SPECIES.includes(body.species)) {
      errors.push(`species must be one of: ${VALID_SPECIES.join(", ")}`);
    }
  }

  if (body.breed !== undefined) {
    if (typeof body.breed !== "string" || body.breed.trim().length === 0) {
      errors.push("breed must be a non-empty string");
    } else if (body.breed.trim().length > 100) {
      errors.push("breed must be at most 100 characters");
    }
  }

  if (body.age !== undefined) {
    const age = Number(body.age);
    if (!Number.isInteger(age) || age < 0 || age > 150) {
      errors.push("age must be a non-negative integer up to 150");
    }
  }

  if (body.weight !== undefined) {
    const weight = Number(body.weight);
    if (isNaN(weight) || weight <= 0 || weight > 1000) {
      errors.push("weight must be a positive number up to 1000");
    }
  }

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) {
      errors.push(`status must be one of: ${VALID_STATUSES.join(", ")}`);
    }
  }

  if (body.ownerName !== undefined) {
    if (
      typeof body.ownerName !== "string" ||
      body.ownerName.trim().length === 0
    ) {
      errors.push("ownerName must be a non-empty string");
    } else if (body.ownerName.trim().length > 150) {
      errors.push("ownerName must be at most 150 characters");
    }
  }

  if (body.ownerEmail !== undefined) {
    if (!EMAIL_RE.test(body.ownerEmail)) {
      errors.push("ownerEmail must be a valid email address");
    }
  }

  if (body.ownerPhone !== undefined) {
    if (!PHONE_RE.test(body.ownerPhone)) {
      errors.push(
        "ownerPhone must be a valid phone number (7-20 digits/symbols)",
      );
    }
  }

  if (body.lastVisit !== undefined) {
    if (!DATE_RE.test(body.lastVisit)) {
      errors.push("lastVisit must be a date in YYYY-MM-DD format");
    }
  }

  if (body.nextAppointment !== undefined && body.nextAppointment !== "") {
    if (!DATE_RE.test(body.nextAppointment)) {
      errors.push("nextAppointment must be a date in YYYY-MM-DD format");
    }
  }

  if (
    body.medicalNotes !== undefined &&
    typeof body.medicalNotes !== "string"
  ) {
    errors.push("medicalNotes must be a string");
  }

  if (
    body.vaccinations !== undefined &&
    typeof body.vaccinations !== "string"
  ) {
    errors.push("vaccinations must be a string");
  }

  return errors;
}

function validateCreate(req, res, next) {
  const errors = validatePetFields(req.body, true);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
}

function validateUpdate(req, res, next) {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ errors: ["Request body must not be empty"] });
  }
  const forbidden = ["id", "createdAt"];
  for (const f of forbidden) {
    if (req.body[f] !== undefined) {
      return res
        .status(400)
        .json({ errors: [`Field '${f}' cannot be modified`] });
    }
  }
  const errors = validatePetFields(req.body, false);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
}

module.exports = { validateCreate, validateUpdate };