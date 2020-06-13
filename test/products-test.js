let Products = require('../app/models/products-model');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe('Products', () => {
  describe('/GET Products', () => {
    it('it should GET an array of products', done => {
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        });
    });

    it('it should GET an array of available products for a particular brand id', done => {
      let brandId = '1';
      chai
        .request(server)
        .get('/api/brands/' + brandId + '/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(3);
          done();
        });
    });

    // it('it should fail if no brand id parameter is provided', done => {
    //   let brandId2 = null;
    //   chai
    //     .request(server)
    //     .get('/api/brands/' + brandId2 + '/products')
    //     .end((err, res) => {
    //       res.should.have.status(400);
    //       done();
    //     });
    // });

    it('it should fail if there are no brands matching this id, and therefore no products', done => {
      let brandId3 = '100';
      chai
        .request(server)
        .get('/api/brands/' + brandId3 + '/products')
        .end((err, res) => {
          res.body.length.should.be.eql(0);
          done();
        });
    });

    it('it should GET an empty array if there are no products in the array', done => {
      Products.removeAllProducts();
      chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });
  });
});