let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe ('Products', () => {
  
  describe('/GET api/products', () => {
    it('it should GET all of the products', done => {
      chai
        .request(server)
        .get('/api/products')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.forEach(e => {
            e.should.have.property('id');
            e.should.have.property('categoryId');
            e.should.have.property('name');
            e.should.have.property('description');
            e.should.have.property('price');
            e.should.have.property('imageUrls');
          });
          done();
        });
    });
  });
});

describe ('Brands', () => {
  
  describe('/GET api/brands', () => {
    it('it should GET the brands', done => {
      chai
        .request(server)
        .get('/api/brands')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.forEach(e => {
            e.should.have.property('id');
            e.should.have.property('name');
          });
          done();
        });
    });
  });

  describe('/GET api/brands/:id/products', () => {
    it('it should GET all products with a certain brand id.', done => {
      chai.
      request(server)
      .get('/api/brands')
      .end((error, response) => {
        const brands = response.body;
        if(brands) {
          brands.forEach(brand => {
            chai
            .request(server)
            .get(`/api/brands/${brand.id}/products`)
            .end((error, response) => {
              response.should.have.status(200);
              response.body.should.be.an('array');
              response.body.forEach(e => {
                e.categoryId.should.equal(brand.id);
              });
            });
          });
        }
      done();
      })
    });

    it('it should FAIL if the brand id is not legitimate.', done => {
      chai
        .request(server)
        .get('/api/brands')
        .end((error, response) => {
          const brands = response.body;
          const allLegitBrandIds = [];
          brands.forEach(brand => allLegitBrandIds.push(parseInt(brand.id)));
          let illegitBrandId = Math.floor(Math.random() * 50);
          while (allLegitBrandIds.includes(illegitBrandId)) {
            illegitBrandId = Math.floor(Math.random() * 50);
          }
          chai
            .request(server)
            .get(`/api/brands/${illegitBrandId}/products`)
            .end((error, response) => {
              response.should.have.status(404);
              done();
            });
      });
    });

  });
});

describe ('Login', () => {
  let currentAccessToken = '';

  describe ('/POST /api/login', () => {
    it('it should LOGIN a user with a valid login', done => {
      
      let goodLoginAttempt = {
        username: 'yellowleopard753',
        password: "jonjon"
      }
      
      chai
        .request(server)
        .post('/api/login')
        .send(goodLoginAttempt)
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.a('string');
          currentAccessToken = response.body;
          done();
        })
    });

    it('it should REJECT a user with an poorly formatted login', done => {
      let poorlyFormattedLoginAttempt = {
        username: 'redelephant864'
      }
      
      chai
        .request(server)
        .post('/api/login')
        .send(poorlyFormattedLoginAttempt)
        .end((error, response) => {
          response.should.have.status(400)
          done();
        })
    });


    it('it should REJECT a user with an incorrect username or password', done => {
      let badLoginAttempt = {
        username: 'redelephant864',
        password: 'whatever'
      }
      
      chai
        .request(server)
        .post('/api/login')
        .send(badLoginAttempt)
        .end((error, response) => {
          response.should.have.status(401);
          done();
        })
    });

  });

  describe ('GET/ api/me/cart', () => {
    it('it should FAIL if there is no Access Token in the URL.', done => {
      chai
        .request(server)
        .get('/api/me/cart')
        .end((error, response) => {
          response.should.have.status(401);
          done();
        })
    });

    it('it should FAIL if there is an invalid Access Token Key.', done => {
      chai
        .request(server)
        .get('/api/me/cart?accessToken=456421354')
        .end((error, response) => {
          response.should.have.status(403);
          done();
        })
    });

    it('it should PASS if there is a valid Access Token Key.', done => {
      chai
        .request(server)
        .get(`/api/me/cart?accessToken=${currentAccessToken}`)
        .end((error, response) => {
          response.should.have.status(200);
          done();
        })
    });

  });

});