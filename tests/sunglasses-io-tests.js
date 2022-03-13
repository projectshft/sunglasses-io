const Product = require('../app/models/product')
const Brand = require('../app/models/brand')
const User = require('../app/models/user')
const AccessToken = require('../app/models/accessToken')

let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();
let TEST_TOKEN = '2222222222222222'

chai.use(chaiHttp);

describe("Sunglasses-io", () => {

  beforeEach(() => {
    // empties lazywolf's cart
    let user = User.getUser('lazywolf342');
    let updatedUser = {
      "cart" : []
    }
    User.updateUser(user, updatedUser);

    // reset tokens to have one for lazywolf
    AccessToken.removeAll();
    
    let newToken = {
      username: 'lazywolf342',
      lastUpdated: new Date(),
      token: TEST_TOKEN
    }
    AccessToken.addToken(newToken);
  });
 
  describe("/GET/products", () => {
    it("it should GET all the products", (done) => {
      let numOfInitialProducts = Product.getAll().length
      
      chai
        .request(server)
        .get("/api/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(numOfInitialProducts);
          done();
        });
    });
  });

  describe("/GET/brands", () => {
    it("it should GET all the brands sold", (done) => {
      let numOfInitialBrands = Brand.getAll().length

      chai
        .request(server)
        .get("/api/brands")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });

  describe("/GET/brands/:id/products", () => {
    it("it should GET all products from specified brand", (done) => {
      let brandId = '1';
      chai
        .request(server)
        .get(`/api/brands/${brandId}/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });

    it("it should NOT GET products with invalid brand id", (done) => {
      let brandId = Brand.getAll().length + 1;
      chai
        .request(server)
        .get(`/api/brands/${brandId}/products`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    })
  });

  describe("/POST login", () => {
    it("it should return an access token on valid logins", (done) => {
    
      let loginAttempt = {
        username : "lazywolf342",
        password : "tucker"
      };

      chai
        .request(server)
        .post("/api/login")
        .send(loginAttempt)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("string");
          res.body.length.should.be.eql(16);
          done();
        });
    });

    it("it should NOT log a user in if missing username or password", (done) => {
      let loginAttempt = {
        username: 'yellowleopard753'
      }

      let loginAttempt2 = {
        password: 'jonjon'
      }

      let loginAttempt3 = {}

      chai
        .request(server)
        .post("/api/login")
        .send(loginAttempt3)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });

    })

    it("it should NOT login if no user exists", (done) => {
      let loginAttempt = {
        username: 'stephie',
        password: 'b'
      }

      chai
        .request(server)
        .post("/api/login")
        .send(loginAttempt)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    })
  });

  describe("/GET/me/cart", () => {
    it("it should GET all products in current user's cart", (done) => {
      let user = User.getUser('lazywolf342');
      let updatedUser = {
        "cart": [{
          "id" : 1,
          "name" : "nice sunglasses",
          "quantity" : 1
        }]
      }
      User.updateUser(user, updatedUser);
    
      chai
        .request(server)
        .get("/api/me/cart")
        .query({accessToken: TEST_TOKEN})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(1);
          done();
        });
    });

    it("it should NOT GET products if user is not logged in", (done) => {
      chai
      .request(server)
      .get("/api/me/cart")
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
    });
  });

  describe("/POST/me/cart", () => {
    it("it should POST an item to a logged in user's cart", (done) => {
      let item = {
        id: 1,
        name: "sick sunglasses",
        quantity: 5
      }

      chai
        .request(server)
        .post("/api/me/cart")
        .query({accessToken: TEST_TOKEN})
        .send(item)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('id');
          res.body.should.have.property('quantity');
          done();
        });
    });
    
    it("it should not POST add an item to cart if user not logged in", (done) => {
      let item = {
        id: 1,
        quantity: 5
      }

      chai
        .request(server)
        .post("/api/me/cart")
        .send(item)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    
    it("it should not POST add an item to cart if missing quantity", (done) => {
      let item = {
        id: 1,
      }

      chai
        .request(server)
        .post("/api/me/cart")
        .query({accessToken: TEST_TOKEN})
        .send(item)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

  describe("/DELETE/me/cart/:productId", () => {
    it("it should DELETE an item from the user's cart", (done) => {

      let user = User.getUser('lazywolf342');
      let updatedUser = {
        "cart" : [{
          "id": 1,
          "name": 'fancy sunglasses',
          "quantity": 2
        }]
      }
      User.updateUser(user, updatedUser);
      
      chai
        .request(server)
        .delete("/api/me/cart/1")
        .query({accessToken: TEST_TOKEN})
        .end((err, res) => {
          res.should.have.status(200);
          //res.body.should.be.an("object");
          // must be logged in
          done();
        });
    });

    it("it should not DELETE add an item in the cart if user not logged in", (done) => {
      
      let user = User.getUser('lazywolf342');
      let updatedUser = {
        "cart" : [{
          "id": 1,
          "name": 'fancy sunglasses',
          "quantity": 2
        }]
      }
      User.updateUser(user, updatedUser);
      chai
        .request(server)
        .delete("/api/me/cart/1")
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it("it should not DELETE an item if invalid id", (done) => {

      chai
        .request(server)
        .delete("/api/me/cart/3")
        .query({accessToken: TEST_TOKEN})
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe("/PUT/me/cart/:productId", () => {
    it("it should UPDATE an item to the user's cart", (done) => {
      let user = User.getUser('lazywolf342');
      let updatedUser = {
        "cart" : [{
          "id": 2,
          "name": 'funky sunglasses',
          "quantity": 2
        }]
      }
      User.updateUser(user, updatedUser);

      let updatedItem = {
        "id": '2',
        "name": "funky sunglasses",
        "quantity": 100
      }

      chai
        .request(server)
        .put("/api/me/cart/2")
        .send(updatedItem)
        .query({accessToken: TEST_TOKEN})
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('id');
          res.body.should.have.property('quantity');
          done();
        });
    });

    it("it should not UPDATE an item with an invalid id", (done) => {

      let user = User.getUser('lazywolf342');
      let updatedUser = {
        "cart" : [{
          "id": 1,
          "name": "funky sunglasses",
          "quantity": 2
        }]
      }
      User.updateUser(user, updatedUser);

      let updatedItem = {
        "id": '2',
        "name": "funky sunglasses",
        "quantity": 100
      }

      chai
        .request(server)
        .put("/api/me/cart/2")
        .send(updatedItem)
        .query({accessToken: TEST_TOKEN})
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    })
  });
});