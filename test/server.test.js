const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');
const expect = chai.expect;
chai.use(chaiHttp);
const jwt = require('jsonwebtoken');

describe('Brands', () => {
  // Test for GET /api/brands
    it('should GET all brands', (done) => {
      chai.request(server)
      .get('/brands')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array'); // brands should be in an array 
        expect(res.body.length).to.be.greaterThan(0); // Check if at least 1 brand exists
        done();
      })
    })
    it('should GET products for selected brand', (done) => {
      const brandId = 1
      chai.request(server)
      .get(`/products?brandId=${brandId}`) // send brandId as a query parameter
      .end((err, res) => {
        expect(res).to.have.status(200);
        res.body.forEach(product => { // Check to see if each product has the brandId property
          expect(product).to.have.property('categoryId', brandId)
        })
        done();
      })
    })
});

describe('Login', () => { 
    // Test for GET /api/login
    it('should log in user and return a JWT token', (done) => {
      let user = { username: 'yellowleopard753', password: 'jonjon' }
      chai.request(server)
      .post('/login')
      .send(user)
      .end(function(err, res) {
        const token = res.body.token;
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('token')
        expect(token).to.be.a('string')
        done();
      })
    })
    it('should return 401 if credentials are incorrect', (done) => {
        let userData = { username: 'yellowleopard753', password: 'wrongpassword' };
        chai.request(server)
          .post('/login')
          .send(userData)
          .end(function (err, res) {
            expect(res).to.have.status(401); // Expecting status 401 (Unauthorized)
            expect(res.body).to.have.property('message', 'Invalid credentials'); // Expect an error message
            done();
          });
      });
});

// Tests for cart
describe('Cart', () => {
  // Test for GET /api/me/cart
  describe('/GET cart', () => {
    it('should not GET cart if the user is not logged in', (done) => {
      chai.request(server)
      .get('/cart')
      .set('authorization', 'invalidtoken')  // Pass an invalid token
      .end((err, res) => {
        expect(res).to.have.status(401);  // Expect 401 Unauthorized
        done();
    })
  })
    it('should GET all items in the cart if the user is logged in', (done) => {
      const token = jwt.sign(  // Fetch token from login
        { username: 'yellowleopard753', password: 'jonjon' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' });
      chai.request(server)
      .get('/cart')
      .set('authorization', token)
      .end(function(err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array')
        done();
    })
  })
  })

  // Test for POST /api/me/cart
  describe('/POST cart', () => {
    it('should not POST item if not logged in', (done) => {
      const newItem = {
        id: 2,
        quantity: 1,
        name: 'Black Sunglasses',
        description: 'The best glasses in the world',
        price: 100
      };
      chai.request(server)
      .post('/cart')
      .set('authorization', 'invalidtoken')  // Pass an invalid token
      .send(newItem)
      .end(function(err, res) {
      expect(res.status).to.equal(401); // Should give unauthorized error
      done()
      })   
    })
    it('should add item to the cart', (done) => {
      const token = jwt.sign(  // Fetch token from login
        { username: 'yellowleopard753', password: 'jonjon' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' });
      const newItem = { //  Item for test to add to cart
        id: 1,
        quantity: 1,
        name: 'Black Sunglasses',
        description: 'The best glasses in the world',
        price: 100
      };
      chai.request(server)
      .post('/cart')
      .set('authorization', token)  // Pass login token
      .send({newItem})
      .end(function(err, res) {
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('message', 'Item added to cart');
        expect(res.body.cart).to.be.an('array').that.deep.includes(newItem); // Must include item added to cart in the cart array
        done()
      }) ;
      })
    it('should update quantity if item already exists in cart', (done) => {
      const token = jwt.sign(  // Fetch token from login
        { username: 'yellowleopard753', password: 'jonjon' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' });
      const initialItem = { //  Item for test to add to cart
        id: 1,
        quantity: 1,
        name: 'Superglasses',
        description: 'The best glasses in the world',
        price: 150
      }
      const updatedItem = { ...initialItem, quantity: 2 } // Increasing item quantity
      chai.request(server)
      .post('/cart')
      .set('authorization', token)
      .send({newItem: initialItem}) 
      .end((err, res) => { 
        expect(res.status).to.equal(200)
        expect(res.body).to.have.property('message', 'Item added to cart')
        const updatedCart = res.body.cart
        const cartItem = updatedCart.find((item) => item.id === initialItem.id)
        expect(cartItem).to.exist
        expect(cartItem.quantity).to.equal(updatedItem.quantity) // Check to see if quantity is updated
        done();
      });
  });
})

  // Test for DELETE /api/me/cart
  describe('/DELETE cart', () => {
    it('should return 401 if no token is provided', (done) => {
      chai.request(server)
        .delete('/cart:1')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.body).to.have.property('message', 'No token provided');
          done();
        });
    });
    it('should return 404 if item does not exist', (done) => {
      const token = jwt.sign(  // Fetch token from login
        { username: 'yellowleopard753', password: 'jonjon' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' });
      chai.request(server)
        .delete('/cart:777') // Delete item with non-existent id
        .set('authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(404),
          expect(res.body).to.have.property('message', 'Item not found in cart')
          done();
        })
    })
    it('should DELETE items by id from the cart', (done) => {
      const token = jwt.sign(  // Fetch token from login
        { username: 'yellowleopard753', password: 'jonjon' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' });
      const existingItem = { // Create item to be present in cart
        id: 1,
        quantity: 2,
        name: 'Superglasses',
        description: 'The best glasses in the world',
        price: 150,
      };
      const cart = [existingItem]; // Set item in cart
      chai.request(server)
        .delete(`/cart${existingItem.id}`)
        .set('authorization', token)
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('message', 'Item removed from cart');
          expect(res.body.cart).to.be.an('array');
          expect(res.body.cart).to.not.deep.include(existingItem); // Check to make sure item no longer exists in cart
          done();
        })
    })
})
});
