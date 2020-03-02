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
});

describe("/GET me/cart", () => {
  it("should Get all the products in user's cart", done => {
    let product = {
      id: "2",
      categoryId: "1",
      name: "Black Sunglasses",
      price: 100,
    }
    chai
      .request(server)
      .post('/api/me/cart')
      .send(product)
      .end((err, res) => {
        res.should.have.status(200);
        chai
        .request(server)
        .get('/api/me/cart')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
      });
    });
});
})

describe("/POST me/cart", () => {
  it("should POST a product to the logged in user's cart", done => {
    let product = {
      id: "2",
      categoryId: "1",
      name: "Black Sunglasses",
      description: "The best glasses in the world",
      price: 100,
      imageUrls: [
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
      ]
    }
    chai
      .request(server)
      .post('/api/me/cart')
      .send(product)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('id');
        res.body.should.have.property('categoryId');
        res.body.should.have.property('name');
        res.body.should.have.property('price');
        done();
      });
    });
    it("it should NOT POST a product to a user's cart is there is no id", done => {
      let product = {
        id: null,
        categoryId: "1",
        name: "Black Sunglasses",
        price: 100,
    }
      chai
        .request(server)
        .post('/api/me/cart')
        .send(product)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    })
    it("it should NOT POST a product to a user's cart is there is no categoryId", done => {
      let product = {
        id: "2",
        categoryId: null,
        name: "Black Sunglasses",
        price: 100,
    }
      chai
        .request(server)
        .post('/api/me/cart')
        .send(product)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    })
    it("it should NOT POST a product to a user's cart is there is no name", done => {
      let product = {
        id: "2",
        categoryId: "1",
        name: null,
        price: 100,
    }
      chai
        .request(server)
        .post('/api/me/cart')
        .send(product)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    })
    it("it should NOT POST a product to a user's cart is there is no price", done => {
      let product = {
        id: "2",
        categoryId: "1",
        name: "Black Sunglasses",
        price: null,
    }
      chai
        .request(server)
        .post('/api/me/cart')
        .send(product)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    })
});

describe("/DELETE me/cart/:productId", () => {
  it("should DELETE one product from cart the user's cart that equals the productId number", done => {
    let product = {
      id: "2",
      categoryId: "1",
      name: "Black Sunglasses",
      price: 100
    }
    chai.request(server)
    .post('/api/me/cart')
    .send(product)
    .end((err, res) => {
      res.should.have.status(200)
      chai
      .request(server)
      .delete("/api/me/cart/2")
      .end((err, res) => {
          expect("Content-Type", "application/json");
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.id.should.be.eql('2');
          res.body.should.have.property('id');
          res.body.should.have.property('categoryId');
          res.body.should.have.property('name');
          res.body.should.have.property('price');
          res.body.should.have.property('quantity');
          done();
      });
    })
  });
});

describe("/Post me/cart/:productId", () => {
  it("should change the quantity of a product and POST it to the cart", done => {
    let product = {
      id: "2",
      categoryId: "1",
      name: "Black Sunglasses",
      price: 100
    }
    chai.request(server)
    .post('/api/me/cart')
    .send(product)
    .end((err, res) => {
      res.should.have.status(200)
      res.body.should.have.property('id');
      res.body.should.have.property('categoryId');
      res.body.should.have.property('name');
      res.body.should.have.property('price');
      res.body.should.have.property('quantity');;
      let changedItem = res.body
      changedItem.quantity = 2
      chai
      .request(server)
      .post("/api/me/cart/" + changedItem.id)
      .send(changedItem)
      .end((err, res) => {
          expect("Content-Type", "application/json");
          res.should.have.status(200);
          res.body.should.have.property('id');
          res.body.should.have.property('categoryId');
          res.body.should.have.property('name');
          res.body.should.have.property('price');
          res.body.should.have.property('quantity');;
          res.body.quantity.should.equal(2)
          done();
      });
    })
  });
  it("should NOT change the quantity of a product and POST it to the cart if it is missing quantity", done => {
    let product = {
      id: "2",
      categoryId: "1",
      name: "Black Sunglasses",
      price: 100
    }
    chai.request(server)
    .post('/api/me/cart')
    .send(product)
    .end((err, res) => {
      res.should.have.status(200)
      res.body.should.have.property('id');
      res.body.should.have.property('categoryId');
      res.body.should.have.property('name');
      res.body.should.have.property('price');
      res.body.should.have.property('quantity');;
      let changedItem = {
        id: "2",
        categoryId: "1",
        name: "Black Sunglasses",
        price: 100
      }
      chai
      .request(server)
      .post("/api/me/cart/" + changedItem.id)
      .send(changedItem)
      .end((err, res) => {
          expect("Content-Type", "application/json");
          res.should.have.status(400);
          done();
      });
    })
  });
});
