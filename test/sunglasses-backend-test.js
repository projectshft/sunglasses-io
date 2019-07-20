const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');

const should = chai.should();

chai.use(chaiHttp);

describe('Sunglasses.io API', () => {
  describe('GET /brands', () => {
    it('it should get a 200 response', done => {
      chai
        .request(server)
        .get('/brands')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
    
    it('it should return an array', done => {
      chai
        .request(server)
        .get('/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        });
    });

    it('it should return an array of objects', done => {
      chai
        .request(server)
        .get('/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.forEach(item => {
            item.should.be.an('object');
          });
          done();
        });
    });
    
    it('it should return an array of objects with properties id and name', done => {
      chai
        .request(server)
        .get('/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.forEach(item => {
            item.should.be.an('object');
            item.should.have.property('id');
            item.should.have.property('name');
          });
          done();
        });
    });

    it('it should get all brands in sunglasses store', done => {
      chai
        .request(server)
        .get('/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5);
          done();
        });
    });

    it('it should search for and find brand "Oakley"', done => {
      chai
        .request(server)
        .get('/brands?query=Oakley')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);

          res.body[0].should.have.property('id');
          res.body[0].should.have.property('name');

          res.body[0].id.should.equal('1');
          res.body[0].name.should.equal('Oakley');

          done();
        });
    });

    it('it should search for and find brand "oakley" (lowercase)', done => {
      chai
        .request(server)
        .get('/brands?query=oakley')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);

          res.body[0].should.have.property('id');
          res.body[0].should.have.property('name');

          res.body[0].id.should.equal('1');
          res.body[0].name.should.equal('Oakley');

          done();
        });
    });

    it('it should search for and find brand "Ray Ban"', done => {
      chai
        .request(server)
        .get('/brands?query=Ray Ban')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);

          res.body[0].should.have.property('id');
          res.body[0].should.have.property('name');

          res.body[0].id.should.equal('2');
          res.body[0].name.should.equal('Ray Ban');

          done();
        });
    });

    it('it should search for and find brand "ray ban" (lowercase)', done => {
      chai
        .request(server)
        .get('/brands?query=ray ban')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);

          res.body[0].should.have.property('id');
          res.body[0].should.have.property('name');

          res.body[0].id.should.equal('2');
          res.body[0].name.should.equal('Ray Ban');

          done();
        });
    });

    it('it should search for and find brand "Levi\'s"', done => {
      chai
        .request(server)
        .get('/brands?query=Levi\'s')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);

          res.body[0].should.have.property('id');
          res.body[0].should.have.property('name');

          res.body[0].id.should.equal('3');
          res.body[0].name.should.equal('Levi\'s');

          done();
        });
    });
    
    it('it should search for and find brand "levi\'s" (lowercase)', done => {
      chai
        .request(server)
        .get('/brands?query=levi\'s')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);

          res.body[0].should.have.property('id');
          res.body[0].should.have.property('name');

          res.body[0].id.should.equal('3');
          res.body[0].name.should.equal('Levi\'s');

          done();
        });
    });

    it('it should search for and find brand "DKNY"', done => {
      chai
        .request(server)
        .get('/brands?query=DKNY')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);

          res.body[0].should.have.property('id');
          res.body[0].should.have.property('name');

          res.body[0].id.should.equal('4');
          res.body[0].name.should.equal('DKNY');

          done();
        });
    });

    it('it should search for and find brand "dkny" (lowercase)', done => {
      chai
        .request(server)
        .get('/brands?query=dkny')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);

          res.body[0].should.have.property('id');
          res.body[0].should.have.property('name');

          res.body[0].id.should.equal('4');
          res.body[0].name.should.equal('DKNY');

          done();
        });
    });

    it('it should search for and find brand "Burberry"', done => {
      chai
        .request(server)
        .get('/brands?query=Burberry')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);

          res.body[0].should.have.property('id');
          res.body[0].should.have.property('name');

          res.body[0].id.should.equal('5');
          res.body[0].name.should.equal('Burberry');

          done();
        });
    });

    it('it should search for and find brand "burberry" (lowercase)', done => {
      chai
        .request(server)
        .get('/brands?query=burberry')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(1);

          res.body[0].should.have.property('id');
          res.body[0].should.have.property('name');

          res.body[0].id.should.equal('5');
          res.body[0].name.should.equal('Burberry');

          done();
        });
    });

    it('it should search for "ball" and return 404 not found error', done => {
      chai
        .request(server)
        .get('/brands?query=ball')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          res.body.code.should.equal(404);
          res.body.message.should.equal('Brand not found');
          res.body.fields.should.equal('query');
          done();
        });
    });
  });

  describe('GET /brands/{id}/products', () => {
    it('it should get a 200 response', done => {
      //arrange
      const id = 1;

      chai
        .request(server)
        .get(`/brands/${id}/products`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('it should return an array', done => {
      //arrange
      const id = 1;
      //act, assert
      chai
        .request(server)
        .get(`/brands/${id}/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        });
    });

    it('it should return an array of objects', done => {
      //arrange
      const id = 1;
      //act, assert
      chai
        .request(server)
        .get(`/brands/${id}/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.forEach(item => {
            item.should.be.an('object');
          });
          done();
        });
    });

    it('it should return an array of objects with properties id, categoryId, name,description, price, imageUrls', done => {
      //arrange
      const id = 1;
      //act, assert
      chai
        .request(server)
        .get(`/brands/${id}/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.forEach(item => {
            item.should.be.an('object');
            item.should.have.property('id');
            item.should.have.property('categoryId');
            item.should.have.property('name');
            item.should.have.property('description');
            item.should.have.property('price');
            item.should.have.property('imageUrls');
          });
          done();
        });
    });

    it('it should return an array of objects where imageUrls property is an array', done => {
      //arrange
      const id = 1;
      //act, assert
      chai
        .request(server)
        .get(`/brands/${id}/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.forEach(item => {
            item.should.be.an('object');
            item.should.have.property('id');
            item.should.have.property('categoryId');
            item.should.have.property('name');
            item.should.have.property('description');
            item.should.have.property('price');
            item.should.have.property('imageUrls');
            item.imageUrls.should.be.an('array');
          });
          done();
        });
    });

    it('it should return 404 on invalid categoryId', done => {
      //arrange
      const id = 0;
      //act, assert
      chai
        .request(server)
        .get(`/brands/0/products`)
        .end((err, res) => {
          res.should.have.status(404);

          res.body.should.be.an('object');
          res.body.should.have.property('code');
          res.body.should.have.property('message');
          res.body.should.have.property('fields');
        
          res.body.code.should.equal(404);
          res.body.message.should.equal('Brand not found');
          res.body.fields.should.equal('id');
          done();
        });
    });
  });

  describe('GET /products', () => {
    it('it should get a 200 response', done => {
      //arrange
      //assert
      //act
      chai
        .request(server)
        .get(`/products`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('it should return an array', done => {
      //arrange
      //assert
      //act
      chai
        .request(server)
        .get(`/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          done();
        });
    });

    it('it should return an array of objects', done => {
      //arrange
      //assert
      //act
      chai
        .request(server)
        .get(`/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.forEach(element => {
            element.should.be.an('object');
          });
          done();
        });
    });

    it('it should return an array of objects with properties id, categoryId, name,description, price, imageUrls', done => {
      //arrange
      //act, assert
      chai
        .request(server)
        .get(`/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.forEach(item => {
            item.should.be.an('object');
            item.should.have.property('id');
            item.should.have.property('categoryId');
            item.should.have.property('name');
            item.should.have.property('description');
            item.should.have.property('price');
            item.should.have.property('imageUrls');
          });
          done();
        });
    });

    it('it should return an array of objects where imageUrls property is an array', done => {
      //arrange
      //act, assert
      chai
        .request(server)
        .get(`/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.forEach(item => {
            item.should.be.an('object');
            item.should.have.property('id');
            item.should.have.property('categoryId');
            item.should.have.property('name');
            item.should.have.property('description');
            item.should.have.property('price');
            item.should.have.property('imageUrls');
            item.imageUrls.should.be.an('array');
          });
          done();
        });
    });

    //are these two bad tests?
    it('it should return all products from a search of "glasses"', done => {
      //arrange
      const searchTerm = 'glasses';
      //assert
      //act
      chai
        .request(server)
        .get(`/products?query=${searchTerm}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.forEach(element => {
            element.should.be.an('object');
          });
          res.body.length.should.equal(11);
          done();
        });
    });

    it('it should return all products from a search of "Glasses"', done => {
      //arrange
      const searchTerm = 'Glasses';
      //assert
      //act
      chai
        .request(server)
        .get(`/products?query=${searchTerm}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.forEach(element => {
            element.should.be.an('object');
          });
          res.body.length.should.equal(11);
          done();
        });
    });
    
    it('it should return all products from a search of ""', done => {
      //arrange
      const searchTerm = '';
      //assert
      //act
      chai
        .request(server)
        .get(`/products?query=${searchTerm}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.forEach(element => {
            element.should.be.an('object');
          });
          res.body.length.should.equal(11);
          done();
        });
    });

    it('it should return 404 not found error from a search of "contacts"', done => {
      //arrange
      const searchTerm = 'contacts';
      //assert
      //act
      chai
        .request(server)
        .get(`/products?query=${searchTerm}`)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          res.body.should.have.property('code');
          res.body.should.have.property('message');
          res.body.should.have.property('fields');
          res.body.code.should.equal(404);
          res.body.message.should.equal('Product not found');
          res.body.fields.should.equal('query');
          done();
        });
    });
  });

  describe('POST /login', () => {
    it('it should return a 200 response when sent valid username and password', done => {
      //arrange
      const loginInfo = {
        username: 'yellowleopard753',
        password: 'jonjon'
      }
      //assert, act
      chai
        .request(server)
        .post('/login')
        .send(loginInfo)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('it should return an object when sent valid username and password', done => {
      //arrange
      const loginInfo = {
        username: 'yellowleopard753',
        password: 'jonjon'
      }
      //assert, act
      chai
        .request(server)
        .post('/login')
        .send(loginInfo)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          done();
        });
    });

    it('it should return an object with property accessToken when sent valid username and password', done => {
      //arrange
      const loginInfo = {
        username: 'yellowleopard753',
        password: 'jonjon'
      }
      //assert, act
      chai
        .request(server)
        .post('/login')
        .send(loginInfo)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('accessToken');
          done();
        });
    });

    it('it should return a 400 incorrectly formatted request when sent no username', done => {
      //arrange
      const loginInfo = {
        password: 'wrong'
      }
      //assert, act
      chai
        .request(server)
        .post('/login')
        .send(loginInfo)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.should.have.property('code');
          res.body.should.have.property('message');
          res.body.should.have.property('fields');
          res.body.code.should.equal(400);
          res.body.message.should.equal('Incorrectly formatted request');
          res.body.fields.should.equal('POST body');
          done();
        });
    });

    it('it should return a 400 incorrectly formatted request when sent no password', done => {
      //arrange
      const loginInfo = {
        username: 'yellowleopard753'
      }
      //assert, act
      chai
        .request(server)
        .post('/login')
        .send(loginInfo)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.should.have.property('code');
          res.body.should.have.property('message');
          res.body.should.have.property('fields');
          res.body.code.should.equal(400);
          res.body.message.should.equal('Incorrectly formatted request');
          res.body.fields.should.equal('POST body');
          done();
        });
    });

    it('it should return a 401 invalid username or password when sent valid username and invalid password', done => {
      //arrange
      const loginInfo = {
        username: 'yellowleopard753',
        password: 'wrong'
      }
      //assert, act
      chai
        .request(server)
        .post('/login')
        .send(loginInfo)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('code');
          res.body.should.have.property('message');
          res.body.should.have.property('fields');
          res.body.code.should.equal(401);
          res.body.message.should.equal('Invalid username or password');
          res.body.fields.should.equal('POST body');
          done();
        });
    });

    it('it should return a 401 invalid username or password when sent invalid username and valid password', done => {
      //arrange
      const loginInfo = {
        username: 'wrong',
        password: 'jonjon'
      }
      //assert, act
      chai
        .request(server)
        .post('/login')
        .send(loginInfo)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('code');
          res.body.should.have.property('message');
          res.body.should.have.property('fields');
          res.body.code.should.equal(401);
          res.body.message.should.equal('Invalid username or password');
          res.body.fields.should.equal('POST body');
          done();
        });
    });

    it('it should return a 401 invalid username or password when sent invalid username and invalid password', done => {
      //arrange
      const loginInfo = {
        username: 'wrong',
        password: 'wrong'
      }
      //assert, act
      chai
        .request(server)
        .post('/login')
        .send(loginInfo)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('code');
          res.body.should.have.property('message');
          res.body.should.have.property('fields');
          res.body.code.should.equal(401);
          res.body.message.should.equal('Invalid username or password');
          res.body.fields.should.equal('POST body');
          done();
        });
    });
  });

  describe('GET /me/cart', () =>{
    it('it should return 403 unauthorized when no access token sent', done => {
      //arrange
      //act
      //assert
      chai
        .request(server)
        .get(`/me/cart`)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('code');
          res.body.should.have.property('message');
          res.body.should.have.property('fields');
          res.body.code.should.equal(401);
          res.body.message.should.equal('Unauthorized - Missing or invalid accessToken, can only access cart if user is logged in');
          res.body.fields.should.equal('query');
          done();
        });
    });

    it('it should return 403 unauthorized when "" token sent', done => {
      //arrange
      const accessToken = '';
      //act
      //assert
      chai
        .request(server)
        .get(`/me/cart?accessToken=${accessToken}`)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('code');
          res.body.should.have.property('message');
          res.body.should.have.property('fields');
          res.body.code.should.equal(401);
          res.body.message.should.equal('Unauthorized - Missing or invalid accessToken, can only access cart if user is logged in');
          res.body.fields.should.equal('query');
          done();
        });
    });

    //nesting a describe to run before() without affecting the above tests
    describe('after logging in', () => {
      let accessToken;

      before('sending a GET request, login as an existing user', done => {
        //arrange
        const loginInfo = {
          username: 'yellowleopard753',
          password: 'jonjon'
        };
        //act, assert
        chai
          .request(server)
          .post('/login')
          .send(loginInfo)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('accessToken');
            //arrange for future tests
            accessToken = res.body.accessToken;
            //console.log(accessToken); /* used to validate that /login POST was working while these tests are still failing */
            done();
          });
      });

      it('should return a 200 response', done => {
        //arrange
        //should have accessToken from logging in
        //act, assert
        chai
          .request(server)
          .get(`/me/cart?accessToken=${accessToken}`)
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });

      it('should return an array', done => {
        //arrange
        //should have accessToken from logging in
        //act, assert
        chai
          .request(server)
          .get(`/me/cart?accessToken=${accessToken}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('array');
            done();
          });
      });
    });
  });
});