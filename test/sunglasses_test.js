let chai = require('chai');
let chaiHttp = require('chai-http');
let { server } = require('../app/server');

let should = chai.should();
chai.use(chaiHttp);

// mocha sunglasses_test.js --watch
// "arrange", "act" and "assert".
// beforeEach(() => {
//   // log user in
// });

// afterEach(() => {
//   // logout user
// });

describe('brands', () => {
  describe('/GET api/brands', () => {
    it('it should get all the brands', (done) => {
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5);
          done();
        });
    });
  });

  describe('/GET api/brands/id/products', () => {
    it('it should get all the products with the given brands id', (done) => {
      let id = 2;
      chai
        .request(server)
        .get(`/api/brands/${id}/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(2);
          done();
        });
    });
  });
});

describe('products', () => {
  describe('/GET api/products', () => {
    it('it should get all products', (done) => {
      chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
          done();
        });
    });
  });
});

describe('login', () => {
  describe('/POST api/login', () => {
    it('it should post the user login', (done) => {
      let user = {
        username: 'yellowleopard753',
        password: 'jonjon',
      };

      chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('string');
          done();
        });
    });
  });
});


describe('cart', () => {
  describe('/GET api/me/cart', () => {
    it('it should get users cart', (done) => {
      chai
        .request(server)
        .get('/api/me/cart?accessToken=mVQGrtceicJGzjmg')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });
  });
  // add a product to the cart
  describe('/POST api/me/cart', () => {
    it('it should add a product to the cart', (done) => {
      let product = {
        id: '100',
        categoryId: '1',
        name: 'Superglasses',
        description: 'The best glasses in the world',
        price: 150,
        imageUrls: [
          'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
          'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
          'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
        ],
      };
      let req = [product]; // == request.body
      chai
        .request(server)
        .post('/api/me/cart?accessToken=mVQGrtceicJGzjmg')
        .send(req)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);
          done();
        });
    });
  });

  describe('/DELETE api/me/cart/productId', () => {
    it('it should delete a product with the given id from the cart', (done) => {
      let productID = 2;
      let product = {
        id: productID,
        categoryId: '1',
        name: 'Superglasses',
        description: 'The best glasses in the world',
        price: 150,
        imageUrls: [
          'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
          'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
          'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
        ],
      };

      chai
        .request(server)
        .delete(`/api/me/cart/${productID}?accessToken=mVQGrtceicJGzjmg`);

      chai
        .request(server)
        .get(`/api/me/cart/${productID}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('it should return 404 if the product does not exist', (done) => {
      let productID = 20;
      let product = {
        id: productID,
        categoryId: '1',
        name: 'Superglasses',
        description: 'The best glasses in the world',
        price: 150,
        imageUrls: [
          'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
          'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
          'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
        ],
      };
      chai
        .request(server)
        .delete(`/api/me/cart/${productID}?accessToken=mVQGrtceicJGzjmg`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
  describe('/POST api/me/cart/productId', () => {
    it('it should change the quantity of a product in the cart', (done) => {
      let productID = 2;
      chai
        .request(server)
        .post(`/api/me/cart/${productID}?accessToken=mVQGrtceicJGzjmg`)
        // .send(productID)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('it should return 404 if the product does not exist', (done) => {
      let productID = 20;
      chai
      .request(server)
      .post(`/api/me/cart/${productID}?accessToken=mVQGrtceicJGzjmg`)
      // .send(productID)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
    })
  });
});
