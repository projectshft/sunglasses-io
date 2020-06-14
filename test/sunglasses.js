let chai = require('chai');
let chaiHttp = require('chai-http');
let {server, products} = require('../server');


let should = chai.should();

chai.use(chaiHttp);

describe('Sunglasses', () => {
  // beforeEach(() => {
  //   products = []
  // });

  describe('/GET products', () => {
    it('it should GET all the products', done => {
      //arrange

      //act
      chai
        .request(server)
        .get('/products')
        //assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('Array');
          res.body.length.should.be.eql(0)
          done();
        })
    })
  })

  describe('/GET brands', () => {
    it('it should GET all the brands', done => {
      //arrange

      //act
      chai
        .request(server)
        .get('/brands')
        //assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('Array');
          res.body.length.should.be.eql(0)
          done();
        })
    })
  })

  describe('/GET brands/:id/products', () => {
    it('it should GET all the products with selected brand ID', done => {
      //arrange
      let product = {
        "id": "5",
        "categoryId": "2",
        "name": "Glasses",
        "description": "The most normal glasses in the world",
        "price":150,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      }

      let brand = {
        "id": "2",
        "name" : "Ray Ban"
      }

      //act
      chai
        .request(server)
        .post('/products')
        .send(product)
        //assert
        .end((err, res) => {
          chai
            .request(server)
            .get('/products')
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('Array');
              res.body.categoryId.should.be.eql(product.categoryId);
              done();
            });
        });
      })

  })

  describe('/GET cart', () => {
    it('it should GET all the items in the cart', done => {
      //arrange

      //act
      chai
        .request(server)
        .get('/me/cart')
        //assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('Array');
          res.body.length.should.be.eql(0)
          done();
        })
    })
  })

  describe('/POST me/cart', () => {
    it('it should add an item to the cart', done => {
      //arrange
      let cart = {
        "id": "5",
        "categoryId": "2",
        "name": "Glasses",
        "description": "The most normal glasses in the world",
        "price":150,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      }
      //act
      chai
        .request(server)
        .post('/me/cart')
        .send(product)
        //assert
        .end((err, res) => {
          chai
            .request(server)
            .get('/me/cart')
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('Array');
              res.body.length.should.be.eql(1);
              done();
            });
        });
      })
    })

    describe('/DELETE me/cart/:productId', () => {
      it('it should delete an item from the cart', done => {
        //arrange
        let cart = {
          "id": "5",
          "categoryId": "2",
          "name": "Glasses",
          "description": "The most normal glasses in the world",
          "price":150,
          "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        }
        
        chai
          .request(server)
          .post('/me/cart')
          .send(cart)
          .end((err, res) => {
            const newlyAddedItem = res.body
            //act
            chai
              .request(server)
              .delete('/me/cart/'+newlyAddedItem.id)
              .end((err, res) => {
                //assert
                res.should.have.status(200);
                
                //check if cart item is deleted
                chai
                  .request(server)
                  .get('/me/cart'+newlyAddedItem.id)
                  .end((err, res) => {
                    res.should.have.status(404)
                    done()
                  })
              });
          });
      })
    })

    describe('/POST me/cart/:productId', () => {
      it('it should add an item from the cart by ProductId', done => {
      //arrange
      let cart = {
        "id": "5",
        "categoryId": "2",
        "name": "Glasses",
        "description": "The most normal glasses in the world",
        "price":150,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      }
      //act
      chai
        .request(server)
        .post('/me/cart')
        .send(product)
        //assert
        .end((err, res) => {
          chai
            .request(server)
            .get('/me/cart')
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('Array');
              res.body.length.should.be.eql(1);
              done();
            });
        });
      })
    })

})