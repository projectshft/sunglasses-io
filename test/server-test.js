let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
var fs = require('fs');
let should = chai.should();
let { expect } = chai;
let Brand = require('../app/models/brands');
// mocha test/server-test.js --watch

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
  beforeEach(() => {
    Brand.removeAll();

  });
  
  describe("and an invalid brand id is given", () => {
    describe("the response", () => {
      it("should return a 404 error and state 'no brand with that id found'", done => {
        // arrange
        let brandsList = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf8"))
        brandsList.forEach(element => {
          Brand.addBrand(element)
        });
        const invalidBrandId = 'a';
        // act
        chai
          .request(server)
          .get(`/v1/brands/${invalidBrandId}/products`)
          .end((err, res) => {
            //assert
            res.should.have.status(404);
            //TODO Something to test the error message
            done();
          })
      })
    })
  })

  describe("and a valid brand id is given", () => {
    describe("but the brand has no associated products", () => {
      describe("the response", () => {
        it("should return an empty array", done => {
          // arrange
          done();
        })
      })
    })
    describe("and the brand has products", () => {

    })
  })
})