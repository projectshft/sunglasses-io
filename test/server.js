let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();
let expect = chai.expect;


chai.use(chaiHttp);

describe("/GET brands", () => {
  it("it should GET all of the brands", done => {
    chai
      .request(server)
      .get("/api/brands")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.length.should.be.eq(5)
        done();
      })
  })
});

describe("/GET api/brands/:id/products", () => {
  it('it should send an error if no id was selected', done => {
    chai
      .request(server)
      .get('/api/brands/66/products')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  })

  it("it should GET all products with specific brand id", done => {
    chai
      .request(server)
      .get("/api/brands/5/products")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        done();
      })
  })
});


describe("GET /products", () => {
  it("it should GET all the products if no search query defined", done => {
    chai
      .request(server)
      .get("/api/products")
      .end((err, res) => {
        res.should.have.status(200);
        expect("Content-Type", "application/json");
        res.body.should.be.an('array');
        res.body.length.should.be.eql(11);
        done();
      })
  })
  it("it should return only the products that match said query", done => {
    chai
      .request(server)
      .get("/api/products?q=Peanut+Butter")
      .end((err, res) => {
        res.should.have.status(200);
        expect("Content-Type", "application/json");
        res.body.should.be.an('array')
        res.body.should.have.lengthOf(1);
        done();
      })
  })
  it("it should return an error if unrecognized query is entered", done => {
    chai
      .request(server)
      .get("/api/products?q=xx")
      .end((err, res) => {
        res.should.have.status(400);
        done();
      })
  })
});

describe("/POST login", () => {
  it("it should return an error if user does not submit username OR password", done => {
    let user = {username: '', password:''}
    chai
      .request(server)
      .get("api/login")
      .send(user)
      .end((err, res) => {
        res.should.have.status(400);
        done();
      })
  })
  it("it should give user access if username and password are valid", done => {
    let user = { username: 'lazywolf342', password: 'tucker' }
    chai
      .request(server)
      .post("/api/login")
      .set("Content-type", "application/json")
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      })
  })
  it("it should return an error if username is not valid", done => {
    let user = { username: 'xxx', password: 'tucker' }
    chai
      .request(server)
      .post("/api/login")
      .set("Content-type", "application/json")
      .send(user)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      })
  })
  it("it should return an error if password is not valid", done => {
    let user = { username: 'lazywolf342', password: 'xxx' }
    chai
      .request(server)
      .post("/api/login")
      .set("Content-type", "application/json")
      .send(user)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      })
  })
});

describe("/Get user cart", () => {
  it('it should GET the shopping cart contents of authorized user', done => {
    chai
      .request(server)
      .get('/api/me/cart?token=kashfu') 
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        done();
      })
  })
  it('it should not GET cart contents if no access token is submitted in the request', done => {
    chai
      .request(server)
      .get('/api/me/cart')
      .end((err, res) => {
        res.should.have.status(401);
        done();
      })
  })
  it('it should not GET cart contents if no cart exists for user', done => {
    chai
      .request(server)
      .get('/api/me/cart?token=kashfu')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      })
  })
});
