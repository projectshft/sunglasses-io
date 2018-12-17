const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;
const assert = chai.assert;

let should = chai.should()

chai.use(chaiHttp);
chai.use(require("chai-sorted"));

describe('/Get Brands', () => {
    it.only('should GET all the brands', done => {
      chai.request(server)
      .get('/api/brands')
      .end((err, res) => {
      done();
    });
})
})

describe('/Get Products', () => {
    it.only('Should Get all of the Products', done => {
      chai.request(server)
      .get('api/products')
      .end((err,res) => {
      done();
      })
    })
})