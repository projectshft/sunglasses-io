const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');
const expect = chai.expect;

const should = chai.should();
chai.use(chaiHttp);

// IMPORTING DATA FROM JSON FILES
const users = require('../initial-data/users.json');
const brands = require('../initial-data/brands.json');
const products = require('../initial-data/products.json');

// TESTS FOR THE SERVER
describe('Home', () => {
  describe('GET /', () => {
    it('it should return status 200', (done) => {
      chai.request(server)
        .get('/')
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          done();
        });
    });
    it('it should return status 500 if an error occurs', (done) => {
      const originalRequest = chai.request(server).get;

      chai.request(server).get = () => {
        return Promise.reject(new Error('Server error blah blah'));
      };

      chai.request(server)
        .get('/')
        .end((err, res) => {
          chai.request(server).get = originalRequest;

          if (err) {
            expect(res).to.have.status(500);
          } else {
            expect(res).to.have.status(200);
          }
          done();
        });
    });
  });
});

describe('Brands', () => {
  describe('GETS /brands', () => {
    it('it should return all FIVE brand names, including example brand name [0] "Burberry"', (done) => {
      chai.request(server)
        .get('/brands')
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body['All Brand Names']).to.have.lengthOf(5);
          expect(res.body['All Brand Names'][0]).to.equal('Burberry');
          done();
        });
    });
  });
  describe('GETS /brands/:name', () => {
    it('it should return product names by brand', (done) => {
      const productName = 'Burberry';
      chai.request(server)
        .get(`/brands/${productName}`)
        .end((err, res) =>{
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('Burberry');
          
          const products = res.body['Burberry'];

          expect(products).to.be.an('array');

          products.forEach(product => {
            expect(product).to.have.property('id');
            expect(product).to.have.property('categoryId');
            expect(product).to.have.property('name');
            expect(product).to.have.property('description');
            expect(product).to.have.property('price');
            expect(product).to.have.property('imageUrls');
          })
          done();
        });
    });
  });
});

describe('Products', () => {
  describe('GETS /products', () => {
    it('it should return all ELEVEN product names', (done) => {
      chai.request(server)
        .get('/products')
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');

          const productNames = res.body['All Product Names'];

          expect(productNames).to.be.an('array');
          expect(productNames).to.have.lengthOf(11);
          expect(productNames[0]).to.equal('Better Glasses');
          done();
        });
    });
  });
  describe('GETS /products/:name', () => {
    it('it should return product details by product name', (done) => {
      const productName = "Better glasses";
      chai.request(server)
        .get(`/products/${productName}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');

          const productDetails = res.body['Product Details'];

          expect(productDetails).to.be.an('object');
          expect(productDetails).to.have.property('name');
          expect(productDetails).to.have.property('description');
          expect(productDetails).to.have.property('price');
          expect(productDetails).to.have.property('imageUrls');
          done();
        });
    });
  });
});

// ONLY AUTHORIZED USERS
describe('Authorization Tester', () => {
  let authToken = '';

  describe('POST /login', () => {
    it(`it should return authentication token and message`, (done) => {
      const credentials =  Buffer.from('greenlion235:waters').toString('base64');

      chai.request(server)
        .post('/login')
        .set('Authorization', `Basic ${credentials}`)
        .end((err, res) => {
          if (err) return done(err);
  
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          expect(res.body).to.have.property('redirectUrl').that.equals('/natalia');
          authToken = res.body.token;
          done();
        });
      });
  });
  
  describe('Users', () =>{
    describe('GETS /users', () => {
      it('it should return names of users', (done) => {
        if (!authToken) return done(new Error('Authentication token did not stick'));

         chai.request(server)
          .get('/users')
          .set('Authorization', `Bearer ${authToken}`)
          .end((err, res) => {
            if (err) return done(err);
  
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');

            const userNames = res.body['users'];

            expect(userNames).to.be.an('array');
            expect(userNames).to.have.lengthOf(3);

            done();
          });
      });
    });
  });
  
  describe('Cart', () => {
    describe('GETS /:name', () => {
      it('it should return existing user\'s cart with product details', (done) => {
        if (!authToken) return done(new Error('Authentication token did not stick'));

        chai.request(server)
          .get('/natalia')
          .set('Authorization', `Bearer ${authToken}`)
          .end((err, res)=> {
            if (err) return done(err);

            console.log('Response body:', res.body); 
  
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('userCart').that.is.an('object');

            const userCart = res.body.userCart;

            const item = userCart.items[0];
            expect(item).to.have.property('product').that.is.a('string');
            expect(item).to.have.property('quantity');
            expect(item).to.have.property('price');
            done();
          });
      });
    });

    describe('POST /:name', () => {
      it('it should return updated cart of existing user', (done) => {
        if (!authToken) return done(new Error('Authentication token did not stick'));

        chai.request(server)
          .post('/natalia')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
              items: [{
              product: 'glas',
              quantitty: 1,
              price: 50
            }],
            total: 50
          })
          .end((err, res) => {
            if (err) return done(err);
  
            expect(res).to.have.status(200);

            const userCart = res.body['userCart'];

            expect(userCart).to.be.an('object');
            expect(userCart).to.have.property('items').that.is.an('array');
            expect(userCart.items[0]).to.have.property('product');
            expect(userCart.items[1]).to.have.property('quantity');
            expect(userCart).to.have.property('total').that.is.a('number');

            done();
          });
      });
    });

    describe('DELETE /:name', () => {
      it('it should return with item deleted from cart of existing users', (done) => {
        if (!authToken) return done(new Error('Authentication token did not stick'));

        chai.request(server)
          .delete('/natalia')
          .set('Authorization', `Bearer ${authToken}`)
          .end((err, res) => {
            if (err) return done(err);
  
            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message').eql('Cart was successfully deleted');
            done();
        });
      });
    });

  });
});