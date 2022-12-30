//import products
let Products = require("../app/models/products");

let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server.js");

let should = chai.should();

chai.use(chaiHttp);

describe("Products", () => {
  describe ("/GET products", () =>{
    it("it should GET all the products", done => {
      chai
        .request(server)
        .get("/v1/products")
        .end((err, res) => {
          res.should.have.a.status("200");
          res.body.should.be.an("array");
          res.body.length.should.eql(11);
          done();
        })
    })
  })
})