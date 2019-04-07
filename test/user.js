let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
let should = chai.should();

chai.use(chaiHttp);
let token;

describe('User', () => {

  // Test to make sure the GET cart route is only accessible by logged in users
  describe('/GET get cart', () => {
    it('it should show an error message', done => {
      chai
        .request(server)
        .get('/me/cart')
        .end((err, res) => {
          res.should.have.status(401);
          res.body.message.should.be.eql('Unauthorized user, must be logged in');
          done();
        })
    })
  });

  // Test successfully getting the cart for a user
  describe('/GET get cart', () => {
    it('it should get the cart for a user after they log in', done => {
      chai
        .request(server)
        .post('/login')
        .send({
          'email': 'susanna.richards@example.com',
          'password': 'jonjon'
        })
        .end((err, res) => {
          chai
            .request(server)
            .get(`/me/cart?token=${res.body.token}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body.length.should.be.eql(0);
              done();
            })
        });
    })
  });

  // Test sccessfuly updating the quantity of a product in a cart

  // Test successfully adding a product to a users cart
  describe('/POST product to cart', () => {
    it('it should add a product to add a product to the user"s cart', () => {
      chai
        .request(server)
        .post('/login')
        .send({
          'email': 'susanna.richards@example.com',
          'password': 'jonjon'
        })
        .end((err, res) => {
          chai
            .request(server)
            .post('/')
        })
    })
  })

});
