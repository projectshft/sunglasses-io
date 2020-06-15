const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;
const assert = chai.assert;
const should = chai.should;

chai.use(chaiHTTP);
chai.use(require("chai-sorted"));

//GET ALL BRANDS
describe("/GET brands", () => {
  it("should GET all brands", done => {
    chai
      .request(server)
      .get("/api/brands")
      .end((err, res) => {
        const brands = res.body
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(5);
        done();
      });
  });
});

//GET ALL PRODUCTS BY BRAND
describe("/GET products by brand", () => {
  it("should GET all products in a brand", done => {
    chai
      .request(server)
      .get("/api/brands/1/products") //testing for brand id 1
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(3);
        done();
        });
    });
  it("returns empty if no brand is found", done => {
    chai
      .request(server)
      //brand doesnt exist
      .get("/api/brands/7/products") //7 is an unidentified id
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(0);
        done();
        });
    });
});

//GET ALL PRODUCTS BY SEARCH
describe("/GET products", () => {
  it("should GET all products", done => {
    chai
      .request(server)
      .get("/api/products")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(11);
        done();
    });
  });
  it("should limit results to those with a query string", done => {
    chai
      .request(server)
      .get("/api/products?query=sweetest")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(1);
        done();
      });
  });
  it("should return all products if query is missing", done => {
    chai
    .request(server)
    .get("/api/products?query=")//when there is no query provided
    .end((err, res) => {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect("Content-Type", "application/json");//look at response.headers, this needs to be edited
      expect(res.body).to.be.an("array");
      expect(res.body).to.have.lengthOf(11);//length of total product list
      done();
      });
  });
  
});

//LOGIN
describe("/POST user login", () => {
  it("should return 200 response if the user logged in correctly", done => {
    //arrange
    const fullUserCredentials = {
      username: 'yellowleopard753',
      password: 'jonjon'
    };
    //act
    chai
        .request(server)
        .post("/api/login")
        .send(fullUserCredentials)
        
        //assert
        .end((err, res) => {
            const token = res.body
            expect(token).to.be.a('string');
            expect(token).to.have.lengthOf(16);
            expect("Content-Type", "application/json");
            expect(err).to.be.null;
            expect(res).to.have.status(200); 
            done();
      });
  })
  it("should return 400 if user is missing a parameter", done => {
    const missingUserCredentials = {
      username: 'yellowleopard743',
      password: ''
    }
    //act
    chai
      .request(server)
      .post("/api/login")
      .send(missingUserCredentials)
      //assert
      .end((err, res) => {
          expect(res).to.have.status(400); 
          done();
    });
  })
  it("should return 401 if the login fails", done => {
    //arrange
    const wrongCredentials = {
      username: "someguy",
      password: "password"
    }
    //act
    chai
      .request(server)
      .post("/api/login")
      .send(wrongCredentials)
      //assert
      .end((err, res) => {
          expect(res).to.have.status(401); 
          done();
    });
  })
});


//Couldn't get beforeEach to work for below tests, did them individually

//GET POST DELETE EDIT CART
describe("/GET POST DELETE Cart", () => {
  //set variable for correctly logged in user to be used for each test
  const fullUserCredentials = {
    username: 'yellowleopard753',
    password: 'jonjon'
  };
   it("GET the cart for logged in user", async function () { 
    chai
      .request(server)
      .post("/api/login")
      .send(fullUserCredentials)
      .end((err, res) => {
        let token = res.body
        //act
        chai
        .request(server)
        .get('/api/me/cart?accessToken='+token)
        .send(token)
        .end((err, res) => {
          assert.isNotNull(res.body);
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(token).to.be.a('string');
          expect(token).to.have.lengthOf(16);
          expect(res.body).to.be.an("array");
          expect("Content-Type", "application/json");
       });
     });
   });

   it("POST/ adds item to the cart for logged in user", async function () { 
    chai
      .request(server)
      .post("/api/login")
      .send(fullUserCredentials)
      .end((err, res) => {
        let token = res.body
        let product = {"productId": "1"}
        //act
        chai
          .request(server)
          .post('/api/me/cart?accessToken='+token)
          .send(product)
          .end((err, res) => {
            assert.isNotNull(res.body);
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(token).to.be.a('string');
            expect(token).to.have.lengthOf(16);
            expect(res.body).to.be.an("array");
            expect("Content-Type", "application/json");
       });
     });
   });

   it("POST/ edits the quantity of specified product in cart for logged in user", async function () { 
    chai
      .request(server)
      .post("/api/login")
      .send(fullUserCredentials)
      .end((err, res) => {
        let token = res.body
        let quantity = {"quantity": "3"}
        //act
        chai
          .request(server)
          .post('/api/me/cart/1?accessToken='+token)
          .send(quantity)
          .end((err, res) => {
            assert.isNotNull(res.body);
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(token).to.be.a('string');
            expect(token).to.have.lengthOf(16);
            expect(res.body).to.be.an("array");
            expect("Content-Type", "application/json");
            
       });
     });
   });

   it("DELETES item from cart for logged in user", async function () { 
    chai
      .request(server)
      .post("/api/login")
      .send(fullUserCredentials)
      .end((err, res) => {
        let token = res.body
        //act
        chai
        .request(server)
        .delete('/api/me/cart/1?accessToken='+token)
        .end((err, res) => {
          assert.isNotNull(res.body);
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(token).to.be.a('string');
          expect(token).to.have.lengthOf(16);
          expect(res.body).to.be.an("array");
          expect("Content-Type", "application/json");
       });
     });
   });

});

//GET POST EDIT AND DELETE CART WITHOUT LOGIN 
describe("/ACCESS cart without correct login", () => {
  //GET CART WITHOUT LOGGING IN
  it("Should return error if user tries to GET cart without loging in correctly", async function () { 
    chai
    .request(server)
      .post("/api/login")
      .send()
      .end((err, res) => {
        //act
        chai
          .request(server)
          .get('/api/me/cart?accessToken=')
          .end((err, res) => {
            expect(res).to.have.status(401);
            expect("Content-Type", "header");
        });
      });
    });

  //ADD TO CART WIHTOUT LOGGING IN
  it("Should return error if user tries POST/ ADD to cart without logging in correctly", async function () { 
    chai
    .request(server)
      .post("/api/login")
      .send()
      .end((err, res) => {
        //act
        chai
          .request(server)
          .post('/api/me/cart?accessToken=')
          .end((err, res) => {
            expect(res).to.have.status(401);
            expect("Content-Type", "header");
        });
      });
    });

    //DELETE ITEM FROM CART WITHOUT LOGGIN IN
    it("Should return error if user tries to DELETE cart without logging in correctly", async function () { 
      chai
      .request(server)
        .post("/api/login")
        .send()
        .end((err, res) => {
          //act
          chai
            .request(server)
            .delete('/api/me/cart/1?accessToken=')
            .end((err, res) => {
              expect(res).to.have.status(401);
              expect("Content-Type", "header");
          });
        });
      });    

    //EDIT QUANTITY OF PRODICTS IN CART WITHOUT LOGGING IN
    it("Should return error if user tries to POST / EDIT cart products without logging in correctly", async function () { 
      chai
      .request(server)
        .post("/api/login")
        .send()
        .end((err, res) => {
           //act
          chai
            .request(server)
            .post('/api/me/cart/1?accessToken=')
            .end((err, res) => {
              expect(res).to.have.status(401);
              expect("Content-Type", "header");
            });
          });
        });    
});




