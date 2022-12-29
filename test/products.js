//import products
let Products = require("../app/models/products");

let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);

describe("Products", () => {
  describe ("/GET brands", () =>{
    it("it should GET all the brands", done =>{
      chai
        .request(server)
        .get("/brands")
        .end((err, req) => {
          res.should.have.status("200");
          res.body.should.be.an("object");
          res.body.length.should.eql(5);
          done();
        })
    })
  })
})