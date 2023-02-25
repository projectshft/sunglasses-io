let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let fs = require("fs");

let should = chai.should();

chai.use(chaiHttp);

describe("Brands", () => {
  describe("/GET brands", () => {
    it("it should GET all the brands", (done) => {
      let brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf-8"));
      chai.request(server)
      .get("/api/brands")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.should.be.eql(brands);
        done();
      });
    });
  });
});

describe("Products", () => {
  describe("/GET products", () => {
    it("it should GET all the products", (done) => {
      let products = JSON.parse(fs.readFileSync("./initial-data/products.json", "utf-8"));
      chai.request(server)
      .get("/api/products")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.should.be.eql(products);
        done();
      });
    });
  });
});