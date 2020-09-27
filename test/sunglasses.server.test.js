const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');
const expect = chai.expect;
const assert = chai.assert;

const should = chai.should();

chai.use(chaiHttp);

//GET BRANDS
describe('GET/ brands of sunglasses', () => {
  it('should GET all the sunglasses brands', (done) => {
    // act
    chai
      .request(server)
      .get('/api/brands')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(6);
        done();
      });
  });

  it('should ERROR if there are no brands', (done) => {
    //arrange: an empty array of brands
    // act
    chai
      .request(server)
      .get('/api/brands_empty')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(204);
        done();
      });
  });
});

//GET PRODUCTS BY BRAND ID
describe('GET/ products by brand Id', () => {
  it('should GET all the products from one brand of sunglasses', (done) => {
    //arrange: a valid brandId in path
    // act
    chai
      .request(server)
      .get('/api/brands/1/products')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(3);
        done();
      });
  });

  it('should ERROR if brandId does not exist', (done) => {
    //arrange: an invalid brandId in path
    // act
    chai
      .request(server)
      .get('/api/brands/100/products')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(204);
        done();
      });
  });

  it('should ERROR if brandId is a letter instead of number', (done) => {
    //arrange: an invalid brandId in path -- letters
    // act
    chai
      .request(server)
      .get('/api/brands/Adidas/products')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(204);
        done();
      });
  });

  it('should ERROR if no products are found for the brand', (done) => {
    //arrange: a valid brandId with no associated products
    // act
    chai
      .request(server)
      .get('/api/brands/6/products')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(204);
        done();
      });
  });

  it('should ERROR if no brandId is included', (done) => {
    //arrange: omit brandId
    // act
    chai
      .request(server)
      .get('/api/brands//products')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(400);
        done();
      });
  });
});

//GET PRODUCTS
describe('GET/ products by a search term', () => {
  it('should return unique results that match unique query string (a 1:1 match)', (done) => {
    //arrange: valid searchTerm
    // act
    chai
      .request(server)
      .get('/api/products?searchTerm=Peanut%20Butter')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(1);
        done();
      });
  });

  it('should return multiple results that match unique query string (a 1:many match)', (done) => {
    //arrange: valid searchTerm w/ multiple matches
    // act
    chai
      .request(server)
      .get('/api/products?searchTerm=Glasses')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(6);
        done();
      });
  });

  it('should ERROR if no product matches query string', (done) => {
    //arrange: a searchTerm with no product matches
    // act
    chai
      .request(server)
      .get('/api/products?searchTerm=gibberish123')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(204);
        done();
      });
  });

  it('should ERROR if query string is blank', (done) => {
    //arrange: searchTerm omitted
    // act
    chai
      .request(server)
      .get('/api/products?searchTerm=')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(400);
        done();
      });
  });
});

//POST LOGIN REQUEST
describe('POST/ user login', () => {
  it('should allow existing users to login', (done) => {
    //arrange: a valid username/password query string
    // act
    chai
      .request(server)
      .post('/api/login?username=yellowleopard753&password=jonjon')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(200);
        res.body.should.be.an('object');
        done();
      });
  });

  it('should ERROR when invalid username/password combination entered', (done) => {
    //arrange: invalid username/pswd in query string
    // act
    chai
      .request(server)
      .post('/api/login/?username=MissMaddie&password=jonjon')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });

  it('should ERROR when username is excluded', (done) => {
    //arrange: no username in query string
    // act
    chai
      .request(server)
      .post('/api/login/?username=&password=jonjon')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(400);
        done();
      });
  });

  it('should ERROR when password is excluded', (done) => {
    //arrange: no password in query string
    // act
    chai
      .request(server)
      .post('/api/login/?username=yellowleopard753&password=')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(400);
        done();
      });
  });

  it('should ERROR when >=3 failed login attempts', (done) => {
    //arrange: hardcoded 3 failed attempts in server for this new user. Invalid password in query string
    // act
    chai
      .request(server)
      .post('/api/login/?username=ArtFreak123&password=ILoveArt')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(403);
        done();
      });
  });
});

