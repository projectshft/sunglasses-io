let chai = require("chai");
const should = chai.should();
const expect = chai.expect;
let chaiHttp = require("chai-http");
const server = require('../app/server');

chai.use(chaiHttp);

describe("brands", function(){
  describe("/GET brands", function(){
    it("should GET all the brands", function(done){
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

describe("sunglasses-search", function(){
  describe("/GET sunglasses/search", function(){
    it("should Get all of the sunglasses that match the search query", function(done){
      chai
        .request(server)
        .get("/sunglasses/search?name=Superglasses")
        .end(function(err, res){
          res.body.should.be.an("array");
          done();
        })
    })
  })
})

// describe("user/login", function(){
//   describe("/GET user/login")
// })