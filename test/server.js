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
      .get("/brands")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.length.should.be.eq(5)
        done();
      })
  })
});

describe("/GET brands/id/products", () => {
  it("it should GET all products with brand id", done => {
    chai
      .request(server)
      .get("/brands/id/products")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        // expect(res).to.eql({id: , name: })
        done();
      })
  })
});