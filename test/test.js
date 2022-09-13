let User = require("../app/models/User")
let Brand = require("../app/models/Brands")

let chai = require("chai")
let chaiHttp = require("chai-http")
let server = require('../app/server')

let should = chai.should()

chai.use(chaiHttp)

describe("Brands", () => {
  describe('/GET brand', () => {

    it("it should GET all the brands", (done) => {
      chai
      .request(server)
      .get('/brands')
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.an("array")
        res.body.length.should.be.eql(5)
        done()
      })
    })
  })

  describe(`/GET brands/:id/products`, (id) => {
    it("it should GET all products by brand id", (done) => {
      chai
      .request(server)
      .get(`/brands/${id}/products`)
      .end((err, res) => {
        res.should.be.an("array")
        res.body.length.should.be.eql(3)
        done()
      })
    })
  })
})

describe("Products", () => {
  describe('/GET products', () =>{
    it("it should GET all the products", (done)=> {
      chai
      .request(server)
      .get('/products')
      .end((err, res)=>{
        res.should.have.status(200)
        res.body.should.be.an("array")
        res.body.length.should.be.eql(11)
        done()
      })
    })
  })
})

describe("User", () => {
  describe('/GET me', () => {
    it("it should GET user info", (done) => {
      chai
      .request(server)
      .get('/me')
      .end((err, res) => {
        res.should.be.an("object")
        done()
      })
    })
  })

  describe('/POST me/cart', () => {
    it("it should POST a product in the cart", (done)=> {
      let cart = []
      let product = 
      {
        id: "2",
        categoryId: "1",
        name: "Black Sunglasses",
        description: "The best glasses in the world",
        price:100,
        imageUrls:["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
    }
      chai
      .request(server)
      .post('/me/cart')
      .send(product)
      .end((err, res)=> {
        res.should.have.status(200)
        res.body.should.be.an("array")
        done()
      })
    })
  })
})