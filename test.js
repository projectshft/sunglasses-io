let Brand = require('./app/models/brand');
let User = require('./app/models/user');


let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("./server");
const { request } = require('chai');

let should = chai.should();

chai.use(chaiHttp);

const userCredentials = {
  username: 'yellowleopard753',
  password: 'jonjon',
  token: '8W0m7DtqNT9WnfAZ'
};

const exampleProduct = {
  "id": "10",
  "categoryId": "1",
  "name": "Test Glasses",
  "description": "Glasses to help test stuff!",
  "price": 15,
  "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
};

const productQuantUpdate = {
  "id": "1",
  "quantity": "2"
}

const invalidProductQuantUpdate = {
  "id": "3",
  "quantity": "2"
}

// TODOS

describe('Brands', () => {
  describe('/GET brand', () => {
    // - Test that /brands returns all the brands, formatted in an array.
    it('should GET all the brands', (done) => {
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        });
    });
    it('should return all sunglasses from a specific brand', (done) => {
      chai  
        .request(server)
        .get('/api/brands/1/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        })
    })
    // - Test if passing in an invalid id returns an error code
    it('should return an error code if an invalid ID is passed as the q parameter', (done) => {
      chai
        .request(server)
        .get('/api/brands/8/products')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        })
    })
  });
});

describe('Products', () => {
  describe('/GET products', () => {
    // - Test that /products should return all the products in an array
    it('should GET all the products', (done) => {
      chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        })
    })
  });

});

describe('User', () => {
  describe('/POST user', () => {
    // - Test that a user should be able to log in
    it('should return an access token', (done) => {
      chai  
        .request(server)
        .post('/api/login')
        // .set('content-type', 'application/x-www-form-urlencoded')
        .send(userCredentials)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('string');
          done();
        })
    })
  });
  describe('/GET user cart', () => {
    // - Test that a user can access their cart
    it('should return items in the user\'s cart', (done) => {
      // Test token, hard-coded in for yellowleopard753
      let testToken = '8W0m7DtqNT9WnfAZ';
      chai 
        .request(server)
        .get('/api/me/cart')
        // Send access token in parameter query
        .query({accessToken: testToken})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          done();
        })
    })
    it('should not return the cart if the user is not logged in', (done) => {
      let testToken;
      chai 
        .request(server)
        .get('/api/me/cart')
        // Send access token in parameter query
        .query({accessToken: testToken})
        .end((err, res) => {
          res.should.have.status(404);
          done();
        })

    });
  })
  describe('/POST add item to user cart', () => {
    // - Test that a user can add a product to their cart
    it('user should be able to add product to their cart', (done) => {
      // Test token, hard-coded in for yellowleopard753
      let testToken = '8W0m7DtqNT9WnfAZ';
      chai 
        .request(server)
        .post('/api/me/cart')
        // Send access token in parameter query
        .query({accessToken: testToken})
        .send(exampleProduct)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        });
    });
  });
  describe('/DELETE item in user cart', () => {
  // - Test that a user can delete a product from their cart
  it('user should be able to delete a product from their cart based on product id', (done) => {
    // Test token, hard-coded in for yellowleopard753
    let testToken = '8W0m7DtqNT9WnfAZ';
    chai
      .request(server)
      .delete('/api/me/cart/1')
      // Send access token in parameter query
      .query({accessToken: testToken})
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        done();
      });
    });

  });
  describe('/DELETE item not in user cart', () => {
    // - Test that a user cannot delete a product from their cart if it is not there
    it('user should not be able to delete a product from their cart that is not already there', (done) => {
      // Test token, hard-coded in for yellowleopard753
      let testToken = '8W0m7DtqNT9WnfAZ';
      chai
        .request(server)
        .delete('/api/me/cart/3')
         // Send access token in parameter query
         .query({accessToken: testToken})
        .end((err, res) => {
          res.should.have.status(404);
          done();
        })
      })
    })

  describe('/POST change quantity of item', () => {
  // - Test that a user can change the quantity of a product in their cart
  it('user should be able to update the quantity of a product in their cart', (done) => {
     // Test token, hard-coded in for yellowleopard753
     let testToken = '8W0m7DtqNT9WnfAZ';
     chai
      .request(server)
      .post('/api/me/cart/1')
      .query({accessToken: testToken})
      .send(productQuantUpdate)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        done();
      });
    })
  });


})

