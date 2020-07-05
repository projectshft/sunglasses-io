// let Brand = require('../app/models/brand');

const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;
const assert = chai.assert;
let should = chai.should();

chai.use(chaiHTTP);
//chai.use(require("chai-sorted"));

// GET ALL BRANDS
describe('/GET brands', () => {
  it('should GET all the brands specified', done => {
    chai
      .request(server)
      .get('/brands')
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(5);
        done();
      });
  });


  it('should only return brands specified by the query string', done => {
    chai
      .request(server)
      .get('/brands?query=Oakley') // get lowerCase functionality
      .end((err, res) => {
 //       expect(err).to.be.null;
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(1);
        done();
      });
  });

  it("returns all brands if query is missing", done => {
    chai
      .request(server)
      //property doesn't exist
      .get("/brands?query=")
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(5);
        done();
      });
    });

  // it("returns an error message if no brands match the search", done =>{
  //   chai
  //   .request(server)
  //   //property doesn't exist
  //   .get("/brands?query=adsfasd")
  //   .end((err, res) => {
  //     res.should.have.status(404);
  //     done();
  //   });
  // });

});

// GET ALL PRODUCTS MATCHING BRAND ID
describe('/GET brands/:id/products', () => {
  it.only('should get all products by brand id specified', done => {
    chai
      .request(server)
      .get('/brands/1/products')
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(3);
        done();
      });
    });
});