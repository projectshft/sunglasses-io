let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe ('Products', () => {
  
  describe('/GET api/products', () => {
    it('it should GET all of the products', done => {
      chai
        .request(server)
        .get('/api/products')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.forEach(e => {
            e.should.have.property('id');
            e.should.have.property('categoryId');
            e.should.have.property('name');
            e.should.have.property('description');
            e.should.have.property('price');
            e.should.have.property('imageUrls');
          });
          done();
        });
    });
  });
});

describe ('Brands', () => {
  //local storage
  let brands = [];

  describe('/GET api/brands', () => {
    it('it should GET the brands', done => {
      chai
        .request(server)
        .get('/api/brands')
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.forEach(e => {
            e.should.have.property('id');
            e.should.have.property('name');
          });
          brands = response.body;
          done();
        });
    });
  });

  describe('/GET api/brands/:id/products', () => {
    it('it should GET all products with a certain brand id.', done => {
      brands.forEach(brand => {
        chai
        .request(server)
        .get(`/api/brands/${brand.id}/products`)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.forEach(e => {
            e.categoryId.should.equal(brand.id);
          });
        });
      });
      done();
    })

    it('it should FAIL if the brand id is not legitimate.', done => {
      let allLegitBrandIds = [];
      brands.forEach(brand => allLegitBrandIds.push(parseInt(brand.id)));
      let illegitBrandId = Math.floor(Math.random() * 50);
      while (allLegitBrandIds.includes(illegitBrandId)) {
        illegitBrandId = Math.floor(Math.random() * 50);
      }
      chai
        .request(server)
        .get(`/api/brands/${illegitBrandId}/products`)
        .end((error, response) => {
          response.should.have.status(404);
          done();
        });
      });
    });

});


