const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server'); // Path to your server.js file

// Configure chai
chai.use(chaiHttp);
chai.should();

describe('Server API tests', () => {
    // Test for GET /api/brands endpoint
    describe('GET /api/brands', () => {
        it('should get all brands', (done) => {
            chai.request(server)
                .get('/api/brands')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    done(); // Call done to indicate test completion
                });
        });
    });

    // Test for POST /api/login endpoint
    describe('POST /api/login', () => {
        it('should login a user', (done) => {
            chai.request(server)
                .post('/api/login')
                .send({ username: 'yellowleopard753', password: 'jonjon' })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    res.body.should.have.property('token');
                    done(); 
                });
        });
    });

    // Test for GET /api/me/cart endpoint
    describe('GET /api/me/cart', () => {
        it('should get items in the cart', (done) => {
            chai.request(server)
                .get('/api/me/cart')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    done(); 
                });
        });
    });

    // Add more tests for other endpoints as needed
});
