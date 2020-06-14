let Products = require('../app/modules/products-module');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();
chai.use(require('chai-things'));
chai.use(chaiHttp);

describe('Products', () => {
  describe('/GET Products', () => {
    it('it should GET an array of all products if there is no query', done => {
      chai
        .request(server)
        .get('/api/products')
        .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
          done();
        });
    });

    it('it should GET an array of products that must have id, category id, name, description, price, and image properties', done => {
      chai
        .request(server)
        .get('/api/products')
        .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.should.all.have.property('id');
          res.body.should.all.have.property('categoryId');
          res.body.should.all.have.property('name');
          res.body.should.all.have.property('name');
          res.body.should.all.have.property('price');
          res.body.should.all.have.property('imageUrls');
          done();
        });
    });

    it('it should GET an array of products based on a query', done => {
      let searchInput = 'ray ban';
      chai
        .request(server)
        .get('/api/products')
        .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
        .query({searchString: searchInput})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(2);
          done();
        });
    });

    it('it should GET an empty array if no products match the query', done => {
      let searchInput = 'bananas';
      chai
        .request(server)
        .get('/api/products')
        .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
        .query({searchString: searchInput})
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });


    it('it should GET an array of available products for a particular brand id', done => {
      let brandId = '1';
      chai
        .request(server)
        .get('/api/brands/' + brandId + '/products')
        .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(3);
          done();
        });
    });

    it('it should fail if no brand id parameter is provided', done => {
      let brandId2 = null;
      chai
        .request(server)
        .get('/api/brands/' + brandId2 + '/products')
        .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('it should fail if there are no brands matching this id, and therefore no products', done => {
      let brandId3 = '100';
      chai
        .request(server)
        .get('/api/brands/' + brandId3 + '/products')
        .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.length.should.be.eql(0);
          done();
        });
    });
  });
 });