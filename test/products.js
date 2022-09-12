let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);

describe("Products", () => {
  describe("/GET products", () => {
    it("it should GET all the products", (done) => {
      chai
        .request(server)
        .get("/v1/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body[0].should.have.property("id");
          res.body[0].should.have.property("categoryId");
          res.body[0].should.have.property("name");
          res.body[0].should.have.property("description");
          res.body[0].should.have.property("price");
          res.body[0].should.have.property("imageUrls");
          done();
        });
    });
    it("it should return an error if product name is used instead of products", (done) => {
      chai
        .request(server)
        .get("/v1/:productName")
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
});
