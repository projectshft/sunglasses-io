let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let fs = require("fs");

let should = chai.should();

chai.use(chaiHttp);

let brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf-8"));
let products = JSON.parse(fs.readFileSync("./initial-data/products.json", "utf-8"));

describe("Brands", () => {
  describe("/GET brands", () => {
    it("it should GET all the brands", (done) => {
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

  describe("/GET products from a selected brand using products' categoryId", () => {
    it("it should GET all the products in a certain brand ", (done) => {
      chai.request(server)
      .get(`/api/brands/${categoryId}/products`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        done();
      });
    });
  });
});

describe("Products", () => {
  describe("/GET products", () => {
    it("it should GET all the products", (done) => {
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