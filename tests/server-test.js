const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../app/server');

const should = chai.should();
chai.use(chaiHttp);

describe('api/brands', () => {
  describe('GET', () => {
    it('it should return an array of brands', (done) => {
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status('200');
          res.body.should.be.an('array');
          res.body.forEach((brand) => {
            brand.should.have.own.property('id');
            brand.should.have.own.property('name');
          });
          done();
        });
    });
  });

  describe('?query=', () => {
    it('it should return the brand that matches the query', (done) => {
      const query = 'oak';

      chai
        .request(server)
        .get(`/api/brands?query=${query}`)
        .end((err, res) => {
          res.should.have.status('200');
          res.body.should.be.an('array');
          res.body.forEach((brand) => {
            brand.name.toLowerCase().should.include(query);
          });
          done();
        });
    });
  });

  describe('?alphabetical=', () => {
    it('should return brands in the specified alphabetical order', (done) => {
      const alphOrder = 'za';

      chai
        .request(server)
        .get(`/api/brands?q=${alphOrder}`)
        .end((err, res) => {
          res.should.have.status('200');
          res.should.be.an('array');
          for (let i = 1; i < res.body.length; i++) {
            if (res.body.length === 1) {
              break;
            }

            if (res.body.length === 1) {
              console.log('No brands to display');
              break;
            }

            const brand = res.body[i].name.toLowerCase();
            const prevBrand = res.body[i - 1].name.toLowerCase();

            if (alphOrder === 'za') {
              brand.should.be.at.most(prevBrand);
            } else {
              brand.should.be.at.least(prevBrand);
            }
          }
          done();
        });
    });
  });
});
