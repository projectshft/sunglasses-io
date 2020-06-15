let Brand = require('../app/models/brand');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');

let should = chai.should();

chai.use(chaiHttp);

describe('Brands', () => {
  beforeEach(() => {
    Brand.removeAll();
  });

  describe('/GET brand', () => {
    it('it should GET all the brands', done => {
      chai
        .request(server)
        .get('/brand')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });
  });

  describe('/GET brand', () => {
    it('it should fail if the brand does exist', done => {
      chai
        .request(server)
        .get('/brand')
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.an('string');
          done();
        });
    });
  });

})