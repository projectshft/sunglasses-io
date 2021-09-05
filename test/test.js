let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");
const { expect, assert } = require("chai");
let should = chai.should();
chai.use(chaiHttp);

describe("/GET brands", () => {
  it.only("should GET all brands", done => {
    chai
    .request(server)
    .get("/brands")
    .end((err, res) => {
      assert.isNotNull(res.body);
      expect(err).to.be.null;
      res.should.have.status(200);
      expect("Content-Type", "application/json");
      res.body.should.be.an("array");
      done();
    })
  })
});

describe('/GET brands/:id/products', () => {
  it.only('should GET all products for given brand', done => {
    chai
      .request(server)
      .get('/brands/1/products')
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        res.should.have.status(200);
        expect("Content-Type", "application/json");
        res.body.should.be.an("array");
        done();
      });
  });
  it.only("should throw an error when given an invalid id", done => {
    chai
      .request(server)
      .get("/brands/55/products")
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
});

describe("/GET products", () => {
  it.only("should GET all products", done => {
    chai
    .request(server)
    .get("/products")
    .end((err, res) => {     
      res.should.have.status(200);
      expect("Content-Type", "application/json");
      res.body.should.be.an("array");
      done();
    });
  });
  it.only("returns all goals if query is missing", done => {
    chai
      .request(server)
      //property doesn't exist
      .get("/products?query=")
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        done();
      });
  });
  it.only("should limit results to those with a query string", done => {
    chai
      .request(server)
      .get("/products?query=spiciest")
      .end((err, res) => {
        
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(1);
        done();
      });
  });
  it("fails as expected when unrecognized property", done => {
    chai
      .request(server)
      .get("/products?query=sdfv")
      .end((err, res) => {
        expect(err).to.not.be.null;
        expect(res).to.have.status(404);
        done();
      });
  });
});

describe("/POST login", () => {
  it.only("should send Access Token if successful", done => {
    let user = {      
      username: "yellowleopard753",
      password: "jonjon"
    };

    chai
      .request(server)
      .post('/login')
      .send(user)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('string');
        expect(res.body).to.have.lengthOf(16);
        done();
      })
  });

  it.only("should throw an error if username or password are not sent in req", done => {
    let user = {
      username: "yellowleopard753"
    };

    chai
      .request(server)
      .post('/login')
      .send(user)
      .end((err, res) => {
        expect(res).to.have.status(400)
        done();

      })
  })

  it.only("should throw error if user isn't found", done => {
    let user = {
      username: "Phil",
      password: "McCracken"
    };

    chai
      .request(server)
      .post('/login')
      .send(user)
      .end((err, res) => {
        expect(res).to.have.status(401)
        done();
      })
  })
})

//I have no idea how to test using the authentication setup we were shown in the lessons
describe("/GET me/cart", () => {
  it.only("should return contents of users cart or empty array", done => {
    const token = 'sqHPTIt4wYP5dhpO';
    chai
      .request(server)
      .get('/me/cart')
      .query({accessToken: token})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        done();
      });
    });
  it.only("should throw an error if user is not logged in", done => {
    chai
      .request(server)
      .get('/me/cart')
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
})