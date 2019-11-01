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


describe("/GET products", () => {
  it("it should GET all products", done => {
    chai
      .request(server)
      .get("/api/products")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.length.should.be.eq(11);
        done();
      })
  })
});

describe("/POST login", () => {
  it("it should return an error if user does not submit username OR password", done => {
    chai
      .request(server)
      .get("api/login")
      .send({ username: '', password: '' })
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.not.have.property('username');
        res.body.should.not.have.property('password');
        done();
      })
  })
  it("it should return an error if user submits invalid username OR password", done => {
    chai
      .request(server)
      .get("/login")
      .send({ username: '', password: '' })
      .end((err, res) => {
        res.should.have.status(401);

      })
  })
})