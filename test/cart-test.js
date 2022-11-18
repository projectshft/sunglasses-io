let Cart = require('../models/cart');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe('/POST cart', () => {
  it('should POST an item to cart', async function () {
    let cart = {
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

  describe('/DELETE/:itemId cart', () => {
    it('should DELETE a SINGLE item from the cart', async function () {
      chai
        .request(server)
        .get('/cart')
        .end((err, res) => {
          chai.request(server)
            .delete('/item/'+res.body[0].itemId)
            .end((err, res) => {
              res.should.have.status(200);
              res.should.be.json;
              res.body.should.be.a('object');
              res.body.should.have.property('REMOVED');
              res.body.REMOVED.should.be.a('object');
              res.body.REMOVED.should.have.property('productName');
              res.body.REMOVED.should.have.property('itemId');
              res.body.REMOVED.shouldhave.property('itemQuantity');
              done();
            })

        })
        
         
          });
      });

      describe('/PUT/:itemId cart', () => {
      it('should update a SINGLE item in the cart', async function () {
        chai.request(server)
          .get('/cart')
          .end(function(err, res){
            chai.request(server)
              .put('/cart/'+res.body[0].itemId)
              .send({'itemQuantity': 1})
              .end(function(err, res){
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('UPDATED');
                res.body.UPDATED.should.be.a('object');
                res.body.UPDATED.should.have.property('productName');
                res.body.UPDATED.should.have.property('itemId');
                res.body.UPDATED.itemQuantity.should.equal('1');
                done();
            });
          });
      });
    });
  




   