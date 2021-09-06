const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
let should = chai.should();

let testAccessToken = null;

chai.use(chaiHTTP);

//test (/products) endpoint
describe('/GET Products', () => {
  it("it should GET all the products", (done) => {
    chai
      .request(server)
      .get("/api/products")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.length.should.be.eql(11);
        done();
      })
  })

  it("it should GET all the products that match a query", (done) => {
    const mockResponse = [
      {
        "id": "2",
        "categoryId": "1",
        "name": "Black Sunglasses",
        "description": "The best glasses in the world",
        "price": 100,
        "imageUrls": [
        "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
        "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
        "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
        ]
        },
        {
        "id": "3",
        "categoryId": "1",
        "name": "Brown Sunglasses",
        "description": "The best glasses in the world",
        "price": 50,
        "imageUrls": [
        "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
        "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
        "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
        ]
        }
      ]

    chai
      .request(server)
      .get("/api/products/?query=sunglasses")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.length.should.be.eql(2);
        res.body.should.eql(mockResponse);
        done();
      })
  })

  it("it should return an error if nothing matches the query", (done) => {
    chai
      .request(server)
      .get("/api/products/?query=shirts")
      .end((err, res) => {
        res.should.have.status(404);
        done();
      })
  })
});

//test (/brands) endpoint
describe('/GET Brands', () => {
  const mockResponse = [
    {
        "id": "1",
        "name" : "Oakley"
    },
    {
        "id": "2",
        "name" : "Ray Ban"
    },
    {
        "id": "3",
        "name" : "Levi's"
    },
    {
        "id": "4",
        "name" : "DKNY"
    },
    {
        "id": "5",
        "name" : "Burberry"
    }
]

  it("it should GET all the brands", (done) => {
    chai
      .request(server)
      .get("/api/brands")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.length.should.be.eql(5);
        res.body.should.be.eql(mockResponse)
        done();
      })
  })

  //test (/brands/:id/products) endpoint
  it("it should GET all of the products for a specific brand", (done) => {
    const mockResponse = [
      {
      "id": "1",
      "categoryId": "1",
      "name": "Superglasses",
      "description": "The best glasses in the world",
      "price": 150,
      "imageUrls": [
      "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
      "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
      "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
      ]
      },
      {
      "id": "2",
      "categoryId": "1",
      "name": "Black Sunglasses",
      "description": "The best glasses in the world",
      "price": 100,
      "imageUrls": [
      "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
      "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
      "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
      ]
      },
      {
      "id": "3",
      "categoryId": "1",
      "name": "Brown Sunglasses",
      "description": "The best glasses in the world",
      "price": 50,
      "imageUrls": [
      "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
      "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
      "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
      ]
      }
      ]

    chai
      .request(server)
      .get("/api/brands/1/products")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.length.should.be.eql(3);
        res.body.should.be.eql(mockResponse);
        done();
      })
  })

  it("it should return an ERROR if no brands match the specified ID", (done) => {
    chai
      .request(server)
      .get("/api/brands/6/products")
      .end((err, res) => {
        res.should.have.status(404);
        done();
      })
  })
});

//test (/login) endpoint
describe('/POST Login', () => {
  it("it should POST login credentials and return access token if valid", (done) => {
    const login = {
      username: "yellowleopard753",
      password: "jonjon"
    }

    chai
      .request(server)
      .post("/api/login")
      .send(login)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("string");
        testAccessToken = res.body;
        done();
      })
  })

  it("it should return an ERROR if the user leaves out a credential", (done) => {
    const login1 = {
      username: "",
      password: "jonjon"
    }
    const login2 = {
      username: "yellowleopard753",
      password: ""
    }
    const login3 = {
      username: "",
      password: ""
    }

    chai
      .request(server)
      .post("/api/login")
      .send(login1)
      .end((err, res) => {
        res.should.have.status(400);
      })
      chai
      .request(server)
      .post("/api/login")
      .send(login2)
      .end((err, res) => {
        res.should.have.status(400);
      })
      chai
      .request(server)
      .post("/api/login")
      .send(login3)
      .end((err, res) => {
        res.should.have.status(400);
        done();
      })
  })

  it("it should return an ERROR if the user enters invalid credentials", (done) => {
    const login1 = {
      username: "redtiger753",
      password: "jonjon"
    }
    const login2 = {
      username: "yellowleopard753",
      password: "bonbon"
    }
    const login3 = {
      username: "catlover",
      password: "dogsareokaytoo"
    }

    chai
      .request(server)
      .post("/api/login")
      .send(login1)
      .end((err, res) => {
        res.should.have.status(401);
      })
      chai
      .request(server)
      .post("/api/login")
      .send(login2)
      .end((err, res) => {
        res.should.have.status(401);
      })
      chai
      .request(server)
      .post("/api/login")
      .send(login3)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      })
  })
});

