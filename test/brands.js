let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);


describe("Brands", () => {
  describe("/GET brands", () => {
    it("it should GET all the brands", (done) => {
      chai
        .request(server)
        .get("/api/brands")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(5);
          done();
        });
    });
  });

  describe("/GET brands/:id/products", () => {
    it("it should GET all the products under the brand", (done) => {
      chai
        .request(server)
        .get("/api/brands/1/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(3);
          done();
        });
    });

    it("it should give error with empty products when there are no products under the brand id", (done) => {
      chai
        .request(server)
        .get("/api/brands/-2/products")
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(0);
          done();
        });
    });
  });
});

//  Any brand that does exist should show up
//  Any brand that does not exist should throw an error
//  Any product that does exist should show up
//  Any product that does not exist should throw an error
//  If username and/or password is not valid, should throw an error
//  If user is not logged in, there should be an error if they try to get the cart
//  You shouldn't be able to add to the cart if you're not logged in
//  
