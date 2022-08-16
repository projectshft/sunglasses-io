let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);

describe("GET /api/products", () => {
  it("should GET all products", (done) => {
    chai
      .request(server)
      .get("/api/products")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.length.should.eql(11);
        done();
      });
  });
});

describe("GET /api/brands", () => {
  it("should GET all brands", (done) => {
    chai
      .request(server)
      .get("/api/brands")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.length.should.eql(5);
        done();
      });
  });
});

describe("GET /api/brands/:id/products", () => {
  it("should GET all products of given brand", (done) => {
    chai
      .request(server)
      .get("/api/brands/1/products")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.length.should.eql(3);
        done();
      });
  });
});

describe("POST /api/login", () => {
  it("should POST user credentials", (done) => {
    const userCredentials = {
      "username": "greenlion235",
      "password": "waters"
    }
    chai
      .request(server)
      .post("/api/login")
      .send(userCredentials)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('username');
        res.body.should.have.property('lastUpdated');
        res.body.should.have.property('token');
        done();
      });
  });
});