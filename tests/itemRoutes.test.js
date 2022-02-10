const app = require("../../shopping-cart-rest-api/app.js"); // DO not forget the <module.exports> line in app.js file.
const request = require("supertest");

describe("GET /item/all", () => {
  it("should fetch 3 items from DB", async () => {
    const res = await request(app.server).get("/item/all");

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(3);
    expect(res.body[0].title).toEqual("Phone XL");
    expect(res.body[1].title).toEqual("Phone Mini");
    expect(res.body[2].title).toEqual("Phone Standard");
  });
});

describe("GET /:itemID", () => {
  it("should fetch the item by its ID", async () => {
    const itemID = "620557369154651ad37d49e6";
    const res = await request(app.server).get(`/item/${itemID}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body._id).toEqual("620557369154651ad37d49e6");
    expect(res.body.title).toEqual("Phone XL");
  });
});

describe("POST", () => {
  it("should persist new item to DB", async () => {
    const res = await request(app.server).post("/item").send({
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
    const itemID = "620557369154651ad37d49e6";
    const res = await request(app.server).patch(`/item/${itemID}`).send({
      title: "updated",
      description: "updated",
      price: 100,
      quantity: 10,
    });
    expect(res.statusCode).toEqual(200);
  });
});

describe("DELETE", () => {
  it("should delete item from DB", async () => {
    const itemID = "620557369154651ad37d49e6";
    const res = await request(app.server).delete(`/item/${itemID}`);
    expect(res.statusCode).toEqual(200);

    // Checking that the item does not exist.
    const nonExistant = await request(app.server).get(`/item/${itemID}`);

    expect(nonExistant.text).toEqual("null");
  });
});

describe("POST /updateQuantity", () => {
  it("should update the quantity of items in DB", async () => {
    const items = [
      {
        _id: "620557369154651ad37d49e7",
        title: "Phone Mini",
        description: "A great phone with one of the best cameras",
        price: 699,
        quantity: 5,
      },
      {
        "_id": "620557369154651ad37d49e8",
        "title": "Phone Standard",
        "price": 299,
        "quantity": 6
      }
    ];
    const res = await request(app.server)
      .post("/item/updateQuantity")
      .send(items);
    expect(res.statusCode).toEqual(200);

    // Checking that update was actually done.
    const phoneMini_ID = "620557369154651ad37d49e7";
    const phoneMini = await request(app.server).get(`/item/${phoneMini_ID}`);
    expect(phoneMini.body.title).toEqual("Phone Mini");
    expect(phoneMini.body.quantity).toEqual(5);

    const phoneStandard_ID = "620557369154651ad37d49e8";
    const phoneStandard = await request(app.server).get(`/item/${phoneStandard_ID}`);
    expect(phoneStandard.body.title).toEqual("Phone Standard");
    expect(phoneStandard.body.quantity).toEqual(6);
  });
});
