const chai = require('chai')
const chaiHTTP = require('chai-http')
let server = require('../app/server')
const expect = chai.expect;
const assert = chai.assert;
const should = chai.should();
chai.use(chaiHTTP);

//TDD!

let singleGlasses ={
  "id": "9",
  "categoryId": "4",
  "name": "Sugar",
  "description": "The sweetest glasses in the world",
  "price": 125,
  "imageUrls": ["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
}

//Sunglasses endpoints
describe('sunglasses', () => {
  describe('/get sunglasses' , () => {
    it('should retrieve the list of sunglasses from the store', (done) => {
      chai.request(server)
      .get('/v1/sunglasses')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
          expect(res.body).to.include.deep.members([singleGlasses])
        done()
      })
    })
  })
  describe('get sunglasses by ID', () => {
    it('should retrieve one sunglasses object if an ID is supplied' , done => {
      let randomProduct = Math.floor(Math.random() * 12)
      chai.request(server)
      .get(`/v1/sunglasses/${randomProduct}`)
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.an('object')
        res.body.should.have.all.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls')
        done()
      })
    })
    it('should not retrieve a product if there is a mismatched id', done => {
      chai.request(server)
        .get(`/v1/sunglasses/notAProduct`)
        .end((err, res) => {
        res.should.have.status(404)
        done()
      })
    })
  })
})

describe('categories', () => {
  describe('/get categories' ,() => {
    it('should return an array of brands and their info', done => {
      chai.request(server)
      .get('/v1/categories')
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.an('array')
        expect(res.body).to.include.deep.members([{
          "id": "3",
          "name": "Levi's"}])
        done()
      })
    })
  })
  describe('/get categories by ID', () => {
    it('should return a single category object', done => {
      chai.request(server)
      .get(`/v1/categories/3`)
      .end((err, res) => {
        res.should.be.an('object')
        res.body.should.have.all.keys('id','name')
        done()
      })
    })
    it('should not return anything if the category ID is wrong' , done => {
      chai.request(server)
      .get(`/v1/categories/notACategory`)
      .end((err,res) => {
        res.should.have.status(404)
        done()
      })
    })
  })
  describe('/get/categories/:id/products', () => {
    it('should return all products matching that category', done => {
      let id = 4
      chai.request(server)
      .get(`/v1/categories/${id}/products`)
      .end((err,res) => {
        let results = res.body[0]
        res.should.have.status(200)
        res.body.should.be.an('array')
        results.should.be.an('object')
        results.should.have.all.keys('id','categoryId','name','description','price','imageUrls')
        expect(res.body).to.include.deep.members([singleGlasses]);
        done()
      })
    })
  })
})
