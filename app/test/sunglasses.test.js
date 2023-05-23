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

      let userName = "yellowleopard753"

      const authToken = 'your-auth-token';

      chai  
        .request(server)
        .get(`/user/${userName}/cart`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Key', API_KEY)
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
        .get(`/user/${userName}/cart`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Key', API_KEY)
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
      let userName = "yellowleopard753";

      let exampleProduct = {
        "id": "2",
        "categoryId": "1",
        "name": "Black Sunglasses",
        "description": "The best glasses in the world",
        "price":100,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      };

      chai
        .request(server)
        .post(`/product/${userName}/cart`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Key', API_KEY)
        .send(exampleProduct) //req body
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
      let userName = "yellowleopard753";
      let exampleProduct = {
        "id": "2",
        "categoryId": "1",
        "name": "Black Sunglasses",
        "description": "The best glasses in the world",
        "price":100,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      };

      chai
        .request(server)
        .post(`/product/${userName}/cart`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Key', API_KEY)
        .send(exampleProduct) 
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.have.property('error', 'Unauthorized, need Auth Token')
        done();
        });
    });

    it('Should not return ', (done) => {
      const authToken = 'your-auth-token';
      let userName = "wrongUsername"


      let exampleProduct = {
        "id": "500",
        "categoryId": "500",
        "name": "Blackc;x,l;ldf,g Sunglasses",
        "description": "The best glasses in the world",
        "price":100,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      };

      chai
        .request(server)
        .post(`/product/${userName}/cart`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Key', API_KEY)
        .send(exampleProduct) //req body
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.have.property('error', 'User not found')
          done();
        });
    });
  });

  // describe('/PUT Cart', () => {
  //   it('should update the products quantity in the cart if logged in', (done) => {
  //     const authToken = 'your-auth-token';

  //     const productId = 2;

  //     const updatedQuantity = 5;

  //     // put stuff in the cart

  //     let exampleProduct = {
  //       "id": "2",
  //       "categoryId": "1",
  //       "name": "Black Sunglasses",
  //       "description": "The best glasses in the world",
  //       "price":100,
  //       "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
  //     };

  //     chai
  //       .request(server)
  //       .put(`/product/${userName}/cart`)
  //       .set('Authorization', `Bearer ${authToken}`)
  //       .set('API-Key', API_KEY)
  //       .send(updatedQuantity)
  //       .end((err, res) => {
  //         res.should.have.status(201);
  //         // array of 5? object? Need to figure out how to display
  //         done();
  //       });


  //   });
  //   //if not logged in
  // });

  // describe('/DELETE Cart', () => {
  //   it('Should DELETE the given product if logged in', (done) => {
  //     const authToken = 'your-auth-token';

  //     const id = 2;

  //     // put stuff in the cart

  //     let exampleproduct = {
  //       "id": "2",
  //       "categoryId": "1",
  //       "name": "Black Sunglasses",
  //       "description": "The best glasses in the world",
  //       "price":100,
  //       "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
  //     };

  //     Sunglasses.addToCart(exampleproduct); // add to cart

  //     chai
  //       .request(server)
  //       .delete(`/product/${id}`)
  //       .set('Authorization', `Bearer ${authToken}`)
  //       .set('API-Key', API_KEY)
  //       .end((err, res) => {
  //         res.should.have.status(204);
  //         done();
  //       })


  //   });
  //   //if not logged in 
  // });

  //describe search, will need to use query string
  //describe email

})