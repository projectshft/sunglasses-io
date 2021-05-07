let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);

describe("Brands", () => {
  describe("/GET brands", () =>{
    it("should GET a list of all brands", (done) => {
      chai
        .request(server)
        .get("/api/brands")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5);
          done();
        })
    })
  });

  describe("/GET brands/:id/products", () =>{
    it("should GET a list of all products by brand id", (done) => {
      chai
        .request(server)
        .get("/api/brands/1/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.pieces.length.should.be.eql(3);
          done();
        })
    })
    it("should return a 404 error when an invalid brand id is entered", (done) =>{
      chai
        .request(server)
        .get("/api/brands/7/products")
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          done();
        })
    })
  });
});

describe("/GET products", () => {
  describe("/GET /products", () =>{
    it("should GET a list of products which match the search query", (done) => {
      chai
        .request(server)
        .get("/api/products?query=best")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(4);
          done();
        })
    })
    it("should return all models when no query is entered", (done) =>{
      chai
        .request(server)
        .get("/api/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
          done();
        })
    })
    it("should return an empty array when a query runs and finds no glasses", (done) =>{
      chai
        .request(server)
        .get("/api/products?query=watermelon")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(0);
          done();
        })
    })
    it("should return an error when incorrect parameters are used", (done) =>{
      chai
        .request(server)
        .get("/api/products?q=watermelon&dog=labrador")
        .end((err, res) => {
          err.statusCode.should.be.eql(400);
          err.rawResponse.should.be.a('string');
          done();
        })
    })
  });
});

describe("/POST login", () => {
  it("should return a 400 error if parameters are missing", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({"username":"", "password": "snorkel"})
      .end((err, res) => {
        err.statusCode.should.be.eql(400);
        err.rawResponse.should.be.a('string');
        done();
      })
  })
  it("should return a 401 error if password is incorrect", (done) =>{
    chai
      .request(server)
      .post("/api/login")
      .send({"username":"lazywolf342", "password": "snorkel"})
      .end((err, res) => {
        err.statusCode.should.be.eql(401);
        err.rawResponse.should.be.a('string');
        done();
      })
  })
  it("should return an access token on successful login", (done) =>{
    chai
      .request(server)
      .post("/api/login")
      .send({'username':'lazywolf342', 'password': 'tucker'})
      .end((err, res) => {
        res.statusCode.should.be.eql(200);
        res.body.should.be.a('string');
        res.body.length.should.be.eql(16);
        done();
    })
  })
})
describe("/POST login lockout", () => {
  before('runs several bad login attempts', () => {
    chai
      .request(server)
      .post("/api/login")
      .send({'username':'lazywolf342', 'password': 'snorkel'})
      .end()
    chai
      .request(server)
      .post("/api/login")
      .send({'username':'lazywolf342', 'password': 'snorkel'})
      .end()
  })
  it("should lock out the user after 3 failed login attempts", (done) =>{
    chai
      .request(server)
      .post("/api/login")
      .send({'username':'lazywolf342', 'password': 'snorkel'})
      .end((err, res) => {
        err.statusCode.should.be.eql(403);
        err.rawResponse.should.be.a('string');
        done();
      })
  })
});

describe("Shopping cart", () => {
  let token = '';
  before('logs into the site', () => {
    chai
      .request(server)
      .post("/api/login")
      .send({'username':'yellowleopard753', 'password': 'jonjon'})
      .end((err, res) =>{
        token = res.body
      })
  })
  describe('/GET shopping cart', ()=>{
    it("should allow a logged in user to view the cart", done =>{
      chai
        .request(server)
        .get("/api/me/cart")
        .set('bearer_token', token)
        .end((err, res) => {
          res.body.should.be.an('array')
          done();
        })
    })
    it("should return a 403 error if user doesn't have access token", (done) =>{
      chai
        .request(server)
        .get("/api/me/cart")
        .end((err, res) => {
          err.statusCode.should.be.eql(403);
          err.rawResponse.should.be.a('string');
          done();
        })
    })
  })

  describe('/POST shopping cart', ()=>{
    it("should allow logged in user to add to the cart, and return item/quantity added", done =>{
      chai
        .request(server)
        .post("/api/me/cart?productId=4&quantity=4")
        .set('bearer_token', token)
        .end((err, res) => {
          res.body.should.be.an('object');
          res.body.should.have.property('product')
          res.body.should.have.property('quantity')
          res.body.product.price.should.eql(1500)
          res.body.product.id.should.eql('4')
          done();
        })
    })
    it("should prevent an unauthenticated user from adding to the cart", (done) =>{
      chai
        .request(server)
        .post("/api/me/cart?productId=4&quantity=4")
        .end((err, res) => {
          err.statusCode.should.be.eql(403);
          err.rawResponse.should.be.a('string');
          done();
        })
    })
    it("should not allow POST of item already in the cart, inform user to PUT to update quantity", (done) =>{
      chai
        .request(server)
        .post("/api/me/cart?productId=4&quantity=4")
        .end((err, res) => {
          err.statusCode.should.be.eql(403);
          err.rawResponse.should.be.a('string');
          done();
        })
    })
  })

  describe('/PUT shopping cart', ()=>{
    it("should allow logged in user to update items in the cart, and return item/quantity added", done =>{
      chai
        .request(server)
        .put("/api/me/cart?productId=4&quantity=8")
        .set('bearer_token', token)
        .end((err, res) => {
          res.body.should.be.an('object');
          res.body.should.have.property('product')
          res.body.should.have.property('quantity')
          res.body.product.id.should.eql('4')
          res.body.quantity.should.eql('8')
          done();
        })
    })
    it("should return an error if there is no matching item to update", (done) =>{
      chai
        .request(server)
        .put("/api/me/cart?productId=3&quantity=4")
        .set('bearer_token', token)
        .end((err, res) => {
          err.statusCode.should.be.eql(400);
          err.rawResponse.should.be.a('string');
          done();
        })
    })
  })

  describe('/DELETE shopping cart', ()=>{
    it("should allow logged in user to delete an item in the cart, and return item deleted", done =>{
      chai
        .request(server)
        .delete("/api/me/cart?productId=4")
        .set('bearer_token', token)
        .end((err, res) => {
          res.body.should.be.an('object');
          res.body.should.have.property('product')
          res.body.should.have.property('quantity')
          res.body.product.id.should.eql('4')
          res.body.quantity.should.eql('8')
          done();
        })
    })
    it("should return an error if there is no matching item to delete", (done) =>{
      chai
        .request(server)
        .delete("/api/me/cart?productId=3")
        .set('bearer_token', token)
        .end((err, res) => {
          err.statusCode.should.be.eql(400);
          err.rawResponse.should.be.a('string');
          done();
        })
    })
  })
});