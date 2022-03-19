let chai = require("chai");
let chaiHttp = require("chai-http");
const server = require('../app/server');

chai.use(chaiHttp);

describe("Brands", () => {
  describe("/GET brands", () => {
    it("it should GET all the brands", (done) => {
      chai
        .request(server)
        .get("/sunglasses{brands}")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("string");
          done();
        });
    });
  });
});