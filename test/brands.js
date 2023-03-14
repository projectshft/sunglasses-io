
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);

describe('/GET brands', () => {
  it("it should GET all of the brands", done => {
    chai
    .request(server)
    .get('/brands')
    .end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.an('array');
      res.body.length.should.be.eql(0);
      done();
    });
  });
});

