let chai = require('chai');
let chaiHttp = require('chai-http');
const server = require("../app/server");
const expect = chai.expect;
let should = chai.should();


chai.use(chaiHttp);

describe("/GET brands", () => {
    it("should GET all brands", done => {
        chai
        .request(server)
        .get("/api/brands")
        .end((err, res) => {
            expect(err).to.be.null
            expect("Content-Type", "application/json");
            res.body.should.not.equal('null')
            res.should.have.status(200);
            res.body.should.be.an('array');
            res.body.length.should.be.equal(5);
            done();
        });
    });
});

describe("/GET brands/:id/products", () => {
    it("should GET all brands", done => {
      chai
        .request(server)
        .get("/api/brands/1/products")
        .end((err, res) => {
            expect(err).to.be.null
            expect("Content-Type", "application/json");
            res.body.should.not.equal('null')
            res.should.have.status(200);
            res.body.should.be.an('array');
            res.body.length.should.be.eql(1);
            done();
        });
    });
});

describe("/GET products", () => {
    it("should GET all products", done => {
      chai
        .request(server)
        .get("/api/products")
        .end((err, res) => {
            expect(err).to.be.null
            expect("Content-Type", "application/json");
            res.body.should.not.equal('null')
            res.should.have.status(200);
            res.body.should.be.an("array");
            res.body.length.should.be.eql(11);
            done();
        });
    });
});

describe('/POST login', () => {
  it('it should POST a token when user logs in ', done => {
    let login = {
      username: "greenlion235",
      password: "waters"
    }
    chai
      .request(server)
      .post('/api/login')
      .send(login)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('string');
        res.body.length.should.be.eql(16)
        done();
      });
  });
  it('it should NOT POST a token when user does NOT login with a correct username or password', done => {
    let login = {
      username: "greenlion235",
      password: null
    }
    chai
      .request(server)
      .post('/api/login')
      .send(login)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });
  // it('it should NOT POST a token when user does NOT login in with a username or password', done => {
  //   let login = null
  //   chai
  //     .request(server)
  //     .post('/api/login')
  //     .send(login)
  //     .end((err, res) => {
  //       res.should.have.status(400);
  //       done();
  //     });
  // });
});

describe("/GET me/cart", () => {
  it("should GET the cart of the logged in user's cart", done => {
    // let login = {
    //   username: "greenlion235",
    //   password: "waters"
    // }
    // let ac
    chai
      .request(server)
      .get('/api/me/cart')
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
    });
  });