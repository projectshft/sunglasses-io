let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

// Successful test to obtain all products
describe('/GET products', () => {
    it('it should GET all products', done => {
        chai    
            .request(server)
            .get('/products')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body.length.should.be.eql(11);
                done();
            });
    });
});

// Successful test to obtain all brands
describe('/GET brands', () => {
    it('it should GET all of the brands', done => {
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
});

// Successful test to obtain a single product
describe('/GET brands/:id/products', () => {
    it('it should GET a single product', done => {        
        chai
            .request(server)            
            .get('/brands/' + 5 + '/products')            
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
});

//Test for a product that does NOT exist (Edge Case High)
describe('/GET brands/:id/products', () => {
    it('it should display an ERROR code edge case high', done => {        
        chai
            .request(server)            
            .get('/brands/' + 12 + '/products')            
            .end((err, res) => {                            
                res.should.have.status(404);                
                done();
            });
    });
});

//Test for a product that does NOT exist (Edge Case Low)
describe('/GET brands/:id/products', () => {
    it('it should display an ERROR code edge case low', done => {        
        chai
            .request(server)            
            .get('/brands/' + 0 + '/products')            
            .end((err, res) => {                            
                res.should.have.status(404);                
                done();
            });
    });
});

// Test for a known unsuccessful login
describe('/POST login', () => {
    it('it should display a login ERROR code', done => {        
        chai
            .request(server)            
            .post('/login')
            .send({ username: 'bluebird489', password: 'WinG$' })
            .end((err, res) => {                
                res.should.have.status(401);                                                           
                done();
            });
            
    });
});

// Tests for a known successfull login
describe('/POST login', () => {
    it('it should POST a login', done => {        
        chai
            .request(server)            
            .post('/login')
            .send({ username: 'yellowleopard753', password: 'jonjon' })
            .end((err, res) => {                
                res.should.have.status(200);
                res.body.should.be.a('string');                                             
                done();
            });
            
    });
});

// Tests for successful login and GETs the users cart
describe('/GET me/cart', () => {   
    it('it should return the users cart', done => {
            chai         
                .request(server)       
                .get('/me/cart')
                .send({ username: 'yellowleopard753' })
                .end((err, res) => {                    
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    done();
                });
        });
});

// Adds an item to the users cart
describe('/POST me/cart', () => {
    it('it add an item to the users cart', done => {
        chai
            .request(server)
            .post('/me/cart')
            .send({ username: 'yellowleopard753', id: '7' })
            .end((err, res) => {
                console.log(res)
                console.log(res.status)
                res.should.have.status(200);
                res.body.should.be.a('array');                
                done();
            });            
    });
});

/*
// Deletes an item from the users cart
describe('/DELETE me/cart/:productId', () => {
    it('it deletes an item from the users cart', done => {
        chai
            .request(server)
            .delete('/me/cart/:productId')
            .send('')
    })
}) */

/*
"id": "7",
        "categoryId": "3",
        "name": "QDogs Glasses",
        "description": "They bark",
        "price":1500,
        "imageUrls":
*/