let chai = require("chai");
let chaiHttp = require("chai-http");
let should = chai.should();
chai.use(chaiHttp);
let server = require("../server.js");

describe('/GET brands', () => {
  it("should get all brands", (done) => {
    chai
    .request(server)
    .get('/brands')
    .end((err, res) => {
      res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(0);
          done();
    });
  });
});