let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

chai.should();
chai.use(chaiHttp);

describe("users", () => {
  describe("/GET users", () => {
    it("it should GET all of the users", (done) => {
      chai
        .request(server)
        .get("/api/users")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.above(0);
          done();
        });
    });
  });
});