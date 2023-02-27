let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe("Brands", () => {
  describe("/GET List of Brands", () => {
    it('should return a list of all brands', (done) => {
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5);
          done();
        })
    })
  });

  describe("/Get List of Products by Brand", () => {
    it('should return a list of products by brand id', (done) => {
      let brandId = "2"
      chai 
        .request(server)
        .get(`/api/brands/${brandId}/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body[0].should.have.property('brandId');
          res.body[0]['brandId'].should.be.eql('2');
          done();
        })
    })
  });
});

describe('Products', () => {
  describe('/GET List of All Products', () => {
    it('should return a list of all products', (done) => {
      chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
          done();
        })
    })
  })
});

describe('User', () => {
  describe('/POST User Login', () => {
    it('should login user and return user access token', (done) => {
      chai 
        .request(server)
        .post('/api/login')
        .send({"username": "yellowleopard753", "password": "jonjon"})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('string');
          done();
        })
    })
  });

  describe('/GET User Cart', () => {
    it("should return the contents of the user's cart", (done) => {
      chai 
        .request(server)
        .post('/api/login')
        .send({"username": "yellowleopard753", "password": "jonjon"})
        .end((err, res) => {
          chai
            .request(server)
            .get(`/api/me/cart?accessToken=${res.body}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array');
              res.body.length.should.eql(0);
            })
          done();
        })
    })
  });

  describe('/POST Add Product to User Cart', () => {
    it('should add a specific product to cart', (done) => {
      chai 
        .request(server)
        .post('/api/login')
        .send({"username": "yellowleopard753", "password": "jonjon"})
        .end((err, res) => {
          let accessToken = `?accessToken=${res.body}`;
          chai
            .request(server)
            .post(`/api/me/cart/2${accessToken}`)
            .end((err,res) => {
              res.should.have.status(200);
              res.body.should.be.an('array');
              res.body.length.should.eql(1);
              res.body[0].should.have.property('id');
              res.body[0]['id'].should.be.eql('2');
              res.body[0].should.have.property('quantity');
              res.body[0]['quantity'].should.eql(1);
            })
          done();  
        }) 
      })
  });
 
  describe("/POST Update the Quantity of a Product in the User's Cart", () => {
    it('should update the quantity of a specific item in the cart', (done) => {
      chai 
        .request(server)
        .post('/api/login')
        .send({"username": "yellowleopard753", "password": "jonjon"})
        .end((err, res) => {
          let accessToken = `?accessToken=${res.body}`;
            chai
              .request(server)
              .post(`/api/me/cart/2/3${accessToken}`)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body.length.should.be.eql(1);
                res.body[0].should.have.property('id');
                res.body[0]['id'].should.be.eql('2');
                res.body[0].should.have.property('quantity');
                res.body[0]['quantity'].should.be.eql(3);
              })
          done();
        })
    })
  })


  describe("/DELETE Remove a Product by id from User's Cart", () => {
    it('should delete a specified product from the cart', (done) => {
      chai
        .request(server)
        .post('/api/login')
        .send({"username": "yellowleopard753", "password": "jonjon"})
        .end((err, res) => {
          let accessToken = `?accessToken=${res.body}`
          chai
            .request(server)
            .delete(`/api/me/cart/2${accessToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array');
              res.body.length.should.eql(0); 
              done();
            })
        })
    })
  })
});

