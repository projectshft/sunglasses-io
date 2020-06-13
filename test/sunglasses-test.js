let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
let { expect } = require('chai');
let chaiEach = require('chai-each');
let chaiThings = require('chai-things');


chai.use(chaiHttp);
chai.use(chaiEach);
chai.use(chaiThings);

const products = require('../initial-data/products.json')
const users = require('../initial-data/users.json')
const brands = require('../initial-data/brands.json')

//test for api/brands GET request
describe('/GET brands', () => {
    //check for array
    it('should GET an array', done => {
        chai
            .request(server)
            .get('/api/brands')
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.be.an('array');
            });
        done();
    });

    //check that all results returned
    it('it should GET all brands', done => {
        chai
            .request(server)
            .get('/api/brands')
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.deep.equal(brands);
            });
        done();
    });
});

//test for api/brands/:id/products GET request
describe('/GET brands/:id/products', () => {

    //check for array
    it('should GET an array', done => {
        chai
            .request(server)
            .get('/api/brands/2/products')
            .end((error, response) => {
                    expect(response.statusCode).to.equal(200);
                    expect(response.body).to.be.an('array');
            });
        done();
    });

    //check if each product's category matches brand id
    it('should GET only products of specified brand', done => {
        chai
            .request(server)
            .get('/api/brands/2/products')
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.each.have.property('categoryId').that.equals('2');
            });
        done();
    });

    //expect empty array if no brands found
    it('should return empty array if no product matches found', done => {
      
        chai
            .request(server)
            .get('/api/brands/6/products')
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.be.empty;
            });
        done();
    });

    //check if all products with brand are returned
    it('should GET all products with specified brand', done => {
        chai
            .request(server)
            .get('/api/brands/1/products')
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                let productsFound = products.filter(product => {
                    return product.categoryId === "1";
                });
                expect(response.body).to.deep.equal(productsFound);
            });
        done();
    });

    //should return error if brand does not exist
    it('should throw error if brand id does not exist', done => {
        chai
            .request(server)
            .get('/api/brands/bananas/products')
            .end((error, response) => {
                expect(response.statusCode).to.equal(404);
                expect(response.body).to.be.empty
            });
        done();
    });
});

//test for api/products GET request
describe('/GET products', () => {
    //check for array of objects
    it('it should', done => {
        chai
            .request(server)
            .get('/api/products')
            .end((error, response) => {
                expect(response.body).to.be.an('array');
            });
        done();
    });

    //check that all products are returned if no query
    it('it should GET all products if no parameters sent', done => {
        chai
            .request(server)
            .get('/api/products')
            .end((error, response) => {
                expect(response.body).to.deep.equal(products);
            });
        done();
    });



    //check that search query returns array of products

    //check that search query returns only products containing search term

    //check that search query returns all products containing search term

    //check that product id query returns product with matching id

    //check that product id query returns no products that don't match id

    //check that product id query returns nothing if no products have matching id
});

// //test for api/login POST request
// describe('/POST login', () => {
    //login should require username and password

    //should throw error if username doesn't exist

    //should throw error if password doesn't match 

    //should create token if login successful

    //should 
//    
//     it('it should', done => {
//         chai
//             .request(server)
//             .post('/api/login')
//             .end((error, response) => {
//                 expect(response.body).to.be.an();
//             });
//         done();
//     });

    //

// });

// //test for api/me/cart GET request
// describe('/GET cart', () => {
//     //should get an array

    //array should be empty or contain only objects that match product 

    //cart should belong to user

    //cart should 

//     it('it should', done => {
//         chai
//             .request(server)
//             .get('/api/me/cart')
//             .end((error, response) => {
//                 expect(response.body).to.be.an();
//             });
//         done();
//     });
// });

// //test for api/me/cart POST request
// describe('/POST cart', () => {
//     //
//     it('it should', done => {
//         chai
//             .request(server)
//             .post('/api/me/cart')
//             .end((error, response) => {
//                 expect(response.body).to.be.an();
//             });
//         done();
//     });
// });

// //test for api/me/cart/:productId DELETE request
// describe('/DELETE cart/:productId', () => {
//     //
//     it('it should', done => {
//         chai
//             .request(server)
//             .delete('/api/me/cart/:productId')
//             .end((error, response) => {
//                 expect(response.body).to.be.an();
//             });
//         done();
//     });
// });

// //test for /api/me/cart/:productId POST request
// describe('/POST cart/:productId', () => {
//     //
//     it('it should', done => {
//         chai
//             .request(server)
//             .post('/api/me/cart/:productId')
//             .end((error, response) => {
//                 expect(response.body).to.be.an();
//             });
//         done();
//     });
// });




