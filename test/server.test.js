const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server'); // Adjust the path as needed

const expect = chai.expect;
chai.use(chaiHttp);

// TODO: Write tests for the server


// Products route tests 1-3

describe('GET /api/products', () => {
  it("should return all products", (done) => {
    chai.request(server)
      .get('/api/products')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
  });
});

describe('GET /api/products/:id', () => {
  it('should return a single product for a valid ID', (done) => {
    chai.request(server)
      .get('/api/products/1') // assumes product with id "1" exists
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id', '1');
        done();
      });
  });

  it('should return 404 for a non-existent product ID', (done) => {
    chai.request(server)
      .get('/api/products/9999')
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.have.property('error');
        done();
      });
  });
});

// Users route tests 4-6

describe('GET /api/users', () => {
  it('should return all users', (done) => {
    chai.request(server)
      .get('/api/users')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
  });
});

describe('GET /api/users/:username', () => {
  it('should return a single user for a valid username', (done) => {
    chai.request(server)
      .get('/api/users/yellowleopard753') 
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('email', 'susanna.richards@example.com');
        done();
      });
  });

  it('should return 404 for a non-existent username', (done) => {
    chai.request(server)
      .get('/api/users/notarealusername')
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.have.property('error');
        done();
      });
  });
});

describe('POST /api/users/:username/cart', () => {
  it('should add a product to the user cart', (done) => {
    chai.request(server)
      .post('/api/users/yellowleopard753/cart')
      .send({ productId: "1", quantity: 2 })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('message');
        done();
      });
  });

  it('should return 400 for invalid body', (done) => {
    chai.request(server)
      .post('/api/users/yellowleopard753/cart')
      .send({ quantity: 2 }) 
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('error');
        done();
      });
  });
});

describe('DELETE /api/users/:username/cart/product/:productId', () => {
  it('should remove a product from the user cart', (done) => {
    chai.request(server)
      .delete('/api/users/yellowleopard753/cart/product/1')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message');
        done();
      });
  });

  it('should return 404 if product not in cart', (done) => {
    chai.request(server)
      .delete('/api/users/yellowleopard753/cart/product/invalid')
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.have.property('error');
        done();
      });
  });
});

describe('POST /api/login', () => {
  it('should return 200 and success message for valid login', (done) => {
    chai.request(server)
      .post('/api/login')
      .send({ username: 'yellowleopard753', password: 'jonjon' }) // make sure this matches your users.json
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message', 'Login successful');
        done();
      });
  });

  it('should return 401 for invalid credentials', (done) => {
    chai.request(server)
      .post('/api/login')
      .send({ username: 'wronguser', password: 'wrongpass' })
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property('error');
        done();
      });
  });

  it('should return 400 if username or password is missing', (done) => {
    chai.request(server)
      .post('/api/login')
      .send({ username: 'yellowleopard753' }) // missing password
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('error');
        done();
      });
  });
});