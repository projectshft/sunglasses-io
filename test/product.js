let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe('products', () => {
  // GET products - test successfully getting all currently available products
  // for every brand
  describe('/GET products', () => {
    it('it should get all of the products available', done => {
      chai
        .request(server)
        .get('/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.length.should.be.eql(11);
          done();
        })
    })
  });
});

