const expect = require('chai');
const chai = require("chai");
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();

const API_KEY = 'xyz'

const Sunglasses = require('../sunglasses.model')

chai.use(chaiHttp);

describe('Sunglasses', () => {
  describe('/GET Brands', () => {
    it('Should return an array of brands', (done) => {
      chai
        .request(server)
        .get('/brands')
        .set('API-Key', API_KEY)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eq(5);
          done();
        });
    });
  });

  describe('/GET Brand Products', () => {
    it('Should get the products of a given brand', (done) => {
      //arrange
      let categoryId = 1
      //act
      chai
        .request(server)
        .get(`/brand/${categoryId}/products`)
        .set('API-Key', API_KEY)
      //assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.forEach((product) => {
            product.should.be.an("object");
            product.should.include.all.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls')
          });
          done();
        })
    });

    it('Should return an error if incorrect id', (done) => {
      let id = 'a'

      chai  
      .request(server)
      .get(`/brand/${id}/products`)
      .set('API-Key', API_KEY)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('error');
        res.body.should.have.property('error','Invalid Brand ID')
        done();
      })
    });

    it('Should return an error if brand Id does not exist', (done) => {
      let id = 0

      chai  
      .request(server)
      .get(`/brand/${id}/products`)
      .set('API-Key', API_KEY)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property('error');
        res.body.should.have.property('error', 'Brand not Found');
        done();
      })
    });
  });

  describe('/GET Products', () => {
    it('Should get all the products available', (done) => {

      chai
        .request(server)
        .get('/products')
        .set('API-Key', API_KEY)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array")
          res.body.forEach((product) => {
            product.should.be.an("object");
            product.should.include.all.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls')
          });
          done();
        })
    });
  });

  describe('/GET Cart', () => {
    it('Should show the user cart in an array', (done) => {

      let credentials = {
        username: "yellowleopard753"
      }

      const authToken = 'your-auth-token';

      chai  
        .request(server)
        .get(`/user/cart`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Key', API_KEY)
        .send(credentials)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        })
    });

    it('Should not let us view without Auth', (done) => {
      const authToken = 'wrong-token'
      let userName = "yellowleopard753"
      chai  
        .request(server)
        .get(`/user/cart`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Key', API_KEY)
        .send(userName)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.have.property('error');
          res.body.should.have.property('error', 'Unauthorized, need Auth Token');
          done();
        });
    });
  });

  describe('/POST Cart', () => {
    it('Should post a new product to the cart if logged in', (done) => {
      const authToken = 'your-auth-token';
      let credentials = {
        username: "yellowleopard753"
      };

      let exampleProduct = {
        "id": "2",
        "categoryId": "1",
        "name": "Black Sunglasses",
        "description": "The best glasses in the world",
        "price":100,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      };

      let productId = 2;

      chai
        .request(server)
        .post(`/product/${productId}/cart`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Key', API_KEY)
        .send(credentials) //req body
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.an('object');
          res.body.should.have.property('success');
          res.body.should.have.property('success', `${[exampleProduct]}`);
          done();
        });


    });
    
    it('Should not post a new product to the cart if not logged in', (done) => {
      const authToken = 'wrong-token';
      let credentials = {
        username: "yellowleopard753"
      };
      let productId = 2;

      chai
        .request(server)
        .post(`/product/${productId}/cart`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Key', API_KEY)
        .send(credentials) 
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.have.property('error', 'Unauthorized, need Auth Token')
        done();
        });
    });

    it('Should not return if invalid product', (done) => {
      const authToken = 'your-auth-token';
      let credentials = {
        username: "yellowleopard753"
      };
      let productId = 5000;

      chai
        .request(server)
        .post(`/product/${productId}/cart`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Key', API_KEY)
        .send(credentials) //req body
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('error', 'Product not found')
          done();
        });
    });
  });

  describe('/POST Login', () => {
    it('Should verify that you are an actual user & return Auth token', (done) => {
      let loginCredentials = {
        userName: "yellowleopard753",
        password: 'jonjon'
      };

      const authToken = 'your-auth-token';

      chai  
        .request(server)
        .post(`/login`)
        .set('API-Key', API_KEY)
        .send(loginCredentials)
        .end((req, res) => {
          res.should.have.status(201);
          res.body.should.deep.equal(authToken);
          done()
        });
    });

    it('Should error if you invalid credentials', (done) => {
      let loginCredentials = {
        userName: "wrongUser",
        password: 'jonjon'
      };

      chai  
        .request(server)
        .post(`/login`)
        .set('API-Key', API_KEY)
        .send(loginCredentials)
        .end((req, res) => {
          res.should.have.status(401);
          res.body.should.have.property('error', 'Invalid Username or Password')
          done()
        });
    });
  });

  describe('/PUT Cart', () => {
    it('should update the products quantity in the cart (addition)', (done) => {
      const authToken = 'your-auth-token';

      const credentials = {
        username: 'yellowleopard753'
      };

      let updatedQuantity = 5;

      const newCart = [];

      const updateCart = () => {
        for (let i = 1; i <= updatedQuantity; i++) {
          newCart.push(exampleProduct);
        }
      };

      // put products in the cart

      let exampleProduct = {
        "id": "2",
        "categoryId": "1",
        "name": "Black Sunglasses",
        "description": "The best glasses in the world",
        "price":100,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      };

      let exampleUser =  {
        "gender": "female",
        "cart":[],
        "name": {
            "title": "mrs",
            "first": "susanna",
            "last": "richards"
        },
        "location": {
            "street": "2343 herbert road",
            "city": "duleek",
            "state": "donegal",
            "postcode": 38567
        },
        "email": "susanna.richards@example.com",
        "login": {
            "username": "yellowleopard753",
            "password": "jonjon",
            "salt": "eNuMvema",
            "md5": "a8be2a69c8c91684588f4e1a29442dd7",
            "sha1": "f9a60bbf8b550c10712e470d713784c3ba78a68e",
            "sha256": "4dca9535634c102fbadbe62dc5b37cd608f9f3ced9aacf42a5669e5a312690a0"
        },
        "dob": "1954-10-09 10:47:17",
        "registered": "2003-08-03 01:12:24",
        "phone": "031-941-6700",
        "cell": "081-032-7884",
        "picture": {
            "large": "https://randomuser.me/api/portraits/women/55.jpg",
            "medium": "https://randomuser.me/api/portraits/med/women/55.jpg",
            "thumbnail": "https://randomuser.me/api/portraits/thumb/women/55.jpg"
        },
        "nat": "IE"
    };

      Sunglasses.addToCart(exampleUser, exampleProduct);

      updateCart();

      chai
        .request(server)
        .put(`/product/${exampleProduct.id}/${updatedQuantity}/cart`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Key', API_KEY)
        .send(credentials)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.deep.equal(newCart);
          done();
        });


    });
    
    it('should update the products quantity in the cart (subrtaction)', (done) => {
      const authToken = 'your-auth-token';

      const credentials = {
        username: 'yellowleopard753'
      };

      let updatedQuantity = 1;

      const newCart = [];

      const updateCart = () => {
        for (let i = 1; i <= updatedQuantity; i++) {
          newCart.push(exampleProduct);
        }
      };

      // put products in the cart

      let exampleProduct = {
        "id": "2",
        "categoryId": "1",
        "name": "Black Sunglasses",
        "description": "The best glasses in the world",
        "price":100,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      };

      updateCart();

      chai
        .request(server)
        .put(`/product/${exampleProduct.id}/${updatedQuantity}/cart`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Key', API_KEY)
        .send(credentials)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.deep.equal(newCart);
          done();
        });

    });
  });

  describe('/DELETE Cart', () => {
    it('Should DELETE the given product if logged in', (done) => {
      const authToken = 'your-auth-token';
      const credentials = {
        username: 'yellowleopard753'
      };
      let exampleProduct = {
        "id": "2",
        "categoryId": "1",
        "name": "Black Sunglasses",
        "description": "The best glasses in the world",
        "price":100,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      };
      let productId = 2

      chai
        .request(server)
        .delete(`/product/${productId}/cart`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Key', API_KEY)
        .send(credentials)
        .end((err, res) => {
          res.should.have.status(204);
          res.body.should.not.include(exampleProduct);
          done();
        });
    });

    it('Should Error if product is wrong', (done) => {
      const authToken = 'your-auth-token';
      const credentials = {
        username: 'yellowleopard753'
      };
      let productId = 404;

      chai
        .request(server)
        .delete(`/product/${productId}/cart`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Key', API_KEY)
        .send(credentials)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('error', 'Product not found');
          done();
        });
    });
  });

});