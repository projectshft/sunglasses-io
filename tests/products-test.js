let products = require("/initial-data/products.json");

let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server");

let should = chai.should();

chai.use(chaiHttp); 

beforeEach(() => {
  products.removeAll();
});

describe("products", () => {
  describe("/GET product", () => {
    it("it should GET all of the products", (done) => {
      chai
        .request(server)
        .get("/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(0);
          done();
        });
    });
  });
});