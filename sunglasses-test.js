let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("./app/server");
const { expect } = require("chai");

let should = chai.should();

chai.use(chaiHttp);

describe("brands", () => {
  describe("/GET brands", () => {
    it("should GET all the brands", (done) => {
      chai
        .request(server)
        .get("/brands")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(5);
          done();
        });
    });
  });
});