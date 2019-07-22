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

    it('it should return a 200 response when sent valid email and password', done => {
      //arrange
      const loginInfo = {
        email: 'susanna.richards@example.com',
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

    it('it should return an object when sent valid email and password', done => {
      //arrange
      const loginInfo = {
        email: 'susanna.richards@example.com',
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

    it('it should return an object with property accessToken when sent valid email and password', done => {
      //arrange
      const loginInfo = {
        email: 'susanna.richards@example.com',
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

    it('it should return a 400 incorrectly formatted request when sent no username or email', done => {
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

    it('it should return a 400 incorrectly formatted request when sent username and no password', done => {
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

    it('it should return a 400 incorrectly formatted request when sent email and no password', done => {
      //arrange
      const loginInfo = {
        email: 'susanna.richards@example.com'
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

    it('it should return a 400 incorrectly formatted request when sent username, email and password', done => {
      //arrange
      const loginInfo = {
        username: 'someusername',
        email: 'someemail',
        password: 'somepassword'
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

    it('it should return a 401 invalid email or password when sent valid email and invalid password', done => {
      //arrange
      const loginInfo = {
        email: 'susanna.richards@example.com',
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
          res.body.message.should.equal('Invalid email or password');
          res.body.fields.should.equal('POST body');
          done();
        });
    });

    it('it should return a 401 invalid email or password when sent invalid email and valid password', done => {
      //arrange
      const loginInfo = {
        email: 'wrong',
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
          res.body.message.should.equal('Invalid email or password');
          res.body.fields.should.equal('POST body');
          done();
        });
    });

    it('it should return a 401 invalid email or password when sent invalid email and invalid password', done => {
      //arrange
      const loginInfo = {
        email: 'wrong',
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
          res.body.message.should.equal('Invalid email or password');
          res.body.fields.should.equal('POST body');
          done();
        });
    });
  });

  describe('GET /me/cart', () => {
    describe('before logging in', () => {
      it('it should return 403 unauthorized when no access token sent', done => {
        //arrange
        //act
        //assert
        chai
          .request(server)
          .get(`/me/cart`)
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(403);
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
            res.should.have.status(403);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(403);
            res.body.message.should.equal('Unauthorized - Missing or invalid accessToken, can only access cart if user is logged in');
            res.body.fields.should.equal('query');
            done();
          });
      });
    });

    //nesting a describe to run before() without affecting the above tests
    describe('after logging in', () => {
      let accessToken;

      before('sending a POST request, login as an existing user', done => {
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

      it('should return an array of objects', done => {
        //arrange
        //should have accessToken from logging in
        //act, assert
        chai
          .request(server)
          .get(`/me/cart?accessToken=${accessToken}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('array');
            res.body.forEach(item => {
              item.should.be.an('object');
            });
            done();
          });
      });

      it('should return an array of objects with properties product, quantity', done => {
        //arrange
        //should have accessToken from logging in
        //act, assert
        chai
          .request(server)
          .get(`/me/cart?accessToken=${accessToken}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('array');
            res.body.forEach(item => {
              item.should.be.an('object');
              item.should.have.property('product');
              item.should.have.property('quantity');
            });
            done();
          });
      });

      it('should return a 403 unauthorized when incorrect token sent', done => {
        //arrange
        //change access token to an incorrect one
        const invalidAccessToken = accessToken.slice(2);
        
        //act, assert
        chai
          .request(server)
          .get(`/me/cart?accessToken=${invalidAccessToken}`)
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(403);
            res.body.message.should.equal('Unauthorized - Missing or invalid accessToken, can only access cart if user is logged in');
            res.body.fields.should.equal('query');
            done();
          });
      });
    });
  });

  describe('POST /me/cart', () => {
    describe('before logging in', () => {
      it('it should return a 403 unauthorized response with no parameters', done => {
        //act, assert
        chai
          .request(server)
          .post('/me/cart')
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(403);
            res.body.message.should.equal('Unauthorized - Missing or invalid accessToken, can only access cart if user is logged in');
            res.body.fields.should.equal('query');
            done();
          });
      });

      it('it should return 403 unauthorized response with sent invalid access token and no productId', done => {
        //arrange
        const invalidAccessToken = '0123456789abcdef';
        //act, assert        
        chai
          .request(server)
          .post(`/me/cart?accessToken=${invalidAccessToken}`)
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(403);
            res.body.message.should.equal('Unauthorized - Missing or invalid accessToken, can only access cart if user is logged in');
            res.body.fields.should.equal('query');
            done();
          });
      });
    
      it('it should return 403 unauthorized response with no access token and sent productId', done => {
        //arrange
        const productId = '1';
        //act, assert        
        chai
          .request(server)
          .post(`/me/cart?productId=${productId}`)
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(403);
            res.body.message.should.equal('Unauthorized - Missing or invalid accessToken, can only access cart if user is logged in');
            res.body.fields.should.equal('query');
            done();
          });
      });
    
      it('it should return 403 unauthorized response with sent access token and sent productId', done => {
        //arrange
        const invalidAccessToken = '0123456789abcdef'
        const productId = '1';
        //act, assert        
        chai
          .request(server)
          .post(`/me/cart?accessToken=${invalidAccessToken}&productId=${productId}`)
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(403);
            res.body.message.should.equal('Unauthorized - Missing or invalid accessToken, can only access cart if user is logged in');
            res.body.fields.should.equal('query');
            done();
          });
      });
    });

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

      it('it should return 400 bad request when no productId sent', done => {
        //arrange
        //act, assert        
        chai
          .request(server)
          .post(`/me/cart?accessToken=${accessToken}`)
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(400);
            res.body.message.should.equal('Bad request - productId required');
            res.body.fields.should.equal('query');
            done();
          });
      });

      it('it should return 403 unauthorized when incorrect access token sent', done => {
        //arrange
        const incorrectAccessToken = accessToken.slice(2);
        const productId = '1';
        //act, assert        
        chai
          .request(server)
          .post(`/me/cart?accessToken=${incorrectAccessToken}&productId=${productId}`)
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(403);
            res.body.message.should.equal('Unauthorized - Missing or invalid accessToken, can only access cart if user is logged in');
            res.body.fields.should.equal('query');
            done();
          });
      });

      it('it should return 404 product not found when productId of 0 sent', done => {
        //arrange
        const productId = '0';
        //act, assert        
        chai
          .request(server)
          .post(`/me/cart?accessToken=${accessToken}&productId=${productId}`)
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

      describe('these tests will successfully add a product to a user\'s cart', () => {
        let cartSize = 0;
        
        afterEach('GET /me/cart to verify product was added', done => {
          chai
            .request(server)
            .get(`/me/cart?accessToken=${accessToken}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array');
              res.body.length.should.be.equal(cartSize);
              //console.log(res.body); /* used to verify user's cart was sent back */
              done();
            });
        });

        it('it should return a 200 response', done => {
          //arrange
          const productId = '1';
          //act  
          cartSize++;
          //assert 
          chai
            .request(server)
            .post(`/me/cart?accessToken=${accessToken}&productId=${productId}`)
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
  
        it('it should return an object', done => {
          //arrange
          const productId = '2';
          //act  
          cartSize++;
          //assert 
          chai
            .request(server)
            .post(`/me/cart?accessToken=${accessToken}&productId=${productId}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('object');
              done();
            });
        });
  
        it('it should return an object with properties id, categoryId, name, description, price, imageUrls', done => {
          //arrange
          const productId = '3';
          //act  
          cartSize++;
          //assert       
          chai
            .request(server)
            .post(`/me/cart?accessToken=${accessToken}&productId=${productId}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('object');
              res.body.should.have.property('id');
              res.body.should.have.property('categoryId');
              res.body.should.have.property('name');
              res.body.should.have.property('description');
              res.body.should.have.property('price');
              res.body.should.have.property('imageUrls');
              done();
            });
        });
  
        it('it should return an object where imageUrls property is an array', done => {
          //arrange
          const productId = '4';
          //act  
          cartSize++;
          //assert        
          chai
            .request(server)
            .post(`/me/cart?accessToken=${accessToken}&productId=${productId}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('object');
              res.body.should.have.property('id');
              res.body.should.have.property('categoryId');
              res.body.should.have.property('name');
              res.body.should.have.property('description');
              res.body.should.have.property('price');
              res.body.should.have.property('imageUrls');
              res.body.imageUrls.should.be.an('array');
              done();
            });
        });
  
        it('it should return an object where imageUrls property is an array', done => {
          //arrange
          const productId = '5';
          //act  
          cartSize++;
          //assert        
          chai
            .request(server)
            .post(`/me/cart?accessToken=${accessToken}&productId=${productId}`)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('object');
              res.body.should.have.property('id');
              res.body.should.have.property('categoryId');
              res.body.should.have.property('name');
              res.body.should.have.property('description');
              res.body.should.have.property('price');
              res.body.should.have.property('imageUrls');
              res.body.imageUrls.should.be.an('array');
              done();
            });
        });
      });

      describe('these tests will try to add a product already in a user\'s cart', () => {
        it('it should return a 409 product already in cart when duplicated productId sent', done => {
          //arrange
          //productIds 1-5 have been added to cart, can use any of those
          const productId = '1';
          //act, assert
          chai
          .request(server)
          .post(`/me/cart?accessToken=${accessToken}&productId=${productId}`)
          .end((err, res) => {
            res.should.have.status(409);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(409);
            res.body.message.should.equal('Product already in user\'s cart');
            res.body.fields.should.equal('POST');
            done();
          });
        })
      });
    });
  });

  describe('PUT /me/cart/{id}', () => {
    let accessToken;
    //login, test endpoint with nothing in cart first, then add items and test again
    before('login as an existing user', done => {
      //arrange
      const loginInfo = {
        username: 'lazywolf342',
        password: 'tucker'
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

    describe('logged in with no items in user\'s cart', () => {
      it('it should return 404 product not found with invalid productId sent', done => {
        //arrange
        const productId = '0';
        const quantity = '5';
        //act, assert
        chai
          .request(server)
          .put(`/me/cart/${productId}?accessToken=${accessToken}&quantity=${quantity}`)
          .end((err, res) => {
            res.should.have.status(404);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(404);
            res.body.message.should.equal('Product not found');
            res.body.fields.should.equal('path');
            done();
          });
      });
  
      it('it should return 400 invalid quantity with valid productId and no quantity sent', done => {
        //arrange
        const productId = '1';
        //act, assert
        chai
          .request(server)
          .put(`/me/cart/${productId}?accessToken=${accessToken}`)
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(400);
            res.body.message.should.equal('Invalid quantity');
            res.body.fields.should.equal('query');
            done();
          });
      });
  
      it('it should return 400 invalid quantity with valid productId and invalid quantity sent', done => {
        //arrange
        const productId = '1';
        const quantity = '0';
        //act, assert
        chai
          .request(server)
          .put(`/me/cart/${productId}?accessToken=${accessToken}&quantity=${quantity}`)
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(400);
            res.body.message.should.equal('Invalid quantity');
            res.body.fields.should.equal('query');
            done();
          });
      });
  
      it('it should return 403 unauthorized with no access token sent', done => {
        //arrange
        const productId = '1';
        const quantity = '2';
        //act, assert
        chai
          .request(server)
          .put(`/me/cart/${productId}?quantity=${quantity}`)
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(403);
            res.body.message.should.equal('Unauthorized - Missing or invalid accessToken, can only access cart if user is logged in');
            res.body.fields.should.equal('query');
            done();
          });
      });

      it('it should return 403 unauthorized with invalid access token sent', done => {
        //arrange
        const productId = '1';
        const quantity = '2';
        const invalidAccessToken = accessToken.slice(2);
        //act, assert
        chai
          .request(server)
          .put(`/me/cart/${productId}?accessToken=${invalidAccessToken}&quantity=${quantity}`)
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(403);
            res.body.message.should.equal('Unauthorized - Missing or invalid accessToken, can only access cart if user is logged in');
            res.body.fields.should.equal('query');
            done();
          });
      });

      it('it should return 404 product not found with valid productId sent', done => {
        //arrange
        const productId = '1';
        const quantity = '2';
        //act, assert
        chai
          .request(server)
          .put(`/me/cart/${productId}?accessToken=${accessToken}&quantity=${quantity}`)
          .end((err, res) => {
            res.should.have.status(404);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(404);
            res.body.message.should.equal('Product not found');
            res.body.fields.should.equal('path');
            done();
          });
      });
    });

    describe('logged in with items in user\'s cart', () => {
      before('add first item to user\'s cart', done => {
        const productId = '1';
        chai
          .request(server)
          .post(`/me/cart?accessToken=${accessToken}&productId=${productId}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            done();
          });
      });

      before('add second item to user\'s cart', done => {
        const productId = '2';
        chai
          .request(server)
          .post(`/me/cart?accessToken=${accessToken}&productId=${productId}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            done();
          });
      });

      before('add third item to user\'s cart', done => {
        const productId = '3';
        chai
          .request(server)
          .post(`/me/cart?accessToken=${accessToken}&productId=${productId}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            done();
          });
      });
  
      it('it should return 400 invalid quantity with invalid productId sent', done => {
        //arrange
        const productId = '0';
        //act, assert
        chai
          .request(server)
          .put(`/me/cart/${productId}?accessToken=${accessToken}`)
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(400);
            res.body.message.should.equal('Invalid quantity');
            res.body.fields.should.equal('query');
            done();
          });
      });
  
      it('it should return 400 invalid quantity with valid productId and no quantity sent', done => {
        //arrange
        const productId = '1';
        //act, assert
        chai
          .request(server)
          .put(`/me/cart/${productId}?accessToken=${accessToken}`)
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(400);
            res.body.message.should.equal('Invalid quantity');
            res.body.fields.should.equal('query');
            done();
          });
      });
  
      it('it should return 400 invalid quantity with valid productId and invalid quantity sent', done => {
        //arrange
        const productId = '1';
        const quantity = '0';
        //act, assert
        chai
          .request(server)
          .put(`/me/cart/${productId}?accessToken=${accessToken}&quantity=${quantity}`)
          .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(400);
            res.body.message.should.equal('Invalid quantity');
            res.body.fields.should.equal('query');
            done();
          });
      });
  
      it('it should return 403 unauthorized with no access token sent', done => {
        //arrange
        const productId = '1';
        const quantity = '2';
        //act, assert
        chai
          .request(server)
          .put(`/me/cart/${productId}?quantity=${quantity}`)
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(403);
            res.body.message.should.equal('Unauthorized - Missing or invalid accessToken, can only access cart if user is logged in');
            res.body.fields.should.equal('query');
            done();
          });
      });

      it('it should return 403 unauthorized with invalid access token sent', done => {
        //arrange
        const productId = '1';
        const quantity = '2';
        const invalidAccessToken = accessToken.slice(2);
        //act, assert
        chai
          .request(server)
          .put(`/me/cart/${productId}?accessToken=${invalidAccessToken}&quantity=${quantity}`)
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(403);
            res.body.message.should.equal('Unauthorized - Missing or invalid accessToken, can only access cart if user is logged in');
            res.body.fields.should.equal('query');
            done();
          });
      });

      it('it should return 404 product not found with valid productId of product not in cart sent', done => {
        //arrange
        const productId = '11';
        const quantity = '2';
        //act, assert
        chai
          .request(server)
          .put(`/me/cart/${productId}?accessToken=${accessToken}&quantity=${quantity}`)
          .end((err, res) => {
            res.should.have.status(404);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(404);
            res.body.message.should.equal('Product not found');
            res.body.fields.should.equal('path');
            done();
          });
      });

      it('it should return 200', done => {
        //arrange
        const productId = '1';
        const quantity = '2';
        //act, assert
        chai
          .request(server)
          .put(`/me/cart/${productId}?accessToken=${accessToken}&quantity=${quantity}`)
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });

      it('it should return an object', done => {
        //arrange
        const productId = '1';
        const quantity = '2';
        //act, assert
        chai
          .request(server)
          .put(`/me/cart/${productId}?accessToken=${accessToken}&quantity=${quantity}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            done();
          });
      });

      it('it should return an object with properties product and quantity', done => {
        //arrange
        const productId = '1';
        const quantity = '2';
        //act, assert
        chai
          .request(server)
          .put(`/me/cart/${productId}?accessToken=${accessToken}&quantity=${quantity}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('product');
            res.body.should.have.property('quantity');
            done();
          });
      });

      it('it should return an object where product.id matches productId and quantity matches quantity sent', done => {
        //arrange
        const productId = '1';
        const quantity = '2';
        //act, assert
        chai
          .request(server)
          .put(`/me/cart/${productId}?accessToken=${accessToken}&quantity=${quantity}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('product');
            res.body.should.have.property('quantity');
            res.body.product.id.should.equal('1');
            res.body.quantity.should.equal('2');
            done();
          });
      });
    });
  });

  describe('DELETE /me/cart/{id}', () => {
    let accessToken;

    describe('before logging in', () => {
      //right now someone is logged in from previous tests
      it('it should return 403 unauthorized when no access token sent', done => {
        //arrange
        const productId = '1';
        //act, assert        
        chai
          .request(server)
          .delete(`/me/cart/${productId}`)
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(403);
            res.body.message.should.equal('Unauthorized - Missing or invalid accessToken, can only access cart if user is logged in');
            res.body.fields.should.equal('query');
            done();
          });
      });

      it('it should return 403 unauthorized when any access token sent', done => {
        //arrange
        const productId = '1';
        //act, assert        
        chai
          .request(server)
          .delete(`/me/cart/${productId}?accessToken=someonecalculatethechancesthatthistokenisvalid`)
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(403);
            res.body.message.should.equal('Unauthorized - Missing or invalid accessToken, can only access cart if user is logged in');
            res.body.fields.should.equal('query');
            done();
          });
      });
    });

    describe('after logging in, before adding any products to cart', () => {
      before('login as an existing user', done => {
        //arrange
        const loginInfo = {
          username: 'greenlion235',
          password: 'waters'
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

      it('it should return 403 unauthorized when no access token sent', done => {
        //arrange
        const productId = '1';
        //act, assert        
        chai
          .request(server)
          .delete(`/me/cart/${productId}`)
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(403);
            res.body.message.should.equal('Unauthorized - Missing or invalid accessToken, can only access cart if user is logged in');
            res.body.fields.should.equal('query');
            done();
          });
      });

      it('it should return 403 unauthorized when invalid token sent', done => {
        //arrange
        const productId = '1';
        const invalidAccessToken = accessToken.slice(2);
        //act, assert        
        chai
          .request(server)
          .delete(`/me/cart/${productId}?accessToken=${invalidAccessToken}`)
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(403);
            res.body.message.should.equal('Unauthorized - Missing or invalid accessToken, can only access cart if user is logged in');
            res.body.fields.should.equal('query');
            done();
          });
      });

      it('it should return 404 product not found when any productId sent', done => {
        //arrange
        const productId = '1';
        //act, assert        
        chai
          .request(server)
          .delete(`/me/cart/${productId}?accessToken=${accessToken}`)
          .end((err, res) => {
            res.should.have.status(404);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(404);
            res.body.message.should.equal('Product not found');
            res.body.fields.should.equal('path');
            done();
          });
      });
    });

    describe('after logging in, after adding products to cart', () => {
      let cartSize = 0;

      before('add first item to user\'s cart', done => {
        const productId = '1';
        chai
          .request(server)
          .post(`/me/cart?accessToken=${accessToken}&productId=${productId}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            cartSize++;
            done();
          });
      });

      before('add second item to user\'s cart', done => {
        const productId = '2';
        chai
          .request(server)
          .post(`/me/cart?accessToken=${accessToken}&productId=${productId}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            cartSize++;
            done();
          });
      });

      before('add third item to user\'s cart', done => {
        const productId = '3';
        chai
          .request(server)
          .post(`/me/cart?accessToken=${accessToken}&productId=${productId}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            cartSize++;
            done();
          });
      });

      // beforeEach('show users cart', done => {
      //   chai
      //     .request(server)
      //     .get(`/me/cart?accessToken=${accessToken}`)
      //     .end((err, res) => {
      //       console.log(res.body);
      //       done();
      //     });
      // });

      // afterEach('GET /me/cart to verify product was deleted', done => {
      //   chai
      //     .request(server)
      //     .get(`/me/cart?accessToken=${accessToken}`)
      //     .end((err, res) => {
      //       res.should.have.status(200);
      //       res.body.should.be.an('array');
      //       res.body.length.should.be.equal(cartSize);
      //       //console.log(res.body); /* used to verify user's cart was sent back */
      //       done();
      //     });
      // });

      it('it should return 403 unauthorized when no access token sent', done => {
        //arrange
        const productId = '1';
        //act, assert        
        chai
          .request(server)
          .delete(`/me/cart/${productId}`)
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(403);
            res.body.message.should.equal('Unauthorized - Missing or invalid accessToken, can only access cart if user is logged in');
            res.body.fields.should.equal('query');
            done();
          });
      });

      it('it should return 403 unauthorized when invalid token sent', done => {
        //arrange
        const productId = '1';
        const invalidAccessToken = accessToken.slice(2);
        //act, assert        
        chai
          .request(server)
          .delete(`/me/cart/${productId}?accessToken=${invalidAccessToken}`)
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(403);
            res.body.message.should.equal('Unauthorized - Missing or invalid accessToken, can only access cart if user is logged in');
            res.body.fields.should.equal('query');
            done();
          });
      });

      it('it should return 404 product not found when an incorrect productId sent', done => {
        //arrange
        const productId = '11';
        //act, assert        
        chai
          .request(server)
          .delete(`/me/cart/${productId}?accessToken=${accessToken}`)
          .end((err, res) => {
            res.should.have.status(404);
            res.body.should.be.an('object');
            res.body.should.have.property('code');
            res.body.should.have.property('message');
            res.body.should.have.property('fields');
            res.body.code.should.equal(404);
            res.body.message.should.equal('Product not found');
            res.body.fields.should.equal('path');
            done();
          });
      });

      it('it should return 200 when product deleted from cart', done => {
        //arrange
        const productId = '1'
        //act, arrange
        chai
          .request(server)
          .delete(`/me/cart/${productId}?accessToken=${accessToken}`)
          .end((err, res) => {
            res.should.have.status(200);
            cartSize--;
            done();
          });
      });

      it('it should return an object when product deleted from cart', done => {
        //arrange
        const productId = '2'
        //act, arrange
        chai
          .request(server)
          .delete(`/me/cart/${productId}?accessToken=${accessToken}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            cartSize--;
            done();
          });
      });

      it('it should return a copy of the product deleted from cart', done => {
        //arrange
        const productId = '3'
        //act, arrange
        chai
          .request(server)
          .delete(`/me/cart/${productId}?accessToken=${accessToken}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('id');
            res.body.should.have.property('categoryId');
            res.body.should.have.property('name');
            res.body.should.have.property('description');
            res.body.should.have.property('price');
            res.body.should.have.property('imageUrls');
            res.body.imageUrls.should.be.an('array');
            cartSize--;
            done();
          });
      });
    });
  });

  //testing failed login attempts at the end so no users are locked out of previous tests
  describe('Failed login attempts', () => {
    //now test failed login attempts with greenlion235
    describe('testing failed login attempts', () => {
      before('failed login attempt #1 using username', done => {
        const loginInfo = {
          username: 'greenlion235',
          password: 'wrong'
        };
        chai
          .request(server)
          .post('/login')
          .send(loginInfo)
          .end((err, res) => {
            res.should.have.status(401);
            done();
          });
      });

      before('failed login attempt #2 using email', done => {
        const loginInfo = {
          email: 'natalia.ramos@example.com',
          password: 'wrong'
        };
        chai
          .request(server)
          .post('/login')
          .send(loginInfo)
          .end((err, res) => {
            res.should.have.status(401);
            done();
          });
      });

      before('failed login attempt #3 using username', done => {
        const loginInfo = {
          username: 'greenlion235',
          password: 'wrong'
        };
        chai
          .request(server)
          .post('/login')
          .send(loginInfo)
          .end((err, res) => {
            res.should.have.status(401);
            done();
          });
      });

      it('should return 401 invalid username or password when sent correct username and password (because of failed logins limit)', done => {
        //arrange
        const loginInfo = {
          username: 'greenlion235',
          password: 'waters'
        };
        //act, assert
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

      it('should return 401 invalid email or password when sent correct username and password (because of failed logins limit)', done => {
        //arrange
        const loginInfo = {
          email: 'natalia.ramos@example.com',
          password: 'waters'
        };
        //act, assert
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
            res.body.message.should.equal('Invalid email or password');
            res.body.fields.should.equal('POST body');
            done();
          });
      });
    });

    //now test if server allows login after two failed logins - limit should be 3
    describe('testing failed login attempts', () => {
      before('failed login attempt #1 using username', done => {
        const loginInfo = {
          username: 'lazywolf342',
          password: 'wrong'
        };
        chai
          .request(server)
          .post('/login')
          .send(loginInfo)
          .end((err, res) => {
            res.should.have.status(401);
            done();
          });
      });

      before('failed login attempt #2 using email', done => {
        const loginInfo = {
          email: 'salvador.jordan@example.com',
          password: 'wrong'
        };
        chai
          .request(server)
          .post('/login')
          .send(loginInfo)
          .end((err, res) => {
            res.should.have.status(401);
            done();
          });
      });

      it('it should return 200 when sent valid username and password', done => {
        //arrange
        const loginInfo = {
          username: 'lazywolf342',
          password: 'tucker'
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

      it('it should return 200 when sent valid email and password', done => {
        //arrange
        const loginInfo = {
          email: 'salvador.jordan@example.com',
          password: 'tucker'
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
    });
  });
});