let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);

describe("Brands", () => {
  describe("/GET brands", () => {
    it("it should GET all the brands", (done) => {
      chai
        .request(server)
        .get("/v1/brands")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body[0].should.have.property("id");
          res.body[0].should.have.property("name");
          done();
        });
    });
  });
  describe("/GET brand by id", () => {
    it("it should GET specified brand of products", (done) => {
      let id = "1";
      chai
        .request(server)
        .get(`/v1/brands/${id}/products`)
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
  });
});
