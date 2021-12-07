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
                console.log(res);
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
                res.body.should.have.property('username');
                res.body.should.have.property('password');                
                done();
            });
    });
});




/* 

{
            "gender": "male",
            "cart":[],
            "name": {
                "title": "mr",
                "first": "eddie",
                "last": "dean"
            },
            "location": {
                "street": "19 tower street",
                "city": "new york",
                "state": "new york",
                "postcode": 64589
            },
            "email": "eddie.dean@example.com",
            "login": {
                "username": "redrose456",
                "password": "susannah19",
                "salt": "eNuMvema",
                "md5": "a8be2a69c8c91684588f4e1a29442dd7",
                "sha1": "f9a60bbf8b550c10712e470d713784c3ba78a68e",
                "sha256": "4dca9535634c102fbadbe62dc5b37cd608f9f3ced9aacf42a5669e5a312690a0"
            },
            "dob": "1972-10-19 10:47:17",
            "registered": "2003-08-03 01:12:24",
            "phone": "031-941-6700",
            "cell": "081-032-7884",
            "picture": {
                "large": "https://randomuser.me/api/portraits/women/55.jpg",
                "medium": "https://randomuser.me/api/portraits/med/women/55.jpg",
                "thumbnail": "https://randomuser.me/api/portraits/thumb/women/55.jpg"
            },
            "nat": "IE"
        };       , */