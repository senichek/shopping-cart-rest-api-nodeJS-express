const app = require("../tests/configs/server.js"); // DO not forget the <module.exports> line in app.js file.
const request = require("supertest");
const mongoDB = require("./configs/mongoDB.js");
const users = require('../usersCollection.json')
const User = require("../models/User"); // Mongoose Schema

beforeAll(() => {
  mongoDB.connectDB;
  User.insertMany(users);
});

afterAll(() => {
  /* mongoDB.closeConnection;
  console.log("AfterAll was called"); */
  app.listener.close();
});

describe("GET /user/all", () => {
  // Wait 2 seconds just to be sure that DB is up.
  /* it('', done => {
    setTimeout(() => {
      done()
    }, 2000)
  }) */

  it("it should fetch all users from DB", async () => {  
    const res = await request(app.testServer).get("/user/all/")

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0].name).toEqual("John");
    expect(res.body[0].email).toEqual("john@gmail.com");
    expect(res.body[0].role).toEqual("Admin");
  });
});

describe("POST /user", () => {
  it("should persist new user to DB", async () => {
    const res = await request(app.testServer).post("/user").send({
      name: "Jane",
      email: "jane@gmail.com",
      password: "pass111",
      role: "User",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body._id).not.toBe(null);
    expect(res.body.password).not.toBe(null);
    expect(res.body.name).toEqual("Jane");
    expect(res.body.email).toEqual("jane@gmail.com");
    expect(res.body.role).toEqual("User");  
  });
});

describe("POST /user", () => {
  it("persisting user with the existing e-mail should return error", async () => {
    const res = await request(app.testServer).post("/user").send({
      name: "Jane",
      email: "john@gmail.com",
      password: "pass111",
      role: "User",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.errorMessage).toEqual("E11000 duplicate key error collection: test.users index: email_1 dup key: { email: \"john@gmail.com\" }");
  });
});

describe("POST /user", () => {
  it("persisting user without a name, email, password or role should return error", async () => {
    const res = await request(app.testServer).post("/user").send({
      name: "",
      email: "",
      password: "",
      role: "",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.errorMessage).toEqual("users validation failed: name: Path `name` is required., email: Path `email` is required., role: Path `role` is required.");
  });
});

describe("PATCH /user/userID", () => {
  it("should update user in DB", async () => {
    // The IDs are dynamic, this is why we should find out the user's ID first.
    const allUsers = await request(app.testServer).get("/user/all/")
    const userID = allUsers.body[0]._id;
    const res =  await request(app.testServer).patch(`/user/${userID}`).send({
      name: "updated",
      email: "updated",
      password: "updated",
      role: "updated"
    });
    // Get the updated item from DB.
    const updated = await request(app.testServer).get(`/user/${userID}`)
    expect(res.statusCode).toEqual(200);
    expect(updated.body.name).toEqual("updated");
    expect(updated.body.email).toEqual("updated");
    expect(updated.body.password).not.toBe(null);
    expect(updated.body.role).toEqual("updated");
  });
});

describe("PATCH /user/userID", () => {
  it("without providing the required fields should return error", async () => {
    // The IDs are dynamic, this is why we should find out the user's ID first.
    const allUsers = await request(app.testServer).get("/user/all/")
    const userID = allUsers.body[0]._id;
    const res =  await request(app.testServer).patch(`/user/${userID}`).send({
      name: "",
      email: "",
      password: "",
      role: ""
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.message.message).toEqual("Validation failed: name: Path `name` is required., email: Path `email` is required., role: Path `role` is required.");
  });
});

describe("DELETE", () => {
  it("should delete user from DB", async () => {
    const allUsers = await request(app.testServer).get("/user/all/")
    const userID = allUsers.body[0]._id;
    const res = await request(app.testServer).delete(`/user/${userID}`);
    expect(res.statusCode).toEqual(200);

    // Checking that the user does not exist.
    const nonExistant = await request(app.testServer).get(`/user/${userID}`);

    expect(nonExistant.text).toEqual("null");
  });
});

describe("POST /user/login", () => {
  it("should log in the user", async () => {
    const res = await request(app.testServer).post("/user/login").send({
      email: "jane@gmail.com",
      password: "pass111",
    });
    expect(res.statusCode).toEqual(200);
    // Just checking the part of the token which remains unchanged (the part 
    // containing the user's ID).
    expect(res.body.token.split('.')[0]).toEqual("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
  });
});