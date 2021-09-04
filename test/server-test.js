const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require('../app/server.js');

const should = chai.should();

chai.use(chaiHttp);

let token = '';

describe('Brands', () => {
  describe('/GET brands', () => {
    it ('should GET all brands', (done) => {
      chai.request(server)
      .get('/api/brands')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(5);
        done();
      })
    })

    it ("should GET all of a brand's products by id", (done) => {
      const oakley = [
        {
          id: "1",
          categoryId: "1",
          name: "Superglasses",
          description: "The best glasses in the world",
          price:150,
          imageUrls:["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        },
        {
            id: "2",
            categoryId: "1",
            name: "Black Sunglasses",
            description: "The best glasses in the world",
            price:100,
            imageUrls:["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        },
        {
            id: "3",
            categoryId: "1",
            name: "Brown Sunglasses",
            description: "The best glasses in the world",
            price:50,
            imageUrls:["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        },
      ]

      chai.request(server)
      .get('/api/brands/1/products')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.eql(oakley);
        done();
      })
    })

    it ("should return 404 if an invalid id is passed", (done) => {
      chai.request(server)
      .get('/api/brands/6/products')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      })
    })
  })    
})

describe('Products', () => {
  describe('/GET products', () => {
    it ('should GET all products', (done) => {
      chai.request(server)
      .get('/api/products')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(11);
        done();
      })
    })

    it ('should GET all products that match a query', (done) => {
      const glasses = [
        {
          id: "1",
          categoryId: "1",
          name: "Superglasses",
          description: "The best glasses in the world",
          price:150,
          imageUrls:["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        },
        {
          id: "2",
          categoryId: "1",
          name: "Black Sunglasses",
          description: "The best glasses in the world",
          price:100,
          imageUrls:["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        },
        {
          id: "3",
          categoryId: "1",
          name: "Brown Sunglasses",
          description: "The best glasses in the world",
          price:50,
          imageUrls:["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        },
        {
          id: "4",
          categoryId: "2",
          name: "Better glasses",
          description: "The best glasses in the world",
          price:1500,
          imageUrls:["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        },
        {
          id: "5",
          categoryId: "2",
          name: "Glasses",
          description: "The most normal glasses in the world",
          price:150,
          imageUrls:["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        },
        {
          id: "7",
          categoryId: "3",
          name: "QDogs Glasses",
          description: "They bark",
          price:1500,
          imageUrls:["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        },
      ]

      chai.request(server)
      .get('/api/products?query=glasses')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.eql(glasses);
        done();
      })
    })

    it ('should GET the product with the passed id', (done) => {
      const product = {
        id: "3",
        categoryId: "1",
        name: "Brown Sunglasses",
        description: "The best glasses in the world",
        price:50,
        imageUrls:["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      }

      chai.request(server)
      .get('/api/products/3')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.eql(product);
        done();
      })
    })

    it ('should not GET any products when there are no query matches', (done) => {
      chai.request(server)
      .get('/api/products?query=reallycoolsunglasses')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.eql([]);
        done();
      })
    })

    it ('should return 404 if an invalid id is passed', (done) => {
      chai.request(server)
      .get('/api/products/33')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      })
    })
  })
})

describe('User', () => {
  describe('/POST login', () => {
    it ('should return an access token for the user logging in', (done) => {
      const user = {
        username: 'yellowleopard753',
        password: 'jonjon'
      }

      chai.request(server)
      .post('/api/login')
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('username');
        res.body.should.have.property('lastUpdated');
        res.body.should.have.property('token');

        token = res.body.token;
        done();
      })
    })

    it ('should return 401 if the user inputs an invalid username or password', (done) => {     
      const user = {
        username: 'wrongusername',
        password: 'wrongpassword'
      }

      chai.request(server)
      .post('/api/login')
      .send(user)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      })
    })

    it ('should return 400 if the request is missing a username or password', (done) => {
      const user = {}

      chai.request(server)
      .post('/api/login')
      .send(user)
      .end((err, res) => {
        res.should.have.status(400);
        done();
      })
    })
  })
})

describe('Cart', () => {
  describe('/GET cart', () => {
    it ("should GET the currently logged in user's cart", (done) => {
      chai.request(server)
      .get(`/api/me/cart?accessToken=${token}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        done();
      })
    })

    it ("should return 401 if the access token is invalid", (done) => {
      chai.request(server)
      .get('/api/me/cart?accessToken=thisisabadtoken')
      .end((err, res) => {
        res.should.have.status(401);
        done();
      })
    })
  })

  describe('/POST cart', () => {
    it ("should POST the specified product to the user's cart", (done) => {
      const product = {
        id: '7'
      }

      const responseCart = [
        {
          quantity: 1,
          product: {
            id: "7",
            categoryId: "3",
            name: "QDogs Glasses",
            description: "They bark",
            price:1500,
            imageUrls:["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
          }
        }     
      ]

      chai.request(server)
      .post(`/api/me/cart?accessToken=${token}`)
      .send(product)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.eql(responseCart);
        done();
      })
    })

    it ('should return 404 if an invalid product is passed', (done) => {
      const product = {
        id: '63'
      }

      chai.request(server)
      .post(`/api/me/cart?accessToken=${token}`)
      .send(product)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      })
    })

    it ('should return 401 if the access token is invalid', (done) => {
      const product = {
        id: '3'
      }

      chai.request(server)
      .post('/api/me/cart?accessToken=thisisabadtoken')
      .send(product)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      })
    })
  })

  describe('/POST cart item', () => {
    it ('should update the quantity of an item in the cart', (done) => {
      const quantity = {
        count: 4
      }

      const responseObj = {
        quantity: 4,
        product: {
          id: "7",
          categoryId: "3",
          name: "QDogs Glasses",
          description: "They bark",
          price:1500,
          imageUrls:["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        }
      }     

      chai.request(server)
      .post(`/api/me/cart/7?accessToken=${token}`)
      .send(quantity)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.eql(responseObj);
        done();
      })
    })

    it ("should return 404 if the passed product isn't in the cart", (done) => {
      const quantity = {
        count: 4
      }

      chai.request(server)
      .post(`/api/me/cart/21?accessToken=${token}`)
      .send(quantity)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      })
    })

    it ("should return 400 if the passed quantity isn't an integer", (done) => {
      const quantity = {
        count: '4'
      }

      chai.request(server)
      .post(`/api/me/cart/7?accessToken=${token}`)
      .send(quantity)
      .end((err, res) => {
        res.should.have.status(400);
        done();
      })
    })

    it ("should return 400 if the passed quantity is less than 1", (done) => {
      const quantity = {
        count: -1
      }

      chai.request(server)
      .post(`/api/me/cart/7?accessToken=${token}`)
      .send(quantity)
      .end((err, res) => {
        res.should.have.status(400);
        done();
      })
    })
  })

  describe('/DELETE cart', () => {
    it ("should remove the specified product from the user's cart", (done) => {
      chai.request(server)
      .delete(`/api/me/cart/7?accessToken=${token}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.eql([]);
        done();
      })
    })

    it ("should return 404 if the passed product isn't in the cart before deletion", (done) => {
      chai.request(server)
      .delete(`/api/me/cart/47?accessToken=${token}`)
      .end((err, res) => {
        res.should.have.status(404);
        done();
      })
    })

    it ("should return 401 if the access token is invalid", (done) => {
      chai.request(server)
      .delete(`/api/me/cart/7?accessToken=thisisabadtoken`)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      })
    })
  })
})