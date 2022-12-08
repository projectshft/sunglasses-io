/* eslint-disable no-plusplus */
/* eslint-disable no-unused-expressions */
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../app/server');
const products = require('../initial-data/products.json');

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
      { request: '/api/brands', expectedStatus: 200, query: '?' },
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

    describe('?query=', () => {
      it('it should return the brand(s) that match the query', (done) => {
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

    describe('/:id/products', () => {
      const id = '2';
      it(`it should return an array of products with the category id of ${id}`, (done) => {
        chai
          .request(server)
          .get(`/api/brands/${id}/products`)
          .end((err, res) => {
            res.should.have.status('200');
            res.body.should.be.an('array');
            res.body.forEach((product) => {
              product.should.have.own.property('id').that.is.a('string');
              product.should.have.own
                .propery('categoryId')
                .that.equals(id)
                .and.is.a('string');
              product.should.have.own.property('name').that.is.a('string');
              product.should.have.own.property('price').that.is.a('number');
              product.should.have.own.property('imageUrls').that.is.an('array');
            });
            done();
          });
      });

      it('it should return an empty array and a 404 for ids that do not match any products', (done) => {
        chai
          .request(server)
          .get(`/api/brands/456/products`)
          .end((err, res) => {
            res.should.have.status('404');
            res.body.should.be.an('array').with.a.lengthOf(0);
            done();
          });
      });

      // });

      it('it should return a 400 for bad requests', (done) => {
        const param = 'whatThe=what';
        chai
          .request(server)
          .get(`/api/brands/456/products?${param}`)
          .end((err, res) => {
            res.should.have.status('400');
            done();
          });
      });

      // describe('query=', () => {
      //   const query = 'super';

      //   it(`it should only return products matching the query: ${query}`, {
      //     chai
      //     .request(server)
      //     .get(`/api/brands/${id}/products?query=${query}`)
      //     .end((err, res) => {
      //       res.should.have.status('200');
      //       res.body.should.be.an('array');
      //       res.body.forEach((brand) => {
      //         brand.name.toLowerCase().should.include(query);
      //       });
      //       done();
      //     });
      //   });
      // });
    });
    describe('/products', () => {
      it('it should return an array of products', (done) => {
        chai
          .request(server)
          .get(`/api/products`)
          .end((err, res) => {
            res.should.have.status('200');
            res.body.should.be.an('array');
            res.body.forEach((product) => {
              product.should.have.own.property('id').that.is.a('string');
              product.should.have.own
                .property('categoryId')
                .that.is.a('string');
              product.should.have.own.property('name').that.is.a('string');
              product.should.have.own.property('price').that.is.a('number');
              product.should.have.own.property('imageUrls').that.is.an('array');
            });
            done();
          });
      });

      it('it should return a 400 for bad requests', (done) => {
        const param = 'whatThe=what';
        chai
          .request(server)
          .get(`/api/products?${param}`)
          .end((err, res) => {
            res.should.have.status('400');
            done();
          });
      });

      const query = 'super';
      describe('?query=', () => {
        it(`it should return an array of products matching the query '${query}'`, (done) => {
          chai
            .request(server)
            .get(`/api/products?q=${query}`)
            .end((err, res) => {
              res.should.have.status('200');
              res.should.be.an('array');
              res.body.forEach((product) => {
                product.should.have.own.property('id').that.is.a('string');
                product.should.have.own
                  .property('categoryId')
                  .that.is.a('string');
                product.should.have.own.property('name').that.is.a('string');
                product.should.have.own.property('price').that.is.a('number');
                product.should.have.own
                  .property('imageUrls')
                  .that.is.an('array');
                product.name.toLowerCase.should.include(query);
              });
              done();
            });
        });
        it('it should return an empty array and a 404 if query does not match any products', (done) => {
          chai
            .request(server)
            .get(`/api/products?q=${query}`)
            .end((err, res) => {
              res.should.have.status('404');
              res.body.should.be.an('array').with.lengthOf(0);
              done();
            });
        });
      });

      describe('?itemLimit', () => {
        const itemLimit = 5;
        it(`it should return no more than specified item limit ${itemLimit}`, (done) => {
          chai
            .request(server)
            .get(`/api/products?itemLimit=${itemLimit}`)
            .end((err, res) => {
              res.should.have.status('200');
              res.body.should.be.an('array').with.lengthOf.at.most(itemLimit);
              done();
            });
        });
        it(`it should return a 400 if itemLimit is not a positive integer`, (done) => {
          chai
            .request(server)
            .get(`/api/products?itemLimit=-23.2`)
            .end((err, res) => {
              res.should.have.status('400');
              done();
            });
          chai
            .request(server)
            .get(`/api/products?itemLimit=five`)
            .end((err, res) => {
              res.should.have.status('400');
              done();
            });
        });
      });
      describe('?offset', () => {
        const offset = 5;
        it(`it should return an array of products offset from the master list by ${offset}`, (done) => {
          const masterOffset = products.slice(offset - 1, products.length - 1);

          chai
            .request(server)
            .get(`/api/products?offset=${offset}`)
            .end((err, res) => {
              res.should.have.status('200');
              res.body.should.be.an('array');
              res.body.should.deep.equal(masterOffset);
              done();
            });
        });
        it(`it should return a 400 if itemLimit is not a positive integer`, (done) => {
          chai
            .request(server)
            .get(`/api/products?offset=-23.2`)
            .end((err, res) => {
              res.should.have.status('400');
              done();
            });
          chai
            .request(server)
            .get(`/api/products?offset=five`)
            .end((err, res) => {
              res.should.have.status('400');
              done();
            });
        });
      });
    });
  });
});

describe('/api/login', () => {
  it('it should return an access token if correct login credentials provided', (done) => {
    chai
      .request(server)
      .post('/api/login')
      .send({ username: 'yellowleopard753', password: 'jonjon' })
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status('200');
        res.body.should.be.a('string');
        done();
      });
  });

  it('it should return a 401 if incorrect credentials', (done) => {
    chai
      .request(server)
      .post('/api/login')
      .send({ username: 'incorrect', password: 'credential' })
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status('401');
        res.body.should.be
          .a('string')
          .that.equals('incorrect username or password');
        done();
      });
  });

  it('it should return a 400 if request is incorrectly formatted', (done) => {
    chai
      .request(server)
      .post('/api/login')
      .send({ username: '', psswd: 'jonjon' })
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status('400');
        res.body.should.be
          .a('string')
          .that.equals('incorrectly formatted response');
        done();
      });
  });
});
