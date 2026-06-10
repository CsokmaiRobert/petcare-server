"use strict";

const request = require("supertest");
const { createApp } = require("../src/app");
const sequelize = require("../src/db");
const User = require("../auth/user.model");
const Pet = require("../pets/pet.model");

let app;
let server;
let authToken;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  app = createApp();
  server = app.listen(3003);
});

afterAll(async () => {
  await sequelize.close();
  server.close();
});

beforeEach(async () => {
  await Pet.destroy({ where: {}, truncate: true });
  await User.destroy({ where: {}, truncate: true });

  await request(app)
    .post("/api/auth/register")
    .send({ username: "petowner", password: "password123" });

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ username: "petowner", password: "password123" });

  authToken = loginRes.body.token;
});

const validPet = {
  name: "Buddy",
  species: "Dog",
  breed: "Golden Retriever",
  age: 3,
  weight: 25.5,
  status: "Active",
  ownerName: "John Doe",
  ownerEmail: "john@example.com",
  ownerPhone: "1234567890",
  lastVisit: "2024-01-15",
  nextAppointment: "2024-02-15",
  medicalNotes: "Healthy",
  vaccinations: "Rabies, Distemper"
};

describe("Pets API Tests", () => {

  test("POST /api/pets - should create a pet with valid data", async () => {
    const response = await request(app)
      .post("/api/pets")
      .set("Authorization", `Bearer ${authToken}`)
      .send(validPet);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe("Buddy");
    expect(response.body.species).toBe("Dog");
    expect(response.body.age).toBe(3);
  });

  test("POST /api/pets - should reject without authentication", async () => {
    const response = await request(app)
      .post("/api/pets")
      .send(validPet);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error", "Access token missing");
  });

  test("POST /api/pets - should reject invalid data", async () => {
    const invalidPet = {
      name: "",
      species: "Dragon",
      age: -5
    };

    const response = await request(app)
      .post("/api/pets")
      .set("Authorization", `Bearer ${authToken}`)
      .send(invalidPet);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  test("GET /api/pets - should list all pets", async () => {
    await request(app)
      .post("/api/pets")
      .set("Authorization", `Bearer ${authToken}`)
      .send(validPet);

    await request(app)
      .post("/api/pets")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ ...validPet, name: "Max", species: "Cat" });

    const response = await request(app)
      .get("/api/pets")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body).toHaveProperty("total", 2);
    expect(response.body.data.length).toBe(2);
  });

  test("GET /api/pets - should support pagination", async () => {
    for (let i = 0; i < 15; i++) {
      await request(app)
        .post("/api/pets")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ ...validPet, name: `Pet${i}` });
    }

    const response = await request(app)
      .get("/api/pets?page=2&limit=5")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.page).toBe(2);
    expect(response.body.limit).toBe(5);
    expect(response.body.data.length).toBe(5);
    expect(response.body.totalPages).toBe(3);
  });

  test("GET /api/pets - should filter by species", async () => {
    await request(app)
      .post("/api/pets")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ ...validPet, name: "Rex", species: "Dog" });

    await request(app)
      .post("/api/pets")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ ...validPet, name: "Whiskers", species: "Cat" });

    const response = await request(app)
      .get("/api/pets?species=Dog")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.data[0].species).toBe("Dog");
  });

  test("GET /api/pets - should search by name", async () => {
    await request(app)
      .post("/api/pets")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ ...validPet, name: "UniqueSearchName" });

    const response = await request(app)
      .get("/api/pets?search=UniqueSearchName")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.data[0].name).toBe("UniqueSearchName");
  });

  test("GET /api/pets/:id - should get a single pet", async () => {
    const createRes = await request(app)
      .post("/api/pets")
      .set("Authorization", `Bearer ${authToken}`)
      .send(validPet);

    const petId = createRes.body.id;

    const response = await request(app)
      .get(`/api/pets/${petId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(petId);
    expect(response.body.name).toBe("Buddy");
  });

  test("GET /api/pets/:id - should return 404 for non-existent pet", async () => {
    const response = await request(app)
      .get("/api/pets/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", "Pet not found");
  });

  test("PUT /api/pets/:id - should update a pet", async () => {
    const createRes = await request(app)
      .post("/api/pets")
      .set("Authorization", `Bearer ${authToken}`)
      .send(validPet);

    const petId = createRes.body.id;

    const response = await request(app)
      .put(`/api/pets/${petId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Buddy Updated", age: 4, weight: 30.5 });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Buddy Updated");
    expect(response.body.age).toBe(4);
    expect(response.body.weight).toBe(30.5);
    expect(response.body.species).toBe("Dog");
  });

  test("PUT /api/pets/:id - should reject updating forbidden fields", async () => {
    const createRes = await request(app)
      .post("/api/pets")
      .set("Authorization", `Bearer ${authToken}`)
      .send(validPet);

    const petId = createRes.body.id;

    const response = await request(app)
      .put(`/api/pets/${petId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ id: "new-id", createdAt: "2024-01-01", name: "Buddy" });

    expect(response.status).toBe(400);
    expect(response.body.errors[0]).toContain("cannot be modified");
  });

  test("DELETE /api/pets/:id - should delete a pet", async () => {
    const createRes = await request(app)
      .post("/api/pets")
      .set("Authorization", `Bearer ${authToken}`)
      .send(validPet);

    const petId = createRes.body.id;

    const deleteRes = await request(app)
      .delete(`/api/pets/${petId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(deleteRes.status).toBe(204);

    const getRes = await request(app)
      .get(`/api/pets/${petId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(getRes.status).toBe(404);
  });

  test("DELETE /api/pets/:id - should return 404 for non-existent pet", async () => {
    const response = await request(app)
      .delete("/api/pets/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", "Pet not found");
  });
});