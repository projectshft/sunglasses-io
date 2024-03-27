const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../app/server"); // Adjust the path as needed

const should = chai.should();
chai.use(chaiHttp);

// TODO: Write tests for the server

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
});

describe("Login", () => {
  describe("POST /api/login", () => {
    it("should log a user in", (done) => {
      chai
        .request(server)
        .post("/api/login")
        .send({ username: "yellowleopard753", password: "jonjon" })
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.an("object");
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
