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
        it("should add an item to a validated user's cart", (done) => {
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
                .then(res => {
                    res.should.have.status(200);
                    chai
                        .request(server)
                        .get('/me/cart?token=4923292892791171')
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.an("array");
                            res.body.should.have.lengthOf(1);
                            res.body[0].should.be.an("object");
                            res.body[0].should.have.property("id");
                            res.body[0].should.have.property("categoryId");
                            res.body[0].should.have.property("name");
                            res.body[0].should.have.property("description");
                            res.body[0].should.have.property("price");
                            res.body[0].should.have.property("imageUrls");
                            res.body[0].should.have.property("count");
                            done();
                        });
                })
                .end(done());
        });
    });
});
