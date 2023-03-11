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
      .get(`/api/brands`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        done();
      })
  })
})

// TODO: Test GET brands/:id/products endpoint
describe("/GET products in brand", () => {
  it("it should GET all the products given brand id", (done) => {
    let id = 1;
    chai
      .request(server)
      .get(`/api/brands/${1}/products`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array")
        done();
      })
  })
})

// TODO: Test GET brands endpoint
describe("/GET products", () => {
  it("it should GET all the products", (done) => {
    chai
      .request(server)
      .get(`/api/products`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        done();
      })
  })
})

