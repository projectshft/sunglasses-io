let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");
var fs = require("fs");

let should = chai.should();

chai.use(chaiHttp);

describe("Sunglasses.io", () => {
  let token;
  let user = { username: "yellowleopard753", password: "jonjon" };

  before((done) => {
    chai
      .request(server)
      .post(`/api/login`)
      .set("content-type", "application/json")
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        token = res.body;
        done();
      });
  });

  describe("When requesting all the brands", () => {
    it("should list all the brands in the store", (done) => {
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

  describe("When requesting all products from a specific brand", () => {
    it("should return a list of all products from a specific brand", (done) => {
      chai
        .request(server)
        .get("/api/brands/1/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.every((product) => product.categoryId == 1);
          done();
        });
    });

    it("should return an error if the brand requested doesn't exist", (done) => {
      let brands = [];

      fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
        if (error) throw error;
        brands = JSON.parse(data);
      });

      const invalidBrandId = () => {
        let randomNumber = Math.random();

        while (brands.some((brand) => brand.id === randomNumber)) {
          randomNumber += 100;
        }

        return randomNumber;
      };

      chai
        .request(server)
        .get(`/api/brands/${invalidBrandId()}/products`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe("When requesting all products from the store", () => {
    it("should return a list of all products from the store", (done) => {
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

  describe("When requesting to login", () => {
    it("should return an error if login credentials are incorrect", (done) => {
      chai
        .request(server)
        .post(`/api/login`)
        .set("content-type", "application/json")
        .send({ username: "invalidUsername", password: "invalidPassword" })
        .end((err, res) => {
          res.should.have.status(401, "Invalid username or password");
          done();
        });
    });

    it("should provide an access token if login credentials are valid", (done) => {
      chai
        .request(server)
        .post(`/api/login`)
        .set("content-type", "application/json")
        .send(user)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("string");
          res.body.length.should.be.eql(16);
          done();
        });
    });
  });

  describe("When requesting the items from a user's cart", () => {
    it("should return an error if the user is not logged in", (done) => {
      chai
        .request(server)
        .get("/api/me/cart")
        .query({ accessToken: "invalidToken" })
        .end((err, res) => {
          res.should.have.status(401, "You must be logged in to view the cart");
          done();
        });
    });

    it("should return a list of products from the user's cart", (done) => {
      chai
        .request(server)
        .get("/api/me/cart")
        .query({ accessToken: token })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });
});
