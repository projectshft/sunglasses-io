const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server'); 

const should = chai.should();
chai.use(chaiHttp);

// Brands Tests
describe('Brands', () => {
    it('should get all brands', (done) => {
        chai.request(server)
            .get('/api/brands')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                done();
            });
    });
});

// Login Tests
describe('Login', () => {
    it('should login a user', (done) => {
        chai.request(server)
            .post('/api/login')
            .send({ username: 'example', password: 'password' })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('token');
                done();
            });
    });
});

// Cart Tests
describe('Cart', () => {
    it('should get items in the cart', (done) => {
        chai.request(server)
            .get('/api/me/cart')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                done();
            });
    });

    it('should add an item to the cart', (done) => {
        chai.request(server)
            .post('/api/me/cart')
            .send({ productId: 'exampleProductId', quantity: 1 })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                done();
            });
    });

    it('should remove an item from the cart', (done) => {
        chai.request(server)
            .delete('/api/me/cart/exampleProductId')
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });
});
