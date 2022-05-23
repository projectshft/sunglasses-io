const { expect } = require('chai');
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./app/server');

chai.use(chaiHttp);
let should = chai.should();

describe('Products', () => {
  describe('/GET products', () => {
    it('should GET all the products', (done) => {
      chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          expect(res.body).to.have.lengthOf.above(0);
          done();
        })
    })
  })
})

describe('Brands', () => {
  describe('/GET brands', () => {
    it('should GET all the brands', (done) => {
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          expect(res.body).to.have.lengthOf.above(0);
          done();
        })
    });
    it('should GET all the products of a brand', (done) => {
      let id = '1';
      chai
        .request(server)
        .get('/api/brands/1/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          expect(res.body).to.have.lengthOf.above(0);
          expect(res.body[0].categoryId).to.equal(id);
          done();
        })
    })
  })
});

describe('Login', () => {
  describe('/POST login', () => {
    it('should login user successfully', (done) => {
      chai
        .request(server)
        .post(`/api/login?username=greenlion235&password=waters`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.text).to.equal('successfully logged in greenlion235');
          done();
        })
    })
  })
})

describe('Me', () => {
  describe('/GET cart', () => {
    it('should get the current user\'s cart', (done) => {
      currentUser = {
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
      }
      chai
        .request(server)
        .get('/api/me/cart')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          if(res.body.length > 0) {
            res.body[0].should.have.key('price')
          }
          done();
        })
      
    })
  })
  describe('/POST cart', () => {
    it('should add products to cart', (done) => {
      currentCart = {
        "cart":[
          {
            "id": "3",
            "categoryId": "1",
            "name": "Brown Sunglasses",
            "description": "The best glasses in the world",
            "price":50,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
          }
        ]
      }
      chai
        .request(server)
        .post('/api/me/cart?productId=3')
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body).to.have.lengthOf.above(0)
          expect(currentCart.cart).to.deep.equal(res.body)
          done();
        })
    })
  })
  describe('DELETE product', () => {
    it('should remove a product from the cart', (done) => {
      currentCart = {
        "cart": [
          {
            "id": "3",
            "categoryId": "1",
            "name": "Brown Sunglasses",
            "description": "The best glasses in the world",
            "price":50,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
          },
        ]
      }
      chai
        .request(server)
        .delete('/api/me/cart/3')
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body).to.have.lengthOf(1);
          expect(res.body).to.deep.equal(currentCart.cart);
          done();
        })
    })
  })
})