describe ('Login', () => {
  //dummy data to use for Login/cart tests
  let currentAccessToken = '';
  const productToKeep = {
    id: '1',
    categoryId: '1',
    name: 'Superglasses',
    description: 'The best glasses in the world',
    price: 150,
    imageUrls: [
      'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
      'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
      'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg'
    ]
  }

  const productToDelete = {
    id: '11',
    categoryId: '5',
    name: 'Habanero',
    description: 'The spiciest glasses in the world',
    price: 153,
    imageUrls: [
      'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
      'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
      'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg'
    ]
  }

  //missing price key
  const badlyFormattedProduct = {
    id: 1,
    categoryId: 1,
    name: 'Superglasses',
    description: 'The best glasses in the world',
    imageUrls: [
      "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
      "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
      "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
    ]
  }

  const missingProduct = {
    id: 6,
    categoryId: 6,
    name: 'doggie glasses',
    description: 'glasses for your dog',
    price: 1500,
    imageUrls: [
      "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
      "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
      "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
    ]
  }

  describe ('/POST /api/login', () => {
    it('it should LOGIN a user with a valid login', done => {
      
      const goodLoginAttempt = {
        username: 'yellowleopard753',
        password: "jonjon"
      }
      
      chai
        .request(server)
        .post('/api/login')
        .send(goodLoginAttempt)
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.a('string');
          currentAccessToken = response.body;
          done();
        })
    });

    it('it should REJECT a user with an poorly formatted login', done => {
      const poorlyFormattedLoginAttempt = {
        username: 'redelephant864'
      }
      
      chai
        .request(server)
        .post('/api/login')
        .send(poorlyFormattedLoginAttempt)
        .end((error, response) => {
          response.should.have.status(400)
          done();
        })
    });

    it('it should REJECT a user who does not send login info', done => {      
      chai
        .request(server)
        .post('/api/login')
        .end((error, response) => {
          response.should.have.status(400)
          done();
        })
    });


    it('it should REJECT a user with an incorrect username or password', done => {
      let badLoginAttempt = {
        username: 'redelephant864',
        password: 'whatever'
      }
      
      chai
        .request(server)
        .post('/api/login')
        .send(badLoginAttempt)
        .end((error, response) => {
          response.should.have.status(401);
          done();
        })
    });

  });

  describe ('GET/ api/me/cart', () => {
    it('it should FAIL if there is no Access Token in the URL.', done => {
      chai
        .request(server)
        .get('/api/me/cart')
        .end((error, response) => {
          response.should.have.status(401);
          done();
        })
    });

    it('it should FAIL if there is an invalid Access Token Key.', done => {
      chai
        .request(server)
        .get('/api/me/cart?accessToken=456421354')
        .end((error, response) => {
          response.should.have.status(403);
          done();
        })
    });

    it('it should GET the users cart successfully.', done => {
      chai
        .request(server)
        .get(`/api/me/cart?accessToken=${currentAccessToken}`)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          done();
        })
    });

  });

  describe ('POST/ api/me/cart', () => {

    it('it should FAIL if there is no Access Token in the URL.', done => {
      chai
        .request(server)
        .post('/api/me/cart')
        .send(productToKeep)
        .end((error, response) => {
          response.should.have.status(401);
          done();
        })
    });

    it('it should FAIL if there is an invalid Access Token Key.', done => {
      chai
        .request(server)
        .post('/api/me/cart?accessToken=456446541065421354')
        .send(productToKeep)
        .end((error, response) => {
          response.should.have.status(403);
          done();
        })
    });

    it('it should FAIL if the product is missing from the request', done => {
      chai
        .request(server)
        .post(`/api/me/cart?accessToken=${currentAccessToken}`)
        .end((error, response) => {
          response.should.have.status(415);
          done();
        })
    });

    it('it should FAIL if the product has invalid syntax.', done => {
      chai
        .request(server)
        .post(`/api/me/cart?accessToken=${currentAccessToken}`)
        .send(badlyFormattedProduct)
        .end((error, response) => {
          response.should.have.status(400);
          done();
        })
    });

    it('it should FAIL if the product sent is not in the database.', done => {
      chai
        .request(server)
        .post(`/api/me/cart?accessToken=${currentAccessToken}`)
        .send(missingProduct)
        .end((error, response) => {
          response.should.have.status(404);
          done();
        })
    });

    it('it should POST the product to the cart if the product sent is in the database (but not in the cart).', done => {
      chai
        .request(server)
        .post(`/api/me/cart?accessToken=${currentAccessToken}`)
        .send(productToKeep)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.should.deep.include({'product':productToKeep, 'quantity':1});
          done();
        })
    });

    it('if the product is in the database AND is already in the cart, it should INCREASE the quantity by 1.', done => {
      chai
        .request(server)
        .post(`/api/me/cart?accessToken=${currentAccessToken}`)
        .send(productToKeep)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.should.deep.include({product:productToKeep, quantity:2});
          done();
        })
    });

  });

  describe ('DELETE/ api/me/cart/:productId', () => {

    it('it should POST a product for us to delete', done => {
      chai
        .request(server)
        .post(`/api/me/cart?accessToken=${currentAccessToken}`)
        .send(productToDelete)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('array');
          response.body.should.deep.include({'product':productToDelete, 'quantity':1});
          done();
        })
    });

    it('it should FAIL if there is no Access Token in the URL.', done => {
      chai
        .request(server)
        .delete(`/api/me/cart/${productToKeep.id}`)
        .end((error, response) => {
          response.should.have.status(401);
          done();
        })
    });

    it('it should FAIL if there is an invalid Access Token Key.', done => {
      chai
        .request(server)
        .delete(`/api/me/cart/${productToKeep.id}?accessToken=456446541065421354`)
        .end((error, response) => {
          response.should.have.status(403);
          done();
        })
    });

    it('it should FAIL if the productId does not match any product in the users cart.', done => {
      chai
        .request(server)
        .delete(`/api/me/cart/4567?accessToken=${currentAccessToken}`)
        .end((error, response) => {
          response.should.have.status(404);
          done();
        })
    });

    it('it should DELETE the product if it is found in the users cart.', done => {
      chai
        .request(server)
        .delete(`/api/me/cart/${productToDelete.id}?accessToken=${currentAccessToken}`)
        .end((error, response) => {
          response.should.have.status(200);
          done();
        })
    });
  });

  //POST
  describe ('POST/ api/me/cart/:productId', () => {
    const  newQuantity = {quantity: 35};

    it('it should FAIL if there is no Access Token in the URL.', done => {
      chai
        .request(server)
        .post(`/api/me/cart/${productToKeep.id}`)
        .send(newQuantity)
        .end((error, response) => {
          response.should.have.status(401);
          done();
        })
    });

    it('it should FAIL if there is an invalid Access Token Key.', done => {
      chai
        .request(server)
        .post(`/api/me/cart/${productToKeep.id}?accessToken=456446adfas541065421354`)
        .send(newQuantity)
        .end((error, response) => {
          response.should.have.status(403);
          done();
        })
    });

    it('it should FAIL if the productId does not match any product in the users cart.', done => {
      chai
        .request(server)
        .post(`/api/me/cart/4568567?accessToken=${currentAccessToken}`)
        .send(newQuantity)
        .end((error, response) => {
          response.should.have.status(404);
          done();
        })
    });

    it('it should FAIL if a new quantity is not sent.', done => {
      chai
        .request(server)
        .post(`/api/me/cart/${productToKeep.id}?accessToken=${currentAccessToken}`)
        .end((error, response) => {
          response.should.have.status(400);
          done();
        })
    });

    it('it should UPDATE the product in the cart to a new quantity', done => {
      chai
        .request(server)
        .post(`/api/me/cart/${productToKeep.id}?accessToken=${currentAccessToken}`)
        .send(newQuantity)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.deep.include({product:productToKeep, quantity:newQuantity.quantity});
          done();
        })
    });

  });

});