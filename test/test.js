let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
const { expect, assert } = require('chai');
let should = chai.should();
chai.use(chaiHttp);

const token = '';

describe("/GET brands", () => {
  it.only("GET brands", done => {
    chai
      .request(server)
      .get('/brands')
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
  it.only('GET all products for brand', done => {
    chai
      .request(server)
      .get('/brands/1/products')
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        res.should.have.status(200);
        expect("Content-Type", "application/json");
        res.body.should.be.an('array');
        done();
      });
  });
  it.only('throw error for invalid id', done => {
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
  it.only("get all products", done => {
    chai
      .request(server)
      .get("/products")
      .end((err, res) => {
        res.should.have.status(200);
        expect("Content-Type", "application/json");
        res.body.should.be.an('array');
        done();
      });
  });
  it.only("returns all with missing query", done => {
    chai
      .request(server)
      .get("/products?query=")
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an('array');
        done();
      });
  });
  it.only("limit results to queried strings only", done => {
    chai
      .request(server)
      .get("/products?query=bark")
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(1);
        done();
      });
  });
  it("fails for unknown query", done => {
    chai
      .request(server)
      .get("/products?query=imabigdummy")
      .end((err, res) => {
        expect(err).to.not.be.null;
        expect(res).to.have.status(404);
        done();
      });
  });
});

describe("/POST login", () => {
  it.only("send token if login successful", done => {
    let user = {
      username: "lazywolf342",
      password: "tucker"
    };

    chai
      .request(server)
      .post('/login')
      .send(user)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('string');
        expect(res.body).to.have.lengthOf(11);
        done();
      })
  });

  it.only("throw err if user or pw not in req", done => {
    let user = {
      username: "lazywolf342"
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

  it.only('throw error if user not found', done => {
    let user = {
      username: "BigDummy",
      password: "password"
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

describe("/GET me/cart", () => {
  it.only('return items in cart or empty array', done => {
    chai
      .request(server)
      .get('/me/cart')
      .query({accessToken: token})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
  });
  it.only('throw error if not logged in', done => {
    chai
      .request(server)
      .get('/me/cart')
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});

describe("/POST me/cart", () => {
  it.only("add selected item to cart", done => {
    const productId = {productId: 7};

    chai
      .request(server)
      .post('/me/cart')
      .query({accessToken: token})
      .send(productId)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        done();
      });
  });
  it.only('throw err if not logged in', done => {
    chai
      .request(server)
      .get('/me/cart')
      .end((err, res) => {
        expect(res).to.have.status(401)
        done();
      });
  });
})

describe("/DELETE /me/cart/:productId", () => {
  it.only('delete item from cart', done => {
    chai
      .request(server)
      .delete('/me/cart/7')
      .query({accessToken: token})
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      })
  });
  it.only('throw error if not logged in', done => {
    chai  
      .request(server)
      .get('/me/cart')
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
  it.only('throw error if item not in cart', done => {
    chai
      .request(server)
      .delete('/me/cart/112')
      .query({accessToken: token})
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
});

describe("/POST /me/cart/:productId", () => {
  it.only('response of 200 and update cart', done => {
    const productId = {productId: '7'};
    chai
      .request(server)
      .post('/me/cart')
      .query({accessToken: token})
      .send(productId)
      .end();
    chai
      .request(server)
      .post('/me/cart/7')
      .query({accessToken: token})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.an('object');
        done();
      });  
  });
  it.only('throw error if not logged in', done => {
    chai
      .request(server)
      .get('/me/cart')
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
  it.only('throw error if product not in cart', done => {
    chai
      .request(server)
      .delete('/me/cart/112')
      .query({accessToken: token})
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });
});