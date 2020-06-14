let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe('sunglasses', () => {
  describe('/GET brands', () => {
    it('it should GET all the brands', done => {
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5);
          done();
        });
    });
  });
  describe('/POST login', () => {
    it('it should log a user into the system', done => {
      let login = {
        "username": "yellowleopard753",
        "password": "jonjon",
        "salt": "eNuMvema",
        "md5": "a8be2a69c8c91684588f4e1a29442dd7",
        "sha1": "f9a60bbf8b550c10712e470d713784c3ba78a68e",
        "sha256": "4dca9535634c102fbadbe62dc5b37cd608f9f3ced9aacf42a5669e5a312690a0"
      };
      chai
        .request(server)
        .post('/api/login')
        .send(login)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('string');
          done();
        })
    })
  })
  describe('/GET products', () => {
    it('it should get all products', done => {
      chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
          done();
        })
    })
  })
  describe('/GET products from brandID', () => {
    it('it should get all products from a given brand', done => {
      let brandId = 2;
      chai
        .request(server)
        .get(`/api/brands/${brandId}/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(2);
          done();
        })
    })
    it('it should return an error if there is no brand with that id', done => {
      let brandId = 99;
      chai
        .request(server)
        .get(`/api/brands/${brandId}/products`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        })
    })
    it('it should return an error if no brand id is supplied', done => {
      let brandId = null;
      chai
        .request(server)
        .get(`/api/brands/${brandId}/products`)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        })
    })
  })
  describe('/GET me/cart', () => {
    it('it should get all items in a users cart', done => {
      let login = {
        "username": "yellowleopard753",
        "password": "jonjon",
        "salt": "eNuMvema",
        "md5": "a8be2a69c8c91684588f4e1a29442dd7",
        "sha1": "f9a60bbf8b550c10712e470d713784c3ba78a68e",
        "sha256": "4dca9535634c102fbadbe62dc5b37cd608f9f3ced9aacf42a5669e5a312690a0"
      };
      chai
        .request(server)
        .post('/api/login')
        .send(login)
        .end((err, res) => {
          let accessToken = res.body;
          chai
            .request(server)
            .get(`/api/me/cart?accessToken=${accessToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array');
              res.body.length.should.be.eql(0);
              done();
            })
        })


    })
  })

  describe('/POST me/cart', () => {
    it('it should add an item to a users cart', done => {
      let login = {
        "username": "yellowleopard753",
        "password": "jonjon",
        "salt": "eNuMvema",
        "md5": "a8be2a69c8c91684588f4e1a29442dd7",
        "sha1": "f9a60bbf8b550c10712e470d713784c3ba78a68e",
        "sha256": "4dca9535634c102fbadbe62dc5b37cd608f9f3ced9aacf42a5669e5a312690a0"
      };
      chai
        .request(server)
        .post('/api/login')
        .send(login)
        .end((err, res) => {
          let accessToken = res.body;
          let product = {
            "id": "1",
            "categoryId": "1",
            "name": "Superglasses",
            "description": "The best glasses in the world",
            "price": 150,
            "imageUrls": ["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
          }
          chai
            .request(server)
            .post(`/api/me/cart?accessToken=${accessToken}`)
            .send(product)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array');
              res.body[0].should.be.eql(product);
              done();
            })
        })
    })
  })
  describe('/DELETE me/cart/{productId}', () => {
    it('should delete an item from a users cart', done => {
      let login = {
        "username": "yellowleopard753",
        "password": "jonjon",
        "salt": "eNuMvema",
        "md5": "a8be2a69c8c91684588f4e1a29442dd7",
        "sha1": "f9a60bbf8b550c10712e470d713784c3ba78a68e",
        "sha256": "4dca9535634c102fbadbe62dc5b37cd608f9f3ced9aacf42a5669e5a312690a0"
      };
      chai
        .request(server)
        .post('/api/login')
        .send(login)
        .end((err, res) => {
          let accessToken = res.body;
          let product = {
            "id": "1",
            "categoryId": "1",
            "name": "Superglasses",
            "description": "The best glasses in the world",
            "price": 150,
            "imageUrls": ["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
          }
          let productId = product.id;
          chai
            .request(server)
            .delete(`/api/me/cart/${productId}?accessToken=${accessToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              done();
            })
        })
    })
  })
  describe('/POST me/cart/{productId}', () => {
    it('should update the quantity of an item in a users cart', done => {
      let login = {
        "username": "yellowleopard753",
        "password": "jonjon",
        "salt": "eNuMvema",
        "md5": "a8be2a69c8c91684588f4e1a29442dd7",
        "sha1": "f9a60bbf8b550c10712e470d713784c3ba78a68e",
        "sha256": "4dca9535634c102fbadbe62dc5b37cd608f9f3ced9aacf42a5669e5a312690a0"
      };
      chai
        .request(server)
        .post('/api/login')
        .send(login)
        .end((err, res) => {
          let accessToken = res.body;
          let product = {
            "id": "1",
            "categoryId": "1",
            "name": "Superglasses",
            "description": "The best glasses in the world",
            "price": 150,
            "imageUrls": ["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
          }
          let productId = product.id;
          chai
            .request(server)
            .post(`/api/me/cart?accessToken=${accessToken}`)
            .send(product)
            .end((err, res) => {
              let quantity = {
                "quantity": "2"
              }
              chai
                .request(server)
                .post(`/api/me/cart/${productId}?accessToken=${accessToken}`)
                .send(quantity)
                .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.an('array');
                  res.body.length.should.be.eql(3);
                  done();
                })
            })
        })
    })
  })
})


