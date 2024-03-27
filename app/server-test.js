const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("./server");

const should = chai.should();
chai.use(chaiHttp);

// Getting all the brands
describe("Brands", () => {
  describe("/api/brands", () => {
    it("should GET all of the brands", (done) => {
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

  // Getting all the products
  describe("Products", () => {
    describe("/api/products", () => {
      it("should GET all of the products", (done) => {
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
    // Getting product by id
    describe("/api/brands/:id/products", () => {
      it("should GET product based on id", (done) => {
        let id = 1;
        chai
          .request(server)
          .get(`/api/brands/${id}/products`)
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      it("should not GET product if no id is found", (done) => {
        let id = 20;
        chai
          .request(server)
          .get(`/api/brands/${id}/products`)
          .end((err, res) => {
            res.should.have.status(404);
            done();
          });
      });
    });
  });
});

// Logging a user in
describe("Login", () => {
  describe("POST /api/login", () => {
    it("should log a user in", (done) => {
      const user = { username: "yellowleopard753", password: "jonjon" };
      chai
        .request(server)
        .post("/api/login")
        .send(user)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.an("object");
          done();
        });
    });
    it("should return error if username or password is incorrect", (done) => {
      const user = { username: "redtiger123", password: "roar" };
      chai
        .request(server)
        .post("/api/login")
        .send(user)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});

describe("Cart", () => {
  // describe("/GET cart", () => {
  //   it("should only get cart if logged in", (done) => {
  //     chai
  //       .request(server)
  //       .get("api/me/cart")
  //       .end((err, res) => {
  //         res.should.have.status(401);
  //         done();
  //       });
  //   });
  // });
});
