let Brands = require('../app/models/brands-model');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

beforeEach(() => {
  Brands.removeAll();
});

describe('Brands', () => {
  describe('/GET Brands', () => {
    it('it should GET all the brands in the array', done => {
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });
  });
});