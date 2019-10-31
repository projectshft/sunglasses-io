let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();
let expect = chai.expect;


chai.use(chaiHttp);

describe("/GET brands", () => {
  it("it should GET all of the brands", done => {
    chai
      .request(server)
      .get("/api/brands")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.should.have.property("id");
        res.body.should.have.property("name");
        done();
      })
  })
});