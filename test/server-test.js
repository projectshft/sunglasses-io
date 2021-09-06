const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
let should = chai.should();

let testAccessToken = null;

chai.use(chaiHTTP);

//test (/products) endpoint
describe('/GET Products', () => {
  it("it should GET all the products", (done) => {
    chai
      .request(server)
      .get("/api/products")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.length.should.be.eql(11);
        done();
      })
  })
});

//test (/brands) endpoint
describe('/GET Brands', () => {
  it("it should GET all the brands", (done) => {
    chai
      .request(server)
      .get("/api/brands")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.length.should.be.eql(5);
        done();
      })
  })

  //test (/brands/:id/products) endpoint
  it("it should GET all of the products for a specific brand", (done) => {
    chai
      .request(server)
      .get("/api/brands/1/products")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.length.should.be.eql(3);
        done();
      })
  })
});

//test (/login) endpoint
describe('/POST Login', () => {
  it("it should POST login credentials and return access token if valid", (done) => {

    const login = {
      username: "yellowleopard753",
      password: "jonjon"
    }

    chai
      .request(server)
      .post("/api/login")
      .send(login)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("string");
        testAccessToken = res.body;
        done();
      })
  })
});

//test (/me/cart) endpoint to view cart
describe('/GET Cart', () => {
  it("it should GET a logged-in user's cart", (done) => {
    chai
      .request(server)
      .get(`/api/me/cart?accessToken=${testAccessToken}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        done();
      })
  })
});

//test (/me/cart) endpoint to add product to cart
describe('/POST Cart', () => {
  it("it should POST a specific product into the user's cart", (done) => {

    const product = {
      id: "1"
    }
    
    chai
      .request(server)
      .post(`/api/me/cart?accessToken=${testAccessToken}`)
      .send(product)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.length.should.be.eql(1);
        res.body[0].product.name.should.be.eql("Superglasses");
        done();
      })
  })
});

//test (/me/cart/:productId) endpoint to change quantity of a cart product
describe('/POST Cart', () => {
  it("it should CHANGE the quantity of a specific product in the user's cart", (done) => {
    
    const change = {
      quantity: 5
    }

    chai
      .request(server)
      .post(`/api/me/cart/1?accessToken=${testAccessToken}`)
      .send(change)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.length.should.be.eql(1);
        res.body[0].product.name.should.be.eql("Superglasses");
        res.body[0].quantity.should.be.eql(5);
        done();
      })
  })
});

//test (/me/cart/:productId) endpoint to remove product from cart
describe('/DELETE Cart', () => {
  it("it should DELETE a specific product from the user's cart", (done) => {
    chai
      .request(server)
      .delete(`/api/me/cart/1?accessToken=${testAccessToken}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.length.should.be.eql(0);
        done();
      })
  })
});

