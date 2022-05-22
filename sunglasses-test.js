let Brands = require('./initial-data/brands.json');
let Products = require('./initial-data/products.json');
let Users = require('./initial-data/users.json');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./app/server');

let should = chai.should();

chai.use(chaiHttp);

describe('Products', () => {
  describe('/GET products', () => {
    it('should get all products', (done) => {
      chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11)
          done();
        })
    })
  })
})