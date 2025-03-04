const chai = require("chai");
const jwt = require("jsonwebtoken");
const chaiHttp = require("chai-http");
const server = require("../app/server");
require("dotenv").config();
const JWT_KEY = process.env.SECRET_KEY || "84345512";
const token = jwt.sign({ cart: [] }, JWT_KEY, { expiresIn: "30m" });

const should = chai.should();
const expect = chai.expect;
chai.use(chaiHttp);

describe("Brands", () => {
  describe("/GET brands", () => {
    it("should GET an array of brands", (done) => {
      chai
        .request(server)
        .get("/api/brands")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });
  describe("/GET products", () => {
    it("should GET all products", (done) => {
      chai
        .request(server)
        .get("/api/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });
  describe("/GET brands/:id/products", () => {
    it("should GET all products of specified brand", (done) => {
      chai
        .request(server)
        .get("/api/brands/1/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });
});

describe("Login", () => {
  describe("/POST login", () => {
    it("should login successfully with correct credentials", (done) => {
      const loginCreds = {
        username: "yellowleopard753",
        password: "jonjon",
      };

      chai
        .request(server)
        .post("/api/login")
        .send(loginCreds)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("string");
          done();
        });
    });
    it("should fail if credentials are incorrect", (done) => {
      const loginCreds = {
        username: "incorrect",
        password: "wrongPass",
      };

      chai
        .request(server)
        .post("/api/login")
        .send(loginCreds)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.have.property("error");
          done();
        });
    });
    it("should fail if a username is not entered", (done) => {
      const loginCreds = {
        password: "jonjon",
      };

      chai
        .request(server)
        .post("/api/login")
        .send(loginCreds)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property("error");
          done();
        });
    });
    it("should fail if a password is not entered", (done) => {
      const loginCreds = {
        username: "yellowleopard753",
      };

      chai
        .request(server)
        .post("/api/login")
        .send(loginCreds)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property("error");
          done();
        });
    });
  });
});

describe("Cart", () => {
  describe("/GET me/cart", () => {
    it("should return a cart array", (done) => {
      chai
        .request(server)
        .get("/api/me/cart")
        .set("Authorization", `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });
  describe("/POST me/cart", () => {
    it("should add an item to the cart", (done) => {
      const item = {
        id: "1",
        categoryId: "1",
        name: "Superglasses",
        description: "The best glasses in the world",
        price: 150,
        imageUrls: [
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
        ],
      };
      chai
        .request(server)
        .post("/api/me/cart")
        .set("Authorization", `Bearer ${token}`)
        .send(item)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });
  describe("/POST me/cart/:productId", () => {
    it("should change the quantity of an item in the cart or add the item to the cart with the specified quantity if it does not exist", (done) => {
      const productId = "1";
      const newQuantity = 5;

      chai
        .request(server)
        .post(`/api/me/cart/${productId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ quantity: newQuantity })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.have.property("id", productId);
          res.body.should.have.property("quantity", newQuantity);
          done();
        });
    });
  });
  describe("/DELETE me/cart/:productId", () => {
    it("should remove the specified item from the cart or return the cart if the item does not exist", (done) => {
      const productId = "1";

      chai
        .request(server)
        .delete(`/api/me/cart/${productId}`)
        .set("Authorization", `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          expect(res.body.find((item) => item.id === productId)).to.be
            .undefined;
          done();
        });
    });
  });
});
