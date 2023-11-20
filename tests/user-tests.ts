// Type imports
import { User } from "../types/type-definitions";

// Module imports
import chai = require("chai");
import chaiHttp = require("chai-http");
const fs = require("fs");
const server = require("../app/server.ts");

// Define should
chai.should();

// Allow chai to use chaiHttp middleware
chai.use(chaiHttp);

const testUser = () => {
  describe("User", function () {
    describe("GET /api/user", function () {
      it("should return user data if accessToken is valid", function (done) {
        // Load user data
        const data = fs.readFileSync("initial-data/users.json", "utf8");
        const parsedData: User[] = JSON.parse(data);

        // Get user by username
        const username = "yellowleopard753";
        const user = parsedData.find(
          (user: User) => user.login.username == username
        );
        // Object to match
        const responseObject = {
          responseCode: 200,
          responseMessage: user,
        };

        chai
          .request(server)
          .get("/api/user?accessToken=O0WnZSZ8hWlLOLX9")
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(200);
            res.body.should.deep.equal(responseObject);
            done();
          });
      });
      it("should return a 401 error if accessToken is missing from search parameters", function (done) {
        // Object to match
        const responseObject = {
          responseCode: 401,
          responseMessage: "Unauthorized",
        };

        chai
          .request(server)
          .get("/api/user")
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(401);
            res.body.should.deep.equal(responseObject);
            done();
          });
      });
      it("should return a 401 error if accessToken is expired", function (done) {
        // Object to match
        const responseObject = {
          responseCode: 401,
          responseMessage: "Unauthorized",
        };

        chai
          .request(server)
          .get("/api/user?accessToken=zBC4odxxvEiz0iuO")
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(401);
            res.body.should.deep.equal(responseObject);
            done();
          });
      });
      it("should return a 401 error if accessToken is not in access token list", function (done) {
        // Object to match
        const responseObject = {
          responseCode: 401,
          responseMessage: "Unauthorized",
        };

        chai
          .request(server)
          .get("/api/user?accessToken=RHKa5dhXEpa7Uw0K")
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(401);
            res.body.should.deep.equal(responseObject);
            done();
          });
      });
    });
    describe("POST /api/user/login", function () {
      it("should respond with an accessToken if username and password are authenticated", function (done) {
        const requestBody = {
          username: "lazywolf342",
          password: "tucker",
        };

        chai
          .request(server)
          .post("/api/user/login")
          .send(requestBody)
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(200);
            res.body.should.have
              .property("responseMessage")
              .with.property("token")
              .length(16);
            done();
          });
      });
      it("should return a 401 error if username is missing from request body", function (done) {
        const requestBody = {
          password: "tucker",
        };

        chai
          .request(server)
          .post("/api/user/login")
          .send(requestBody)
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(401);
            res.body.should.have
              .property("responseMessage")
              .equal("Unauthorized");
            done();
          });
      });
      it("should return a 401 error if password is missing from request body", function (done) {
        const requestBody = {
          username: "lazywolf342",
        };

        chai
          .request(server)
          .post("/api/user/login")
          .send(requestBody)
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(401);
            res.body.should.have
              .property("responseMessage")
              .equal("Unauthorized");
            done();
          });
      });
      it("should return a 401 error if username does not match username in database", function (done) {
        const requestBody = {
          username: "thisisnotausername",
          password: "password",
        };

        chai
          .request(server)
          .post("/api/user/login")
          .send(requestBody)
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(401);
            res.body.should.have
              .property("responseMessage")
              .equal("Unauthorized");
            done();
          });
      });
      it("should return a 401 error if password does not match password corresponding to username", function (done) {
        const requestBody = {
          username: "lazywolf342",
          password: "wrongpassword",
        };

        chai
          .request(server)
          .post("/api/user/login")
          .send(requestBody)
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(401);
            res.body.should.have
              .property("responseMessage")
              .equal("Unauthorized");
            done();
          });
      });
    });
    describe("GET /api/user/cart", function () {
      it("should return products in user's cart if accessToken is valid", function (done) {
        // Load user data
        const data = fs.readFileSync("initial-data/users.json", "utf8");
        const users: User[] = JSON.parse(data);

        // Get cart contents
        const cart = users[0].cart;

        // Object to match
        const responseObject = {
          responseCode: 200,
          responseMessage: cart,
        };

        chai
          .request(server)
          .get("/api/user/cart?accessToken=O0WnZSZ8hWlLOLX9")
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(200);
            res.body.should.deep.equal(responseObject);
            done();
          });
      });
      it("should return an empty array if user's cart is empty", function (done) {
        // Object to match
        const responseObject = {
          responseCode: 200,
          responseMessage: [],
        };

        chai
          .request(server)
          .get("/api/user/cart?accessToken=eE6AanctxgKg9emy")
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(200);
            res.body.should.deep.equal(responseObject);
            done();
          });
      });
      it("should return a single product from the cart if productId is included in query", function (done) {
        const product = {
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
          quantity: 1,
        };

        // Object to match
        const responseObject = {
          responseCode: 200,
          responseMessage: product,
        };

        chai
          .request(server)
          .get("/api/user/cart?accessToken=O0WnZSZ8hWlLOLX9&productId=1")
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(200);
            res.body.should.deep.equal(responseObject);
            done();
          });
      });
      it("should return a 404 error if productId is not found in cart", function (done) {
        // Object to match
        const responseObject = {
          responseCode: 404,
          responseMessage: "Product not found",
        };

        chai
          .request(server)
          .get("/api/user/cart?accessToken=O0WnZSZ8hWlLOLX9&productId=4")
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(404);
            res.body.should.deep.equal(responseObject);
            done();
          });
      });
      it("should return a 401 error if accessToken is missing from search query", function (done) {
        // Object to match
        const responseObject = {
          responseCode: 401,
          responseMessage: "Unauthorized",
        };

        chai
          .request(server)
          .get("/api/user/cart")
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(401);
            res.body.should.deep.equal(responseObject);
            done();
          });
      });
      it("should return a 401 error if accessToken is expired", function (done) {
        // Object to match
        const responseObject = {
          responseCode: 401,
          responseMessage: "Unauthorized",
        };

        chai
          .request(server)
          .get("/api/user/cart?accessToken=YG9IGRuNKc7fkZlt")
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(401);
            res.body.should.deep.equal(responseObject);
            done();
          });
      });
      it("should return a 401 error if accessToken is not in access token list", function (done) {
        // Object to match
        const responseObject = {
          responseCode: 401,
          responseMessage: "Unauthorized",
        };

        chai
          .request(server)
          .get("/api/user/cart?accessToken=KAXRuelY8ekJpp8X")
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(401);
            res.body.should.deep.equal(responseObject);
            done();
          });
      });
    });
    describe("POST /api/user/cart", function () {
      it("should add product matching productId in query to cart", function (done) {
        // Object to match
        const responseObject = {
          responseCode: 200,
          responseMessage: "Product successfully added to cart",
        };

        chai
          .request(server)
          .post("/api/user/cart?accessToken=O0WnZSZ8hWlLOLX9&productId=11")
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(200);
            res.body.should.deep.equal(responseObject);
            done();
          });
      });
      it("should not add product if product already exists in cart", function (done) {
        // Object to match
        const responseObject = {
          responseCode: 200,
          responseMessage:
            "Product already exists in user's cart. Nothing changed",
        };

        chai
          .request(server)
          .post("/api/user/cart?accessToken=O0WnZSZ8hWlLOLX9&productId=1")
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(200);
            res.body.should.deep.equal(responseObject);
            done();
          });
      });
      it("should return 401 error if accessToken is missing from search query", function (done) {
        // Object to match
        const responseObject = {
          responseCode: 401,
          responseMessage: "Unauthorized",
        };

        chai
          .request(server)
          .post("/api/user/cart")
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(401);
            res.body.should.deep.equal(responseObject);
            done();
          });
      });
      it("should return a 401 error if accessToken is expired", function (done) {
        // Object to match
        const responseObject = {
          responseCode: 401,
          responseMessage: "Unauthorized",
        };

        chai
          .request(server)
          .post("/api/user/cart?accessToken=YG9IGRuNKc7fkZlt")
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(401);
            res.body.should.deep.equal(responseObject);
            done();
          });
      });
      it("should return a 401 error if accessToken is not in access token list", function (done) {
        // Object to match
        const responseObject = {
          responseCode: 401,
          responseMessage: "Unauthorized",
        };

        chai
          .request(server)
          .post("/api/user/cart?accessToken=KAXRuelY8ekJpp8X")
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(401);
            res.body.should.deep.equal(responseObject);
            done();
          });
      });
      it("should return a 400 error if productId is missing from search query", function (done) {
        // Object to match
        const responseObject = {
          responseCode: 400,
          responseMessage: "Bad request - productId missing",
        };

        chai
          .request(server)
          .post("/api/user/cart?accessToken=O0WnZSZ8hWlLOLX9")
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(400);
            res.body.should.deep.equal(responseObject);
            done();
          });
      });
      it("should return a 404 error if productId is not found", function (done) {
        // Object to match
        const responseObject = {
          responseCode: 404,
          responseMessage: "Product not found",
        };

        chai
          .request(server)
          .post("/api/user/cart?accessToken=O0WnZSZ8hWlLOLX9&productId=10120")
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(404);
            res.body.should.deep.equal(responseObject);
            done();
          });
      });
    });
    describe("DELETE /api/user/cart/:productId", function () {
      it("should delete item matching productId from user's cart", function (done) {
        // Object to match
        const responseObject = {
          responseCode: 200,
          responseMessage: "Product deleted from cart",
        };

        chai
          .request(server)
          .delete("/api/user/cart/1?accessToken=O0WnZSZ8hWlLOLX9")
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(200);
            res.body.should.deep.equal(responseObject);
            done();
          });
      });
      it("should return a 401 error if accessToken is missing from search query", function (done) {
        // Object to match
        const responseObject = {
          responseCode: 401,
          responseMessage: "Unauthorized",
        };

        chai
          .request(server)
          .post("/api/user/cart/1")
          .end((err, res) => {
            if (err) {
              done(err);
            }
            res.should.have.status(401);
            res.body.should.deep.equal(responseObject);
            done();
          });
      });
      // should return a 401 error if accessToken is missing from search query
      // should return a 401 error if accessToken is expired
      // should return a 401 error if accessToken is not in access token list
      // should return a 400 error if productId is missing from search query
      // should return a 404 error if the product does not exist in user's cart
      // should return a 404 error if productId does not exist
    });
  });
};

export type TestUser = typeof testUser;

module.exports = testUser;