let Sunglasses = require("../app/models/sunglasses-io");

let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);

describe("Sunglasses", () => {
  describe("/GET brands", () => {
    it("should get all the brands", (done) => {
      chai
        .request(server)
        .get("/brands")
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          done();
        });
    });
  });

  describe("/GET products", () => {
    it("should get all the products", (done) => {
      chai
        .request(server)
        .get("/brands")
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          done();
        });
    });
  });
});
