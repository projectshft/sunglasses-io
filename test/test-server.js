let chai = require("chai");
let chaiHttp = require('chai-http');
let server = require("../app/server");

let should =chai.should();
chai.use(chaiHttp);

// TODO: Test GET brands endpoint
describe("/GET brands", () => {
  it("it should GET all the brands", (done) => {
    chai
      .request(server)
      .get("/brands")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        done();
      })
  })
})