//test (/me/cart) endpoint to view cart
describe('/GET Cart', () => {
  it("it should GET a logged-in user's cart", (done) => {
    chai
      .request(server)
      .get(`/api/me/cart?accessToken=${testAccessToken}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.should.be.eql([]);
        done();
      })
  })

  it("it should return an ERROR if the user is not logged in or has an invalid access token", (done) => {
    chai
      .request(server)
      .get(`/api/me/cart?accessToken=`)
      .end((err, res) => {
        res.should.have.status(401);
      })
      chai
      .request(server)
      .get(`/api/me/cart?accessToken=invalid`)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      })
  })
});

//test (/me/cart) endpoint to add product to cart
describe('/POST Cart', () => {
  it("it should POST a specific product into the user's cart", (done) => {
    const mockResponse = [
      {
          "product": {
              "id": "1",
              "categoryId": "1",
              "name": "Superglasses",
              "description": "The best glasses in the world",
              "price": 150,
              "imageUrls": [
                  "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
                  "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
                  "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
              ]
          },
          "quantity": 1
      }
  ]

    const product = {
      id: "1"
    }
    
    chai
      .request(server)
      .post(`/api/me/cart?accessToken=${testAccessToken}`)
      .send(product)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.length.should.be.eql(1);
        res.body.should.be.eql(mockResponse)
        done();
      })
  })

  it("it should return an ERROR if no product ID is submitted", (done) => {
    const mockProduct1 = {}

    chai
      .request(server)
      .post(`/api/me/cart?accessToken=${testAccessToken}`)
      .send(mockProduct1)
      .end((err, res) => {
        res.should.have.status(400);
        done();
      })
    })

  it("it should return an ERROR if the user is not logged in or has an invalid access token", (done) => {
    chai
      .request(server)
      .post(`/api/me/cart?accessToken=`)
      .end((err, res) => {
        res.should.have.status(401);
      })
      chai
      .request(server)
      .post(`/api/me/cart?accessToken=invalid`)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      })
  })

  it("it should return an ERROR if the submitted product ID is not found", (done) => {
    const mockProduct2 = {
      id: 20
    }

    chai
      .request(server)
      .post(`/api/me/cart?accessToken=${testAccessToken}`)
      .send(mockProduct2)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      })
  })
});

//test (/me/cart/:productId) endpoint to change quantity of a cart product
describe('/POST Cart Quantity', () => {
  it("it should CHANGE the quantity of a specific product in the user's cart", (done) => {
    const mockResponse = [
      {
          "product": {
              "id": "1",
              "categoryId": "1",
              "name": "Superglasses",
              "description": "The best glasses in the world",
              "price": 150,
              "imageUrls": [
                  "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
                  "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
                  "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
              ]
          },
          "quantity": 5
      }
  ]
    
    const change5 = {
      quantity: 5
    }

    chai
      .request(server)
      .post(`/api/me/cart/1?accessToken=${testAccessToken}`)
      .send(change5)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.length.should.be.eql(1);
        res.body.should.be.eql(mockResponse);
        done();
      })
  })

  it("it should return an ERROR if an invalid quantity is submitted", (done) => {
    const changeNull = {
      quantity: null
    }
    const change0 = {
      quantity: 0
    }
    const changeNeg1 = {
      quantity: -1
    }

    chai
      .request(server)
      .post(`/api/me/cart/1?accessToken=${testAccessToken}`)
      .send(changeNull)
      .end((err, res) => {
        res.should.have.status(400);
      })
      chai
      .request(server)
      .post(`/api/me/cart/1?accessToken=${testAccessToken}`)
      .send(change0)
      .end((err, res) => {
        res.should.have.status(400);
      })
      chai
      .request(server)
      .post(`/api/me/cart/1?accessToken=${testAccessToken}`)
      .send(changeNeg1)
      .end((err, res) => {
        res.should.have.status(400);
        done();
      })
    })

  it("it should return an ERROR if the user is not logged in or has an invalid access token", (done) => {
    chai
      .request(server)
      .post(`/api/me/cart/1?accessToken=`)
      .end((err, res) => {
        res.should.have.status(401);
      })
      chai
      .request(server)
      .post(`/api/me/cart/1?accessToken=invalid`)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      })
  })

  it("it should return an ERROR if the specified product is not in the user's cart", (done) => {
    const change10 = {
      quantity: 10
    }

    chai
      .request(server)
      .post(`/api/me/cart/20?accessToken=${testAccessToken}`)
      .send(change10)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      })
  })
});

//test (/me/cart/:productId) endpoint to remove product from cart
describe('/DELETE Cart', () => {
  it("it should DELETE a specific product from the user's cart", (done) => {
    chai
      .request(server)
      .delete(`/api/me/cart/1?accessToken=${testAccessToken}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.length.should.be.eql(0);
        done();
      })
  })

  it("it should return an ERROR if the user is not logged in or has an invalid access token", (done) => {
    chai
      .request(server)
      .delete(`/api/me/cart/1?accessToken=`)
      .end((err, res) => {
        res.should.have.status(401);
      })
      chai
      .request(server)
      .delete(`/api/me/cart/1?accessToken=invalid`)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      })
  })

  it("it should return an ERROR if the specified product is not in the user's cart", (done) => {
    chai
      .request(server)
      .delete(`/api/me/cart/20?accessToken=${testAccessToken}`)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      })
  })
});
