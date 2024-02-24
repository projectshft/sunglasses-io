const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server'); // Adjust the path as needed

const should = chai.should();
chai.use(chaiHttp);

// TODO: Write tests for the server

const brandThreeEx = [
    {
    "id": "6",
    "categoryId": "3",
    "name": "glas",
    "description": "Pretty awful glasses",
    "price":10,
    "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
  },
  {
    "id": "7",
    "categoryId": "3",
    "name": "QDogs Glasses",
    "description": "They bark",
    "price":1500,
    "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
  }
]

describe('Brands', () => {
  describe("/GET brand", () => {
    it('should GET all the brands', done => {
      chai
        .request(server)
        .get("/brands")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done(err);
        })
    })
  })
  describe("/GET products for brand", () => {
    it('should not GET the products for a brand id that does not exist', done => {
      chai
        .request(server)
        .get("/brands/6/products")
        .end((err, res) => {
          res.should.have.status(404);
          done(err)
        })
    })
    
    it('should GET the products for a paticular brand ID', done => {
      chai
        .request(server)
        .get("/brands/3/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.should.eql(brandThreeEx)
          done(err)
        })
    })
  })
  describe("/GET products", () => {
    it('should get a list of all products', done => {
      chai
        .request(server)
        .get('/products')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an("array");
          done(err)
        })
    })
  })
});

describe('/POST Login', () => {
  it('should not POST login if username is blank', done => {
    const passwordOnly = {username: '', password: 'helloWorld'}
    chai
      .request(server)
      .post('/login')
      .send(passwordOnly)
      .end((err, res) => {
        res.should.have.status(400)
        done(err)
      })
  })
  it('should not POST login if password is blank', done => {
    const usernameOnly = {username: 'hello', password: ''}
    chai
      .request(server)
      .post('/login')
      .send(usernameOnly)
      .end((err, res) => {
        res.should.have.status(400)
        done(err)
      })
  })
  it('should not POST login if username and password are blank', done => {
    const blank = {username: '', password: ''}
    chai
      .request(server)
      .post('/login')
      .send(blank)
      .end((err, res) => {
        res.should.have.status(400)
        done(err)
      })
  })
  it('should POST login if username and password are not blank', done => {
    const login = {username: 'yellowleopard753', password: 'jonjon'}
    chai
      .request(server)
      .post('/login')
      .send(login)
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.an('object')
        res.body.should.have.property('md5')
        done(err)
      })
})});

describe('Cart', () => {});
