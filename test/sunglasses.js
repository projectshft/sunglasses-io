let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");
const { expect } = require("chai");

let should = chai.should();

chai.use(chaiHttp);

describe("Sunglasses", () => {
  describe("/GET sunglasses", () => {
    it("it should GET all sunglasses", (done) => {
      chai
        .request(server)
        .get("/")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          //res.body.length.should.be.eql(0);
          done();
        });
    });
  });
});
