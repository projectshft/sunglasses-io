let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe('/POST me/cart/:id', () => {
  it('should POST an item to cart', async function () {
    let cart = {
       "id": "10",
        "categoryId": "5",
        "name": "Peanut Butter",
        "description": "The stickiest glasses in the world",
        "price":103,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"],
        "quantity": 1
    };
    chai
    .request(server)
    .post('/me/cart/:id')
    .send('/me/cart/:id')
    .end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.a('object');
      res.body.should.have.property('id');
      res.body.should.have.property('categoryId');
      res.body.should.have.property('name');
      res.body.should.have.property('description');
      res.body.should.have.property('price')
      res.body.should.have.property('imageUrls')
      res.body.should.have.quantity('quantity')
      done();
    });
});
});

describe('/DELETE me/cart/:id', () => {
  it('should DELETE a SINGLE item from the cart', async function () {
    chai
      .request(server)
      .get('/me/cart')
      .end((err, res) => {
        chai.request(server)
          .delete('/me/cart/:id')
          .end((err, res) => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.REMOVED.should.be.a('object');
            res.body.REMOVED.should.have.property('REMOVED');
            res.body.REMOVED.should.have.property('id');
            res.body.REMOVED.should.have.propertyy('categoryId');
            res.body.REMOVED.should.have.property('name');
            res.body.REMOVED.should.have.propertyy('description');
            res.body.REMOVED.should.have.property('price')
            res.body.REMOVED.should.have.property('imageUrls')
            res.body.REMOVED.should.have.property('quantity')
            done();
            })
        })
    });
  });

describe('/POST me/cart/:id/:quantity', () => {
  it('should update a SINGLE item in the cart', async function () {
    chai.request(server)
      .get('/me/cart')
      .end((err, res) => {
        chai.request(server)
          .post('/me/cart/:id')
          .send('me/cart/:id/:quantity')
          .end((err, res) => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.be.a('object');
            res.body.should.have.property('productName');
            res.body.should.have.property('id');
            res.body.should.have.property('productName');
            res.body.should.have.property('categoryId');
            res.body.should.have.property('productName');
            res.body.should.have.property('name');
            res.body.should.have.property('productName');
            res.body.should.have.property('description');
            res.body.should.have.property('productName');
            res.body.should.have.property('price')
            res.body.should.have.property('productName');
            res.body.should.have.property('imageUrls')
            res.body.quantity.should.equal('2');
            done();
          });
        });
    });
  });  