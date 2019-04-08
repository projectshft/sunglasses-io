let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../app/server')

let should = chai.should()
let expect = chai.expect
let accessToken = ''

chai.use(chaiHttp)

describe('Brands', () => {
  describe('/GET brands', () => {
    it('it should GET all the brands', done => {
      chai
        .request(server)
        .get('/brands')
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.an('array')
          response.body.length.should.be.eq(5)
          done()
        })
    })
  })
  describe('/GET brands/:brandId/products', () => {
    it('it should GET all the products by brandID', done => {
      chai
        .request(server)
        .get('/brands/3/products')
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.an('array')
          response.body.length.should.be.eq(2)
          done()
        })
    })
    it('it should return an error if there is no product with that brand Id', done => {
      chai
        .request(server)
        .get('/brands/7/products')
        .end((error, response) => {
          response.should.have.status(401)
          response.body.should.be.an('object')
          response.body.should.not.have.property('brandId')
          done()
        })
    })
  })
})

describe('Products', () => {
  describe('/GET products', () => {
    it('it should return an error if the query is an empty string', done => {
      chai
        .request(server)
        .get('/products')
        .end((error, response) => {
          response.should.have.status(402)
          response.body.should.be.an('object')
          response.body.should.not.have.property('productName')
          done()
        })
    })
    it('it should return an error if there is no product with the queried productName ', done => {
      chai
        .request(server)
        .get('/products?productName=boo')
        .end((error, response) => {
          response.should.have.status(403)
          response.body.should.be.an('object')
          response.body.should.not.have.property('productName')
          done()
        })
    })
    it('it should GET all the products with the queried ProductName', done => {
      chai
        .request(server)
        .get('/products?productName=Superglasses')
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.an('object')
          response.body.should.have.property('productName')
          done()
        })
    })
  })
})

describe('Login', () => {
  describe('/POST login', () => {
    it('it should return an error if the user submits no username or password', done => {
      chai
        .request(server)
        .post('/login')
        .send({ username: '', password: '' })
        .end((error, response) => {
          response.should.have.status(405)
          response.should.not.have.property('password')
          response.should.not.have.property('username')
          done()
        })
    })
    it('it should return an error if the user submits an incorrect password or username', done => {
      chai
        .request(server)
        .post('/login')
        .send({ username: 'madeline', password: '342623q' })
        .end((error, response) => {
          response.should.have.status(406)
          response.should.not.have.property('password')
          response.should.not.have.property('username')
          done()
        })
    })
    it('it should return an access token if the user submits a valid username and password', done => {
      chai
        .request(server)
        .post('/login')
        .send({ username: 'yellowleopard753', password: 'jonjon' })
        .end((error, response) => {
          response.should.have.status(200)
          response.type.should.equal('application/json')
          accessToken = response.body
          should.not.exist(error)
          done()
        })
    })
  })
})

describe('Cart', () => {
  describe('/GET cart', () => {
    it('it should not allow a user to access their cart if they are not logged in', done => {
      chai
        .request(server)
        .get('/me/cart')
        .end((error, response) => {
          response.should.have.status(407)
          response.body.should.be.an('object')
          done()
        })
    })
  })
  describe('/GET cart', () => {
    it('it should allow a user to access their cart if they are logged in', done => {
      chai
        .request(server)
        .get('/me/cart')
        .set('xauth', accessToken)
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.an('array')
          done()
        })
    })
  })
  describe('/POST me/cart/:productId', () => {
    it('if a user is not logged in, they should not be allowed to add a product to their cart', done => {
      chai
        .request(server)
        .post('/me/cart/3')
        .end((error, response) => {
          response.should.have.status(408)
          response.body.should.be.an('object')
          done()
        })
    })
    it('it should not allow a logged in user to add a product to their cart if the product doesnt exist', done => {
      chai
        .request(server)
        .post('/me/cart/20')
        .set('xauth', accessToken)
        .end((error, response) => {
          response.should.have.status(409)
          response.body.should.be.an('object')
          done()
        })
    })
    it('it should allow a user to add a product their cart if they are logged in', done => {
      chai
        .request(server)
        .post('/me/cart/3')
        .set('xauth', accessToken)
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.an('array')
          response.body.should.have.deep.members([
            {
              quantity: 1,
              product: {
                productId: '3',
                brandId: '1',
                productName: 'Brown Sunglasses',
                description: 'The best glasses in the world',
                price: 50,
                imageUrls: [
                  'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                  'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                  'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg'
                ]
              }
            }
          ])

          done()
        })
    })
  })
  describe('/DELETE me/cart/:productId', () => {
    it('if a user is not logged in, they should not be allowed to delete a product from their cart', done => {
      chai
        .request(server)
        .del('/me/cart/3')
        .end((error, response) => {
          response.should.have.status(410)
          response.body.should.be.an('object')
          done()
        })
    })
    it('it should not allow a logged in user to delete a product from their cart if the product isnt in their cart', done => {
      chai
        .request(server)
        .del('/me/cart/20')
        .set('xauth', accessToken)
        .end((error, response) => {
          response.should.have.status(411)
          response.body.should.be.an('object')
          done()
        })
    })
    it('it should allow a logged in user to delete a product from their cart if the product exists', done => {
      // let cart = [
      //   {
      //     quantity: 1,
      //     product: {
      //       productId: '3',
      //       brandId: '1',
      //       productName: 'Brown Sunglasses',
      //       description: 'The best glasses in the world',
      //       price: 50,
      //       imageUrls: [
      //         'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
      //         'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
      //         'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg'
      //       ]
      //     }
      //   }
      // ]
      chai
        .request(server)
        .del('/me/cart/3')
        .set('xauth', accessToken)
        // .send(cart)
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.an('array')
          response.body.should.not.have.deep.members([
            {
              quantity: 1,
              product: {
                productId: '3',
                brandId: '1',
                productName: 'Brown Sunglasses',
                description: 'The best glasses in the world',
                price: 50,
                imageUrls: [
                  'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                  'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                  'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg'
                ]
              }
            }
          ])
          done()
        })
    })
  })
  describe('/POST me/cart', () => {
    it('if a user is not logged in, they should not be allowed to update the quantity of a product in their cart', done => {
      chai
        .request(server)
        .post('/me/cart?productId=4&quantity=4')
        .end((error, response) => {
          response.should.have.status(412)
          response.body.should.be.an('object')
          done()
        })
    })
    it('if a user is logged in, they should not be allowed to update the quantity of a product that doesnt exist in their cart', done => {
      chai
        .request(server)
        .post('/me/cart/?productId=3&quantity=4')
        .set('xauth', accessToken)
        .end((error, response) => {
          response.should.have.status(413)
          response.body.should.be.an('object')
          done()
        })
    })
    it('if a user is logged in, they should be able to update the quantity of products in their cart', done => {
      chai
        .request(server)
        .post('/me/cart?productId=4&quantity=4')
        .set('xauth', accessToken)
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.an('array')
          response.body.should.not.have.deep.members([
            {
              quantity: 4,
              product: {
                productId: '4',
                brandId: '2',
                productName: 'Better glasses',
                description: 'The best glasses in the world',
                price: 1500,
                imageUrls: [
                  'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                  'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                  'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg'
                ]
              }
            }
          ])
          done()
        })
    })
  })
})
