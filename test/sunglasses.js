const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;
const assert = chai.assert;

let should = chai.should();

chai.use(chaiHTTP);
chai.use(require("chai-sorted"));

describe('Brands', () => {
  describe('/Get Brands', () => {
    it('it should GET all the brands', (done =>{
      chai.request(server)
        .get('/api/brands')
        .end((err, res) => {
          done()
        })
    }))
  })
  describe('/')
  })
  describe('Users', () => {
    describe('/Get Login', () => {
      it('it should access LOGIN profile', (done => {
        chai.request(server)
        .get('/api/login')
        .end((err, res) => {
          res.should.have.status(200);
          res.should
          done()
        })
      }))
    })
  })
