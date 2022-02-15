const app = require("../tests/configs/server.js"); // DO not forget the <module.exports> line in app.js file.
const request = require("supertest");
const mongoDB = require("./configs/mongoDB.js");
const items = require('../productsCollection.json')
const Item = require("../models/Item"); // Mongoose Schema
const { response } = require("express");

beforeAll(() => {
  mongoDB.connectDB;
  Item.insertMany(items);
});

afterAll(() => {
  app.listener.close();
});


describe("GET /item/all", () => {
  it("it should fetch 3 items from DB", async () => {  
    const res = await request(app.testServer).get("/item/all/")

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(3);
    expect(res.body[0].title).toEqual("Phone XL");
    expect(res.body[1].title).toEqual("Phone Mini");
    expect(res.body[2].title).toEqual("Phone Standard");
  });
});

describe("GET /item/admin/all", () => {
  it("it should fetch 3 items from DB", async () => {  
    /* The Bearer token is obtained from the "/login" endpoint in
    userRoutes.js. If the login is successful the Bearer token will 
    be available in the response. We can use the bearer token for 
    the authentication */
    const res = await request(app.testServer).get("/item/admin/all/").set({Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiI2MjBjMDJiNzU4Njk5YzU0YzhkMTQ4OTAiLCJpYXQiOjE2NDQ5NTQzMTYsImV4cCI6MTY0NzU0NjMxNn0.DKCHQyrL_UgUF3TuRsVV_IxJ6G2dUpFVkAP7pDpRgzI"});

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(3);
    expect(res.body[0].title).toEqual("Phone XL");
    expect(res.body[1].title).toEqual("Phone Mini");
    expect(res.body[2].title).toEqual("Phone Standard");
  });
});

describe("GET /item/admin/all", () => {
  it("should return error when not authorized", async () => {  
    const res = await request(app.testServer).get("/item/admin/all/");
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual("Authentication error. No token.");
  });
});

describe("GET /:itemID", () => {
  it("should fetch the item by its ID", async () => {
    // The IDs are dynamic, this is why we should find out the item's ID first.
    const allItems = await request(app.testServer).get("/item/all/")
    const itemID = allItems.body[0]._id;
    const res = await request(app.testServer).get(`/item/${itemID}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body._id).toEqual(itemID);
    expect(res.body.title).toEqual("Phone XL");
  });
});

describe("POST", () => {
  it("should persist new item to DB", async () => {
    const res = await request(app.testServer).post("/item").send({
      title: "Telephone",
      description: "Good one",
      price: 899,
      quantity: 1,
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.title).toEqual("Telephone");
    expect(res.body.description).toEqual("Good one");
    expect(res.body.price).toEqual(899);
    expect(res.body.quantity).toEqual(1);
    expect(res.body._id).not.toBe(null);
  });
});

describe("PATCH", () => {
  it("should update item in DB", async () => {
    // The IDs are dynamic, this is why we should find out the item's ID first.
    const allItems = await request(app.testServer).get("/item/all/")
    const itemID = allItems.body[0]._id;
    const res =  await request(app.testServer).patch(`/item/${itemID}`).send({
      title: "updated",
      description: "updated",
      price: 100,
      quantity: 10,
    });
    // Get the updated item from DB.
    const updated = await request(app.testServer).get(`/item/${itemID}`)
    expect(res.statusCode).toEqual(200);
    expect(updated.body.title).toEqual("updated");
    expect(updated.body.description).toEqual("updated");
    expect(updated.body.price).toEqual(100);
    expect(updated.body.quantity).toEqual(10);
  });
});

describe("PATCH", () => {
  it("should update item in DB", async () => {
    // The IDs are dynamic, this is why we should find out the item's ID first.
    const allItems = await request(app.testServer).get("/item/all/")
    const itemID = allItems.body[0]._id;
    const res =  await request(app.testServer).patch(`/item/${itemID}`).send({
      title: "updated",
      description: "updated",
      price: 100,
      quantity: 10,
    });
    // Get the updated item from DB.
    const updated = await request(app.testServer).get(`/item/${itemID}`)
    expect(res.statusCode).toEqual(200);
    expect(updated.body.title).toEqual("updated");
    expect(updated.body.description).toEqual("updated");
    expect(updated.body.price).toEqual(100);
    expect(updated.body.quantity).toEqual(10);
  });
});

describe("DELETE", () => {
  it("should delete item from DB", async () => {
    const allItems = await request(app.testServer).get("/item/all/")
    const itemID = allItems.body[0]._id;
    const res = await request(app.testServer).delete(`/item/${itemID}`);
    expect(res.statusCode).toEqual(200);

    // Checking that the item does not exist.
    const nonExistant = await request(app.testServer).get(`/item/${itemID}`);

    expect(nonExistant.text).toEqual("null");
  });
});

describe("POST /updateQuantity", () => {
  it("should update the quantity of items in DB", async () => {
    let allItems = await request(app.testServer).get("/item/all/")
    const items = [
      {
        _id: allItems.body[0]._id, 
        title: "Phone Mini",
        description: "A great phone with one of the best cameras",
        price: 699,
        quantity: 5,
      },
      {
        _id: allItems.body[1]._id, 
        title: "Phone Standard",
        price: 299,
        quantity: 6
      }
    ];
    const res = await request(app.testServer)
      .post("/item/updateQuantity")
      .send(items);
    expect(res.statusCode).toEqual(200);

    // Checking that update was actually done.
    allItems = await request(app.testServer).get("/item/all/")
    const phoneMini = allItems.body[0];
    expect(phoneMini.title).toEqual("Phone Mini");
    expect(phoneMini.quantity).toEqual(5);

    const phoneStandard = allItems.body[1];
    expect(phoneStandard.title).toEqual("Phone Standard");
    expect(phoneStandard.quantity).toEqual(6);
  });
});
