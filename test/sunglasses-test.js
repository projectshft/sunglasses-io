let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
let { expect } = require('chai');

chai.use(chaiHttp);

const products = require('../initial-data/products.json')
const users = require('../initial-data/users.json')
const brands = require('../initial-data/brands.json')

//test for api/brands GET request
describe('/GET brands', () => {
    //check for array
    it('it should GET an array', done => {
        chai
            .request(server)
            .get('/api/brands')
            .end((error, response) => {
                expect(response.body).to.be.an('array');
            });
        done();
    });

    //check for all brands returned
    it('it should GET all brands', done => {
        chai
            .request(server)
            .get('/api/brands')
            .end((error, response) => {
                expect(response.body.length).to.equal(brands.length)
            });
        done();
    });

    //check for array of objects with brand props
    it('it should GET array with an object for each brand containing brand data', done => {
        chai
            .request(server)
            .get('/api/brands')
            .end((error, response) => {
                expect(response.body).to.deep.equal(brands);
            });
        done();
    });
});

//test for api/brands/:id/products GET request
describe('/GET brands/:id/products', () => {
    //check for array
    it('it should GET an array', done => {
        chai
            .request(server)
            .get('/api/brands/2/products')
            .end((error, response) => {
                expect(response.body).to.be.an('array');
            });
        done();
    });

    //check if each product's category matches brand id
    it('it should GET only products of specified brand', done => {
        chai
            .request(server)
            .get(`/api/brands/2/products`)
            .end((error, response) => {
                //check if results were found
                if (response.body.length !== 0) {
                    expect(response.body).to.satisfy(() => {
                        return response.body.every(product => {
                            return product.categoryId = 2;
                        });
                    });
                } 
            });
            done();
    });

    
});

// //test for api/products GET request
    //check for array
// describe('/GET products', () => {
//     //
//     it('it should', done => {
//         chai
//             .request(server)
//             .get('/api/products')
//             .end((error, response) => {
//                 expect(response.body).to.be.an();
//             });
//         done();
//     });

    //check for array of objects

    //check that all products are returned if no query

    //check that search query returns array of products

    //check that search query returns only products containing search term

    //check that search query returns all products containing search term

    //check that product id query returns product with matching id

    //check that product id query returns no products that don't match id

    //check that product id query returns nothing if no products have matching id
// });

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




