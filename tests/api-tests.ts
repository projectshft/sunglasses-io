// Type imports
import { ProductObject, User, AccessToken } from "../types/type-definitions";

import chai = require("chai");
import { expect } from "chai";
import chaiHttp = require("chai-http");
const fs = require("fs");
const server = require("../app/server.ts");
const accessTokensList: AccessToken[] =
  require("../app/login-methods.ts").accessTokensList;

// Define should
chai.should();

// Allow chai to use chaiHttp middleware
chai.use(chaiHttp);

// Test server starts up
describe("/api/", function () {
  it("should start the server", function (done) {
    chai
      .request(server)
      .get("/api/")
      .end((err, res) => {
        if (err) {
          done(err);
        }
        res.should.have.status(200);
        res.body.should.equal("Server is up and running");
        done();
      });
  });
});

// Test sunglasses routes
describe("Sunglasses brands and products", function () {
  describe("GET /api/sunglasses/brands", function () {
    it("should return an array of brand objects", function (done) {
      const responseObject = {
        responseCode: 200,
        responseMessage: [
          { id: "1", name: "Oakley" },
          { id: "2", name: "Ray Ban" },
          { id: "3", name: "Levi's" },
          { id: "4", name: "DKNY" },
          { id: "5", name: "Burberry" },
        ],
      };

      chai
        .request(server)
        .get("/api/sunglasses/brands")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.deep.equal(responseObject);
          done();
        });
    });
  });
  describe("GET /api/sunglasses/brands/:brandId", function () {
    it("should return the brand object matching the id passed in the path", function (done) {
      const responseObject = {
        responseCode: 200,
        responseMessage: {
          id: "1",
          name: "Oakley",
        },
      };
      chai
        .request(server)
        .get("/api/sunglasses/brands/1")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.body.should.deep.equal(responseObject);
          done();
        });
    });
    it("should return a 400 error if the id is incorrectly formatted", function (done) {
      const responseObject = {
        responseCode: 400,
        responseMessage: "Bad request",
      };

      chai
        .request(server)
        .get("/api/sunglasses/brands/a")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(400);
          res.body.should.deep.equal(responseObject);
          done();
        });
    });
    it("should return a 404 error if the id is not found", function (done) {
      const responseObject = {
        responseCode: 404,
        responseMessage: "Brand not found",
      };

      chai
        .request(server)
        .get("/api/sunglasses/brands/100")
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
  describe("GET /api/sunglasses/brands/:brandId/products", function () {
    it("should return an array of products with categoryIds matching the brandId", function (done) {
      // Read and parse product data
      const data = fs.readFileSync("initial-data/products.json", "utf8");
      const parsedData = JSON.parse(data);

      const brandId = "1";

      const matchingProducts: ProductObject[] = parsedData.filter(
        (item: ProductObject) => item.categoryId == brandId
      );

      // Object to match
      const responseObject = {
        responseCode: 200,
        responseMessage: matchingProducts,
      };

      chai
        .request(server)
        .get("/api/sunglasses/brands/1/products")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.body.should.deep.equal(responseObject);
          done();
        });
    });
    it("should return a 400 error if brandId is incorrectly formatted", function (done) {
      // Object to match
      const responseObject = {
        responseCode: 400,
        responseMessage: "Bad request",
      };

      chai
        .request(server)
        .get("/api/sunglasses/brands/a/products")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(400);
          res.body.should.deep.equal(responseObject);
          done();
        });
    });
    it("should return an empty array if no products with categoryIds matching the brandId are found", function (done) {
      // Object to match
      const responseObject = {
        responseCode: 200,
        responseMessage: [],
      };

      chai
        .request(server)
        .get("/api/sunglasses/brands/111/products")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.body.should.deep.equal(responseObject);
          done();
        });
    });
  });
  describe("GET /api/sunglasses/products", function () {
    it("should return all products if no limit or search queries are present", function (done) {
      // Read and parse product data
      const data = fs.readFileSync("initial-data/products.json", "utf8");
      const parsedData = JSON.parse(data);

      // Object to match
      const responseObject = {
        responseCode: 200,
        responseMessage: parsedData,
      };

      chai
        .request(server)
        .get("/api/sunglasses/products")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.body.should.deep.equal(responseObject);
          done();
        });
    });
    it("should return an array of products with length <= limit if limit query is present", function (done) {
      // Read and parse product data
      const data = fs.readFileSync("initial-data/products.json", "utf8");
      const parsedData = JSON.parse(data);

      // Object to match
      const responseObject = {
        responseCode: 200,
        responseMessage: parsedData.slice(0, 3),
      };

      chai
        .request(server)
        .get("/api/sunglasses/products?limit=3")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.body.should.deep.equal(responseObject);
          done();
        });
    });
    it("should return products with descriptions matching the search query", function (done) {
      // Read and parse product data
      const data = fs.readFileSync("initial-data/products.json", "utf8");
      const parsedData = JSON.parse(data);

      // Object to match
      const responseObject = {
        responseCode: 200,
        responseMessage: parsedData.slice(0, 4),
      };

      chai
        .request(server)
        .get("/api/sunglasses/products?search=the best glasses in the world")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.body.should.deep.equal(responseObject);
          done();
        });
    });
    it("should return all products if search query is empty", function (done) {
      // Read and parse product data
      const data = fs.readFileSync("initial-data/products.json", "utf8");
      const parsedData = JSON.parse(data);

      // Object to match
      const responseObject = {
        responseCode: 200,
        responseMessage: parsedData,
      };

      chai
        .request(server)
        .get("/api/sunglasses/products?search=")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.body.should.deep.equal(responseObject);
          done();
        });
    });
    it("should return all products if limit query is empty", function (done) {
      // Read and parse product data
      const data = fs.readFileSync("initial-data/products.json", "utf8");
      const parsedData = JSON.parse(data);

      // Object to match
      const responseObject = {
        responseCode: 200,
        responseMessage: parsedData,
      };

      chai
        .request(server)
        .get("/api/sunglasses/products?limit=")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.body.should.deep.equal(responseObject);
          done();
        });
    });
    it("should return a 400 error if limit query is NaN", function (done) {
      const responseObject = {
        responseCode: 400,
        responseMessage: "Bad request",
      };

      chai
        .request(server)
        .get("/api/sunglasses/products?limit=a")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(400);
          res.body.should.deep.equal(responseObject);
          done();
        });
    });
    it("should return an empty array if no products are found matching the search query", function (done) {
      const responseObject = {
        responseCode: 200,
        responseMessage: [],
      };

      chai
        .request(server)
        .get("/api/sunglasses/products?search=abcdefghijklmnopqrstuvwxyz")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.body.should.deep.equal(responseObject);
          done();
        });
    });
  });
  describe("GET /api/sunglasses/products/:productId", function () {
    it("should return product matching id", function (done) {
      // Read and parse product data
      const data = fs.readFileSync("initial-data/products.json", "utf8");
      const parsedData = JSON.parse(data);

      // Get product by id
      const id = "1";
      const product: ProductObject = parsedData.find(
        (item: ProductObject) => item.id == id
      );

      // Object to match
      const responseObject = {
        responseCode: 200,
        responseMessage: product,
      };

      chai
        .request(server)
        .get("/api/sunglasses/products/1")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(200);
          res.body.should.deep.equal(responseObject);
          done();
        });
    });
    it("should return a 400 error if id is incorrectly formatted", function (done) {
      // Object to match
      const responseObject = {
        responseCode: 400,
        responseMessage: "Bad request",
      };

      chai
        .request(server)
        .get("/api/sunglasses/products/a")
        .end((err, res) => {
          if (err) {
            done(err);
          }
          res.should.have.status(400);
          res.body.should.deep.equal(responseObject);
          done();
        });
    });
    it("should return a 404 error if the id is not found", function (done) {
      // Object to match
      const responseObject = {
        responseCode: 404,
        responseMessage: "Product not found",
      };

      chai
        .request(server)
        .get("/api/sunglasses/products/111")
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
});

// User
describe("User", function () {
  describe("GET /api/user", function () {
    it("should return user data if accessToken is valid", function (done) {
      // Load user data
      const data = fs.readFileSync("initial-data/users.json", "utf8");
      const parsedData = JSON.parse(data);

      // Get user by username
      const username = "yellowleopard753";
      const user: User = parsedData.find(
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
    // should return 401 error if username is missing from request body
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
        password: "password"
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
        password: "wrongpassword"
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
});

// Tests for login-methods:

// updateAccessToken
// "should update the date string held by accessToken.lastUpdated

// login function
// should assign an old accessToken if one already exists and is not expired
// should assign a new accessToken if old one does not exist or is expired
