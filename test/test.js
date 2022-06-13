let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server.js');

let should = chai.should();

chai.use(chaiHttp);

// beforeEach(() => {
//   server.removeAll();
// });

describe('/GET brands', () => {
  it('it should GET all brands', done => {
    chai
      .request(server)
      .get('/brands')
      .end((err,res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        done();
      });
  });
});

describe('/GET products by brand', () => {
  it('it should GET all products by brand', done => {
    let brand = {
      id: '3'
    }
    chai
      .request(server)
      .get('/brands/:id/products')
      .send(brand)
      .end((err,res) => {
        res.should.have.status(200);
        res.should.be.an('object');
        done();
      });
  });
});

describe('/GET products', () => {
  it('it should GET all products', done => {
    chai
      .request(server)
      .get('/products')
      .end((err,res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        done();
      });
  });
});

describe('/POST login', () => {
  it('it should POST user login', done => {
    let user = {
      username: 'yellowleopard753',
      password: 'jonjon'
    }
    chai
      .request(server)
      .post('/login')
      .send(user)
      .end((err,res) => {
        res.body.should.be.a('object');
        res.body.should.have.property('username');
        res.body.should.have.property('password');
        done();
      })
  });
});

describe('The Cart', () => {
  describe('/GET cart', () => {
    it('it should GET cart', done => {
      chai
        .request(server)
        .get('/me/cart')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });
  });

  describe('/POST cart', () => {
    it('it should POST to cart', done => {
      chai
        .request(server)
        .post('/me/cart')
        .end((err, res) => {
          res.should.have.status(200);
        done();
      });
    })
  })
});

describe('The Products in the Cart', () => {
  describe('/DELETE product', () => {
    it('it should DELETE product in cart', done => {
      let cart = [
        {
          id: "1"
        },
        {
          id: "2"
        }
      ]
      let deleteProduct = {
        id: "2"
      }
      chai
        .request(server)
        .delete('/me/cart/:productId')
        .send(cart)
        .send(deleteProduct)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.an('array');
        done();
        });
    });
  });

  describe('/POST product', () => {
    it('it should add product in cart', done => {
      let product = {
        id: "2",
        categoryId: "1",
        name: "Black Sunglasses",
        description: "The best glasses in the world",
        price:100,
        imageUrls:["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
    }
      chai
        .request(server)
        .post('/me/cart/:productId')
        .send(product)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('id');
          res.body.should.have.property('categoryId');
          res.body.should.have.property('name');
          res.body.should.have.property('description');
          res.body.should.have.property('price');
          res.body.should.have.property('imageUrls');
        done();
        });
    });
  });
});
