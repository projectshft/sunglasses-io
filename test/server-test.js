let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

/*
describe('/GET me/cart', () => {
    it('it should return the users cart', done => {
        chai    
            .request(server)
            .post('/login')
            .send({ username: '', password: ''})
            .get('/me/cart')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                done();
            });
    });
});
 */
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



describe('/POST login', () => {
    it('it should POST a login', done => {        
        chai
            .request(server)            
            .post('/login')
            .send({ username: 'yellowleopard753', password: 'jonjon' })
            .end((err, res) => {                
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('gender');
                res.body.should.have.property('cart');  
                res.body.should.have.property('name');
                res.body.should.have.property('location');
                res.body.should.have.property('email');
                res.body.should.have.property('login');
                res.body.should.have.property('dob'); 
                res.body.should.have.property('registered'); 
                res.body.should.have.property('phone'); 
                res.body.should.have.property('cell'); 
                res.body.should.have.property('picture');   
                res.body.should.have.property('nat');            
                done();
            });
    });
});





        