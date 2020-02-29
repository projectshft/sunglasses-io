let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
let should = chai.should();
chai.use(chaiHttp);


// describe('Books', () => {
//     beforeEach(() => {
//         Book.removeAll();
//       });

describe('/GET /api/brands', () => {
    it('it should GET all the brands', done => {
        //arrange

        //act
      chai
        .request(server)
        .get('/api/brands')
        //assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5);
          done();
        });
    });
    // it ('it should return 404 error and the brand does not exist'), done => {
    //     //arrange
    //     const brands = [];
    //     //act
    //     chai
    //         .request(server)
    //         .get('/api/brands')
    //         .end((err, res) => {
    //             res.should.have.status(404);
    //             res.body.should.be.an('array');
    //             res.body.length.should.be.eql(0);
    //             done();
    //           });

    // }
  });

describe('/GET /api/brands/:id/products', () => {
    it('it should GET all the products from a specific brand by brand id', done => {
        //arrange
 
        //act
      chai
        .request(server)
        .get('/api/brands/1/products')
        //assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(3);
          res.body[0].should.be.a('object');
          res.body[0].should.have.property('categoryId');
          res.body[0].should.have.property('description')
          res.body[0].should.have.property('id');
        //   res.body[0].should.have.property('imageUrls').should.be.an('array');
        //   res.body[0].should.have.property('imageUrls').length.should.be.eql('3');
          res.body[0].should.have.property('imageUrls');
          res.body[0].should.have.property('name');
          res.body[0].should.have.property('price');
          done();
        });
    });
    it('it should return a 404 error and the brand was not found', done => {
        //arrange
        //act
      chai
        .request(server)
        .get('/api/brands/6/products')
        //assert
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
    it('it should return a 404 error and the brand was not found', done => {
        //arrange
        //act
      chai
        .request(server)
        .get('/api/brands/a/products')
        //assert
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe('/GET /api/products', () => {
    it('it should GET all the products', done => {
        //arrange
 
        //act
      chai
        .request(server)
        .get('/api/products')
        //assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
          done();
        });
    });
  });

describe ('/POST /api/login', () =>{
    it('it should POST user login', done =>{
        //arrange
        let user = {
            username: 'greenlion235',
            password: 'waters'
        } 
        //act
        chai 
        .request(server)
        .post('/api/login')
        .send(user)
        //assert
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('string');
         
            done();
        })
    })
    it('the login username cannot be empty', done =>{
        //arrange
        let user ={
          username: '',
          password: 'waters'
        }
        //act
        chai 
        .request(server)
        .post('/api/login')
        .send(user)
        //assert
        .end((err, res) => {
            res.should.have.status(400);
            done();
        })
    })
    it('the login password cannot be empty', done =>{
      //arrange
      let user ={
        username: 'greenlion235',
        password: ''
      }
      //act
      chai 
      .request(server)
      .post('/api/login')
      .send(user)
      //assert
      .end((err, res) => {
          res.should.have.status(400);
          done();
      })
  })
    it('the login username is invalid', done =>{
        //arrange
        let user ={
            username: 'greenlion23',
            password: 'waters'
        }
        //act
        chai 
        .request(server)
        .post('/api/login')
        .send(user)
        //assert
        .end((err, res) => {
            res.should.have.status(401);
            done();
        })
    })
    it('the login password is invalid', done =>{
        //arrange
        let user ={
            username: 'greenlion235',
            password: 'water'
        }
        //act
        chai 
        .request(server)
        .post('/api/login')
        .send(user)
        //assert
        .end((err, res) => {
            res.should.have.status(401);
            done();
        })
    })
});

describe('/GET /api/me/cart', () => {
    it('it should GET the status of the cart', done => {
        //arrange
        let user = {
            username: 'greenlion235',
            password: 'waters'
        }
        //act
      chai
      //
        .request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
            let token = res.body 
            res.should.have.status(200);
            
            chai 
            .request(server)
            .get('/api/me/cart?accessToken=' + token)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                done();
            })
        })
    });
  });

  describe('/POST /api/me/cart', () => {
    it('it should update the items in the cart', done => {
        //arrange
        let user = {
            username: 'greenlion235',
            password: 'waters'
        };
        let product = {product:{ 
            "id": "1",
            "categoryId": "1",
            "name": "Superglasses",
            "description": "The best glasses in the world",
            "price":150,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        }, 
        quantity: 1}
        //act
      chai
        .request(server)
        .post('/api/login')
        .send(user)
        //assert
        .end((err, res) => {
            
            res.should.have.status(200);
            
            chai 
            .request(server)
            .post('/api/me/cart?accessToken=' + res.body)
            .send({product: product})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                done();
            })
        })
    });
  });

  describe('/DELETE /api/me/cart/:productId', () => {
    it('it should DELETE items in the cart by product Id', done => {
        //arrange
        let user = {
            username: 'greenlion235',
            password: 'waters'
        };
        let product = {product:{ 
            "id": "1",
            "categoryId": "1",
            "name": "Superglasses",
            "description": "The best glasses in the world",
            "price":150,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        }, 
        quantity: 1}
        //act
      chai
        .request(server)
        .post('/api/login')
        .send(user)
        //assert
        .end((err, res) => {
            let token = res.body;
            res.should.have.status(200);
           
            chai 
            .request(server)
            .post('/api/me/cart?accessToken=' + token)
            .send({product:product})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                //assert
                chai 
                .request(server)
                .delete('/api/me/cart/1?accessToken=' + token)
               
                .end((err, res)=>{
                    res.should.have.status(200);
                    done();
                }) 
              
            })
        })
    });
  });

  describe('/PUT /api/me/cart/:productId', () => {
    it('it should update items in the cart by product Id', done => {
        //arrange
        let user = {
            username: 'greenlion235',
            password: 'waters'
        };
        let product = {product:{ 
            "id": "1",
            "categoryId": "1",
            "name": "Superglasses",
            "description": "The best glasses in the world",
            "price":150,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        }, 
        quantity: 1}
        //act
      chai
        .request(server)
        .post('/api/login')
        .send(user)
        //assert
        .end((err, res) => {
            let token = res.body;
            res.should.have.status(200);

            chai 
            .request(server)
            .post('/api/me/cart?accessToken=' + token)
            .send({product: product})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                //assert
                chai 
                .request(server)
                .put('/api/me/cart/1?accessToken=' + token)
                //
                .end((err, res)=>{
                    res.should.have.status(200);
                    done();
                }) 
              
            })
        })
    });
  });

describe('/GET /api/search', () => {
  it('it should GET the product back with a query string Habanero', done => {
    chai
      .request(server)
      .get('/api/search?query=Habanero')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(1);
        res.body[0].should.be.a('object');
        res.body[0].should.have.property('categoryId');
        res.body[0].should.have.property('description')
        res.body[0].should.have.property('id');
        res.body[0].should.have.property('name')
        res.body[0].should.have.property('imageUrls');
        done();
      });
  });
});