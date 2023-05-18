const expect = require('chai');
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../server");
const should = chai.should();

const API_KEY = 'xyz'

const Sunglasses = require('./sunglasses.model')

chai.use(chaiHttp);

describe('Sunglasses', () => {
  describe('/GET Brands', () => {
    it('Should return an array of brands', (done) => {
      //arrange
      //act
      chai
        .request(server)
        .get('/brands')
        .set('API-Key', API_KEY)
      //assert
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
            expect(product).to.be.an("object");
            expect(product).to.include.all.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls')
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
        res.body.error.should.equal('Invalid brand ID');
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
        res.body.error.should.equal('Brand not Found');
        done();
      })
    });

    it('Should not return an eror if no content to return', (done) => {
      //clear all the products
      Sunglasses.clearAllProducts();

      let id = 1;

      chai  
      .request(server)
      .get(`/brand/${id}/products`)
      .set('API-Key', API_KEY)
      .end((err, res) => {
        res.should.have.status(204);
        res.body.should.be.an("array")
        res.body.length.should.be.eq(0);
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
            expect(product).to.be.an("object");
            expect(product).to.include.all.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls')
          });
          done();
        })
    });
  });

  describe('/GET Cart', () => {
    it('Should show the user cart in an array', (done) => {
      let exampleproduct = {
        "id": "2",
        "categoryId": "1",
        "name": "Black Sunglasses",
        "description": "The best glasses in the world",
        "price":100,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      };

      const authToken = 'your-auth-token';

      Sunglasses.addToCart(exampleproduct)

      chai  
        .request(server)
        .get('/user/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Key', API_KEY)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.forEach((cartItem) => {
            expect(cartItem).to.be.an("object");
            //we will be adding the brand during the get request
            expect(product).to.include.all.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls', 'brand')
          });
          done();
        })
    });

    it('Should return empty array if there are no items', (done) => {
      Sunglasses.clearCart();

      const authToken = 'your-auth-token';

      chai  
        .request(server)
        .get('/user/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Key', API_KEY)
        .end((err, res) => {
          res.should.have.status(204);
          res.body.should.be.an("array")
          //return 204 no content and empty array
          done();
        });

    });

    it('Should not let us view without Auth', (done) => {
      const authToken = 'wrong-token'

      chai  
        .request(server)
        .get('/user/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Key', API_KEY)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.have.property('error');
          res.body.error.should.equal('Invalid brand ID');
          done();
        });
    });
  });

  describe('/POST Cart', () => {
    it('Should post a new product to the cart if logged in', (done) => {
      const authToken = 'your-auth-token';

      let exampleproduct = {
        "id": "2",
        "categoryId": "1",
        "name": "Black Sunglasses",
        "description": "The best glasses in the world",
        "price":100,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      };

      chai
        .request(server)
        .post('/product/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Key', API_KEY)
        .send(exampleProduct) //req body
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.an('object')
          expect(res.body).to.include.all.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls');
          done();
        });


    });
    
    it('Should not post a new product to the cart if not logged in', (done) => {
      const authToken = 'wrong-token';

      let exampleproduct = {
        "id": "2",
        "categoryId": "1",
        "name": "Black Sunglasses",
        "description": "The best glasses in the world",
        "price":100,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      };

      chai
        .request(server)
        .post('/product/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Key', API_KEY)
        .send(exampleProduct) //req body
        .end((err, res) => {
          res.should.have.status(401);
        done();
        });
    });

    it('Should not return ', (done) => {
      const authToken = 'your-auth-token';

      let exampleproduct = {
        "id": "500",
        "categoryId": "500",
        "name": "Blackc;x,l;ldf,g Sunglasses",
        "description": "The best glasses in the world",
        "price":100,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      };

      chai
        .request(server)
        .post('/product/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Key', API_KEY)
        .send(exampleProduct) //req body
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe('/PUT Cart', () => {
    it('should update the products quantity in the cart if logged in', (done) => {
      const authToken = 'your-auth-token';

      const id = 2;

      const updatedQuantity = 5;

      // put stuff in the cart

      let exampleproduct = {
        "id": "2",
        "categoryId": "1",
        "name": "Black Sunglasses",
        "description": "The best glasses in the world",
        "price":100,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      };

      Sunglasses.addToCart(exampleproduct); // add to cart

      chai
        .request(server)
        .put(`/product/${id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Key', API_KEY)
        .send(updatedQuantity)
        .end((err, res) => {
          res.should.have.status(201);
          // array of 5? object? Need to figure out how to display
          done();
        })


    });
    //if not logged in
  });

  describe('/DELETE Cart', () => {
    it('Should DELETE the given product if logged in', (done) => {
      const authToken = 'your-auth-token';

      const id = 2;

      // put stuff in the cart

      let exampleproduct = {
        "id": "2",
        "categoryId": "1",
        "name": "Black Sunglasses",
        "description": "The best glasses in the world",
        "price":100,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      };

      Sunglasses.addToCart(exampleproduct); // add to cart

      chai
        .request(server)
        .delete(`/product/${id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('API-Key', API_KEY)
        .end((err, res) => {
          res.should.have.status(204);
          done();
        })


    });
    //if not logged in 
  });

  //describe search, will need to use query string
  //describe email

})