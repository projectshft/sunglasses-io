let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
var fs = require('fs');
let should = chai.should();
let { expect } = chai;
let Brand = require('../app/models/brands');
// mocha server-test.js --watch

chai.use(chaiHttp);

describe("When a brands request is received", () => {
  beforeEach(() => {
    Brand.removeAll();
  });
  describe("the response", () => {
    it("should return the current list of brands", done => {
      //arrange
      let brandsList = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf8"));
      brandsList.forEach(element => {
        Brand.addBrand(element)
      });
      //act
      chai
        .request(server)
        .get('/v1/brands')
        .end((err, res) => {
          //assert
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.should.have.lengthOf(brandsList.length);
          res.body.should.deep.equal(brandsList);
          done();
        })
    })
  })
})

describe("When a request for the products of a certain brand is received", () => {
  describe("and an invalid brand id is given", () => {

  })
  describe("and a valid brand id is given", () => {
    describe("but the brand has no associated products", () => {

    })
    describe("and the brand has products", () => {
      
    })
  })
})