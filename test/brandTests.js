const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiThings = require('chai-things');
const server = require('../app/server');

chai.should();
chai.use(chaiHttp);
chai.use(chaiThings);

describe('Brands', () => {
  describe('/GET brands', () => {
    it('should get an array of all the brands', (done) => {
      chai
        .request(server)
        .get('/brands')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.above(0);
          done();
        });
    });
  });

  describe('/GET brands/{brandId}/products', () => {
    it('should get an array of the products from a specified brand by id', (done) => {
      const brandIdToCheck = '2';
      chai
        .request(server)
        .get(`/brands/${brandIdToCheck}/products`)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.length.should.be.above(0);
          response.body.should.all.satisfy(
            (product) => product.brandId === brandIdToCheck
          );
          done();
        });
    });

    it('should return a 404 if id invalid', (done) => {
      const brandIdToCheck = '337';

      chai
        .request(server)
        .get(`/brands/${brandIdToCheck}/products`)
        .end((error, response) => {
          response.should.have.status(404);
          done();
        });
    });
  });
});
