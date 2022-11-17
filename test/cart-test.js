let Cart = require('../models/cart');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe('/POST cart', () => {
  it('should POST an item to cart', done => {
    let item = {
      itemId: 1,
      name: 'QDogs Glasses',
      quantity: 1,
      price: 1500,
    };
    chai
      .request(server)
      .post('/cart')
      .send(cart)
      .end((err, res) => {
        res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('itemId');
          res.body.should.have.property('name');
          res.body.should.have.property('quantity');
          res.body.should.have.property('price');
          done();
        });
    });
  });

  
 