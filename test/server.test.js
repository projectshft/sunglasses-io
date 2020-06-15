const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;
const assert = chai.assert;

chai.use(chaiHTTP);
chai.use(require("chai-sorted"));

 // GET all the brands
describe("/GET brands", () => {
  it.only("should GET all brands", done => {
    chai
      .request(server)
      .get("/brands")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        done();
      });
  });
});

 // GET all the brands' products
describe("/GET brands' products", () => {
  it.only("should GET all products from selected brand", done => {
    chai
      .request(server)
      .get("/brands/1/products")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        done();
      });
  });
});

// Login POST
describe("/POST login to account", () => {
  it.only("should login using username and password", done => {
    let user = {
      username: 'test',
      password: 'test'
  };
    chai
      .request(server)
      .post("/login")
      .send(user)
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.be.a("string");
        done();
      });
  });
});

// GET shopping cart
describe('/GET shopping cart ', () => {

  it.only('should get user their cart', done => {
      chai
          .request(server)
          .get('/me/cart')
          .send()
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array');
              done();
          });
  });
});

// POST shopping cart
describe('/POST update to shopping cart ', () => {

  it.only('should get user their cart', done => {
      chai
          .request(server)
          .post('/me/cart')
          .send()
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array');
              done();
          });
  });
});

// DELETE item from shopping cart
describe('/DELETE item from shopping cart ', () => {

  it.only('should delete item from their cart', done => {
      chai
          .request(server)
          .delete('/me/cart/1')
          .send()
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array');
              done();
          });
  });
});

// POST item to shopping cart
describe('/POST to increase item quantity from shopping cart ', () => {

  it.only("should update the total of the selected item in the user's shopping cart", done => {
      chai
          .request(server)
          .post('/me/cart/1')
          .send()
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array');
              done();
          });
  });
});