//GET CART
describe('GET/ currentUser cart', () => {
  it('should GET cart for user with valid access token', (done) => {
    //arrange: a valid, current token with valid user
    let accessToken = {
      username: 'yellowleopard753',
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .get('/api/me/cart')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(200);
        res.body.should.be.an('array');
        done();
      });
  });

  it('should ERROR if access token is out of date', (done) => {
    //arrange: valid username and accessToken.token, but out of date
    let accessToken = {
      username: 'yellowleopard753',
      lastUpdated: 'Wed Sep 23 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .get('/api/me/cart')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });

  it('should ERROR if access token (accessToken.token) is not valid', (done) => {
    //arrange: valid username and date but token does not match hardcoded value for user
    let accessToken = {
      username: 'yellowleopard753',
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '1234567891234567',
    };
    // act
    chai
      .request(server)
      .get('/api/me/cart')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });

  it('should ERROR if no access token is provided', (done) => {
    //arrange: no access token provided.
    // act
    chai
      .request(server)
      .get('/api/me/cart')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });

  it('should ERROR if access token does not contain username', (done) => {
    //arrange: current, valid access token w/out username
    let accessToken = {
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .get('/api/me/cart')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });

  it('should ERROR if access token contains invalid username', (done) => {
    //arrange: current, valid token with invalid username
    let accessToken = {
      username: 'MissMaddieWiggums',
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .get('/api/me/cart')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });
});

//POST PRODUCT TO A CART
describe('POST/ product to currentUser cart', () => {
  it('should POST a new product to the currentUser cart', (done) => {
    //arrange: a valid, current token with valid user; valid productId to add
    let accessToken = {
      username: 'yellowleopard753',
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .post('/api/me/cart?productId=2')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(2);
        done();
      });
  });

  it('should ERROR if no productId matches query string', (done) => {
    //arrange: a valid, current token with valid user. Invalid productId
    let accessToken = {
      username: 'yellowleopard753',
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .post('/api/me/cart?productId=18')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(204);
        done();
      });
  });

  it('should ERROR if productId is a letter instead of number', (done) => {
    //arrange: a valid, current token with valid user. Letters for productId
    let accessToken = {
      username: 'yellowleopard753',
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .post('/api/me/cart?productId=beard_wax')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(204);
        done();
      });
  });

  it('should ERROR if productId query string is blank', (done) => {
    //arrange: a valid, current token with valid user. No productId query string
    let accessToken = {
      username: 'yellowleopard753',
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .post('/api/me/cart')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(400);
        done();
      });
  });

  it('should ERROR if access token is out of date', (done) => {
    //arrange: valid username and accessToken.token, but out of date. Valid productId.
    let accessToken = {
      username: 'yellowleopard753',
      lastUpdated: 'Wed Sep 23 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .post('/api/me/cart?productId=2')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });

  it('should ERROR if access token is missing a date', (done) => {
    //arrange: valid username and accessToken.token, but missing date. Valid productId.
    let accessToken = {
      username: 'yellowleopard753',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .post('/api/me/cart?productId=2')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });

  it('should ERROR if access token (accessToken.token) is not valid', (done) => {
    //arrange: valid username and date but accessToken.token invalid. Valid productId.
    let accessToken = {
      username: 'yellowleopard753',
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: 'mumbojumbo',
    };
    // act
    chai
      .request(server)
      .post('/api/me/cart?productId=2')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });

  it('should ERROR if access token (accessToken.token) is missing', (done) => {
    //arrange: valid username and date but accessToken.token missing. Valid productId.
    let accessToken = {
      username: 'yellowleopard753',
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
    };
    // act
    chai
      .request(server)
      .post('/api/me/cart?productId=2')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });

  it('should ERROR no access token is provided', (done) => {
    //arrange: no access token. Valid productId.
    // act
    chai
      .request(server)
      .post('/api/me/cart?productId=2')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });

  it('should ERROR if access token does not contain username', (done) => {
    //arrange: current, valid token w/out username. Valid productId
    let accessToken = {
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .post('/api/me/cart?productId=2')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });

  it('should ERROR if access token contains invalid username', (done) => {
    //arrange: current, valid token with an invalid username. Valid productId
    let accessToken = {
      username: 'MissMaddieWiggums',
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .post('/api/me/cart?productId=2')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });
});

describe('DELETE/ product from currentUser cart', () => {
  it('should DELETE a product from the currentUser cart', (done) => {
    //arrange: a valid, current token with valid user. Valid productId to delete
    let accessToken = {
      username: 'yellowleopard753',
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .delete('/api/me/cart/1')
      .send(accessToken)
      // assert : we expect cart.length = 1 because of additions and deletions in previous tests
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(1);
        done();
      });
  });

  it('should ERROR if no product matches productId', (done) => {
    //arrange: a valid, current token with valid user. Invalid productId to delete
    let accessToken = {
      username: 'yellowleopard753',
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .delete('/api/me/cart/18')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(204);
        done();
      });
  });

  it('should ERROR if productId is entered as letters', (done) => {
    //arrange: a valid, current token with valid user. Invalid productId to delete
    let accessToken = {
      username: 'yellowleopard753',
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .delete('/api/me/cart/Sneakers')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(204);
        done();
      });
  });

  it('should ERROR if access token is out of date', (done) => {
    //arrange: valid username and accessToken.token, but out of date. Valid productId to delete
    let accessToken = {
      username: 'yellowleopard753',
      lastUpdated: 'Wed Sep 23 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .delete('/api/me/cart/1')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });

  it('should ERROR if access token is missing a date', (done) => {
    //arrange: valid username and accessToken.token, but missing date. Valid productId to delete
    let accessToken = {
      username: 'yellowleopard753',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .delete('/api/me/cart/1')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });

  it('should ERROR if access token (accessToken.token) is not valid', (done) => {
    //arrange: valid username and date, but accessToken.token invalid. Valid productId to delete
    let accessToken = {
      username: 'yellowleopard753',
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: 'mumbojumbo',
    };
    // act
    chai
      .request(server)
      .delete('/api/me/cart/1')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });

  it('should ERROR if access token (accessToken.token) is missing', (done) => {
    //arrange: valid username and date, but accessToken.token missing. Valid productId to delete
    let accessToken = {
      username: 'yellowleopard753',
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
    };
    // act
    chai
      .request(server)
      .delete('/api/me/cart/1')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });

  it('should ERROR if no access token is provided', (done) => {
    //arrange: no accessToken. Valid productId to delete
    // act
    chai
      .request(server)
      .delete('/api/me/cart/1')
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });

  it('should ERROR if access token does not contain username', (done) => {
    //arrange: valid date and accessToken.token, but no username. Valid productId to delete
    let accessToken = {
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .delete('/api/me/cart/1')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });

  it('should ERROR if access token contains invalid username', (done) => {
    //arrange: valid date and accessToken.token, but invalid username. Valid productId to delete
    let accessToken = {
      username: 'Banana',
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .delete('/api/me/cart/1')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });
});

describe('POST/ a new quantity of an item to currentUser cart', () => {
  it('should POST a new quantity of an item to currentUser cart', (done) => {
    //arrange: a valid, current token with valid user. Valid productId & numberToAdd
    let accessToken = {
      username: 'yellowleopard753',
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .post('/api/me/cart/1?numberToAdd=2')
      .send(accessToken)
      // assert : we expect cart.length = 3 because of additions and deletions in previous tests
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(3);
        done();
      });
  });

  it('should RETURN currentUser cart if no numberToAdd is included', (done) => {
    //arrange: a valid, current token with valid user. No numberToAdd
    let accessToken = {
      username: 'yellowleopard753',
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .post('/api/me/cart/18')
      .send(accessToken)
      // assert : we expect cart.length = 3 because of additions and deletions in previous tests
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(3);
        done();
      });
  });

  it('should ERROR if no product matches productId', (done) => {
    //arrange: a valid, current token with valid user. Invalid productId. Valid numberToAdd
    let accessToken = {
      username: 'yellowleopard753',
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .post('/api/me/cart/18?numberToAdd=2')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(204);
        done();
      });
  });

  it('should ERROR if productId is entered as letters', (done) => {
    //arrange: a valid, current token with valid user. Invalid productId. Valid numberToAdd
    let accessToken = {
      username: 'yellowleopard753',
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .post('/api/me/cart/FleaCollar?numberToAdd=2')
      .send(accessToken)
      // assert
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(204);
        done();
      });
  });

  it('should ERROR if access token is out of date', (done) => {
    //arrange: valid username and accessToken.token, but out of date. Valid productId & numberToAdd
    let accessToken = {
      username: 'yellowleopard753',
      lastUpdated: 'Wed Sep 23 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .post('/api/me/cart/1?numberToAdd=2')
      .send(accessToken)
      // assert : we expect cart.length = 3 because of additions and deletions in previous tests
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });

  it('should ERROR if access token (accessToken.token) is not valid', (done) => {
    //arrange: valid username and date, but accessToken.token invalid. Valid productId & numberToAdd
    let accessToken = {
      username: 'yellowleopard753',
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: 'someGarbage87',
    };
    // act
    chai
      .request(server)
      .post('/api/me/cart/1?numberToAdd=2')
      .send(accessToken)
      // assert : we expect cart.length = 3 because of additions and deletions in previous tests
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });

  it('should ERROR if no access token is provided', (done) => {
    //arrange: no accessToken. Valid productId & numberToAdd
    // act
    chai
      .request(server)
      .post('/api/me/cart/1?numberToAdd=2')
      // assert : we expect cart.length = 3 because of additions and deletions in previous tests
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });

  it('should ERROR if access token does not contain username', (done) => {
    //arrange: valid date and accessToken.token, but no username. Valid productId & numberToAdd
    let accessToken = {
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .post('/api/me/cart/1?numberToAdd=2')
      .send(accessToken)
      // assert : we expect cart.length = 3 because of additions and deletions in previous tests
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });

  it('should ERROR if access token contains invalid username', (done) => {
    //arrange: valid date and accessToken.token, but invalid username. Valid productId & numberToAdd
    let accessToken = {
      username: 'BananaBanana',
      lastUpdated: 'Sun Sep 27 2020 08:44:00 GMT-0400 (Eastern Daylight Time)',
      token: '12345678abcdefgh',
    };
    // act
    chai
      .request(server)
      .post('/api/me/cart/1?numberToAdd=2')
      .send(accessToken)
      // assert : we expect cart.length = 3 because of additions and deletions in previous tests
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect('Content-Type', 'application/json');
        res.should.have.status(401);
        done();
      });
  });
});
