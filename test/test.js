let User = require("../app/models/User")
let Brand = require("../app/models/Brands")

let chai = require("chai")
let chaiHttp = require("chai-http")
let server = require('../app/server')
const { expect } = require("chai")

let should = chai.should()

const accessToken = "VYVR5aif8AbaVpBe"

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

  describe(`/GET brands/:id/products`, () => {
    it("it should GET all products by brand id", (done) => {
      id = "1"
      chai
      .request(server)
      .get(`/brands/${id}/products`)
      .end((err, res) => {
        res.body.should.be.an("array")
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

  describe('/GET products/:id', () => {
    it("it should GET the product by id", (done) => {
      chai
      .request(server)
      .get('/products/1')
      .end((err, res)=> {
        res.should.have.status(200)
        res.body.should.be.an("array")
        res.body.length.should.be.eql(1)
        done()
      })
    })
  })
})
describe("Login", () => {
  describe('/POST login', () =>{
    it("it should POST user login info", (done)=> {
      chai
      .request(server)
      .post('/login')
      .set('Accept', 'application/json')
      .send({username:"yellowleopard753", password:"jonjon"})
      .end((err, res)=>{
        res.should.have.status(200)
        res.body.should.be.a("string")
        done()
      })
    })
  })
})

describe("User", () => {
  describe(`/GET me/`, () => {
    it("it should GET user info", (done) => {
      chai
      .request(server)
      .get(`/me/?accessToken=${accessToken}`)
      .end((err, res) => {
        res.body.should.be.an("object")
        res.should.have.status(200)
        done()
      })
    })
  })
  
  
  describe('/GET me/cart', () => {
    it("it should GET all items from the cart", (done)=> {
      chai
      .request(server)
      .get(`/me/cart/?accessToken=${accessToken}`)
      .end((err, res)=> {
        res.should.have.status(200)
        res.body.should.be.an("array")
        done()
      })
    })
  })

  describe('/POST me/cart', () => {
    const productId = "2"
    it("it should POST a product to the cart", (done)=> {
      chai
      .request(server)
      .post(`/me/cart/?accessToken=${accessToken}&productId=${productId}`)
      .end((err, res)=> {
        res.should.have.status(200)
        res.body.should.be.an("array")
        done()
      })
    })
  })

  describe('/DELETE me/cart/:id', () => {
    const id = "kuZfUv9kRUMOoESv"
    it("it should DELETE a product from the cart by cart product id", (done)=>{
      chai
      .request(server)
      .delete(`/me/cart/${id}?accessToken=${accessToken}`)
      .end((err, res)=>{
        res.should.have.status(200)
        res.body.should.be.an("array")
        done()
      })
    })
  })

  describe('/POST me/cart/:id', () => {
    const id = "kuZfUv9kRUMOoESV"
    const editQty = 2
    it("it should POST an updated quantity of specified item to the cart by item id", (done) => {
      chai
      .request(server)
      .post(`/me/cart/${id}?accessToken=${accessToken}`)
      .send({editQty: editQty})
      .end((err, res)=> {
        res.should.have.status(200)
        res.body.should.be.an("array")
        done()
      })
    })
  })
})
