let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);

describe("Cart", () => {
    describe("/Get cart", () => {
        it("it should get the items in a validated user's cart", (done) => {
            chai
                .request(server)
                .get('/me/cart?token=4923292892791171')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("array");
                    res.body.should.have.lengthOf(0);
                    done();
                });
            });
        it("it should return an error if the user whose cart is being retrieved isn't validated", (done) => {
            chai
                .request(server)
                .get('/me/cart?token=badtokennumber')
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });

        });
    });
    describe("/POST cart", () => {
        it("should add a new item to a validated user's cart", (done) => {
            let item = {
                id: "5",
                categoryId: "2",
                name: "Glasses",
                description: "The most normal glasses in the world",
                price:150,
                imageUrls:["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
            };
            chai
                .request(server)
                .post('/me/cart/?token=4923292892791171')
                .send(item)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
        it("should not add an item to an unvalidated user's cart", (done) => {
            let item = {
                id: "5",
                categoryId: "2",
                name: "Glasses",
                description: "The most normal glasses in the world",
                price:150,
                imageUrls:["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
            };
            chai
                .request(server)
                .post('/me/cart/?token=badtokennumber')
                .send(item)
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
        it("should increase the count of an item in a validated user's cart by one", (done) => {
            chai
                .request(server)
                .post('/me/cart/1?token=9720471039174304')
                .send({action: 'increment'})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("array");
                    res.body.should.have.lengthOf(1);
                    res.body[0].count.should.equal(3);
                    done();
                });
        });
        it("should decrease the count of an item in a validated user's cart by one", (done) => {
            chai
                .request(server)
                .post('/me/cart/1?token=9720471039174304')
                .send({action: 'decrement'})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("array");
                    res.body.should.have.lengthOf(1);
                    res.body[0].count.should.equal(2);
                    done();
                });
        }); 
        it("should not change the count of an item that isn't in a validated user's cart", (done) => {
            chai
                .request(server)
                .post('/me/cart/2?token=9720471039174304')
                .send({action: 'increment'})
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });
        it("should not change the count of an item in an unvalidated user's cart", (done) => {
            chai   
                .request(server)
                .post('/me/cart/2?token=badtokennumber')
                .send({action: 'increment'})
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
    });
    describe("/DELETE cart", () => {
        it("should remove an item (all counts of the item) that exists in a validated user's cart", (done) => {
            chai
                .request(server)
                .delete('/me/cart/1?token=9720471039174304')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("array");
                    res.body.should.have.lengthOf(0);   
                    done();
                });
        });
        it("should not remove an item that doesn't exist in a validated user's cart", (done) => {
            chai
                .request(server)
                .delete('/me/cart/2?token=9720471039174304')
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });
        it("should not remove an item that exists in an unvalidated user's cart", (done) => {
            chai
                .request(server)
                .delete('/me/cart/1?token=badtoken')
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
    });
});
