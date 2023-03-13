let chai = require("chai");
let chaiHttp = require('chai-http');
let server = require("../app/server");

let should =chai.should();
chai.use(chaiHttp);

// TODO: Test GET brands endpoint
describe("/GET brands", () => {
  it("it should GET all the brands", (done) => {
    chai
      .request(server)
      .get(`/api/brands`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        done();
      })
  })
})

// TODO: Test GET brands/:id/products endpoint
describe("/GET products in brand", () => {
  it("it should GET all the products given brand id", (done) => {
    let id = 1;
    chai
      .request(server)
      .get(`/api/brands/${1}/products`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array")
        done();
      })
  })
})

// TODO: Test GET brands endpoint
describe("/GET products", () => {
  it("it should GET all the products", (done) => {
    chai
      .request(server)
      .get(`/api/products`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        done();
      })
  })
})

// TODO: Test POST login endpoint
describe("/POST login", () => {
  it("it should POST login info", (done) => {
    let user = {
      "username": "yellowleopard753",
      "password": "jonjon"
    }
    chai
      .request(server)
      .post(`/api/login`)
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      })
  })
})

// TODO: Get user's cart
describe("/GET cart", () => {
  it("it should get the current user's cart", (done) => {
    let user = {
      "username": "yellowleopard753",
      "password": "jonjon"
    }
    chai
      .request(server)
      .post(`/api/login`)
      .send(user)
      .end((err, res) => {
        chai
          .request(server)
          .get(`/api/me/cart?accessToken=${res.body}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an("array");
            res.body.length.should.be.eql(0);
            done();
          })
      })
  })
})

// TODO: Add product to user's cart
describe("/POST cart", () => {
  it("it should add product to user's cart", (done) => {
    let user = {
      "username": "yellowleopard753",
      "password": "jonjon"
    }
    let productId = 1;
    chai
      .request(server)
      .post(`/api/login`)
      .send(user)
      .end((err, res) => {
        chai
          .request(server)
          .post(`/api/me/cart?accessToken=${res.body}&productId=${productId}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an("array");
            res.body.length.should.be.eql(1);
            done();
          })
      })
  })
})

