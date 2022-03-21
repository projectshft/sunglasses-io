const { expect } = require("chai");
let chai = require("chai");
const should = chai.should();
let chaiHttp = require("chai-http");
const server = require('../app/server');

chai.use(chaiHttp);

describe("brands", function(){
  describe("/GET brands", function(){
    it("it should GET all the brands", function(done){
      chai
        .request(server)
        .get("/brands")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });
});

// describe("sunglasses-search", function(){

// })