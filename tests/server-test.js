/* eslint-disable no-plusplus */
/* eslint-disable no-unused-expressions */
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

    const badRequestTests = [
      { request: '/api/brands', expectedStatus: 200, query: '' },
      {
        request: '/api/brands?alphabetical=za',
        expectedStatus: 200,
        query: '?alphabetical=za',
      },
      {
        request: '/api/brands?alphabetical=az',
        expectedStatus: 200,
        query: '?alphabetical=az',
      },
      {
        request: '/api/brands?alphabetical=xyz',
        expectedStatus: 400,
        query: '?alphabetical=xyz',
      },
      {
        request: '/api/brands?hello=world',
        expectedStatus: 400,
        query: '?hello=world',
      },
    ];

    badRequestTests.forEach(({ request, expectedStatus, query }) => {
      it(`${query} should have HTTP status ${expectedStatus}`, (done) => {
        chai
          .request(server)
          .get(request)
          .end((err, res) => {
            res.should.have.status(expectedStatus);
            done();
          });
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

    it('it should return an empty array and a 404 if query does not match any brands', (done) => {
      const query = 'sadhs';

      chai
        .request(server)
        .get(`/api/brands?query=${query}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe('?alphabetical=', () => {
    it('should return brands in the specified alphabetical order', (done) => {
      const alphOrder = 'za';

      chai
        .request(server)
        .get(`/api/brands?alphabetical=${alphOrder}`)
        .end((err, res) => {
          res.should.have.status('200');
          res.body.should.be.an('array');
          for (let i = 1; i < res.body.length; i++) {
            if (res.body.length === 1) {
              break;
            }

            if (res.body.length === 0) {
              console.log('No brands to display');
              break;
            }

            const brand = res.body[i].name.toLowerCase();
            const prevBrand = res.body[i - 1].name.toLowerCase();

            if (alphOrder === 'za') {
              (brand <= prevBrand).should.be.true;
            } else {
              (brand >= prevBrand).should.be.true;
            }
          }
          done();
        });
    });
  });
});
