let { expect } = require('chai');
let ShoppingCart = require('../modules/shopping-cart')

describe('The shopping cart', () => {
    describe('subtotal should', () => {
        it('be 0 if no items are passed in', () => {
            //arrange
            let shoppingCart = new ShoppingCart();
            //act
            let subtotal = shoppingCart.subtotal;
            //assert
            expect(subtotal).to.equal(0);
        });

        it('be the sum of the price * quantity for all the items', () => {
            //arrange
            let shoppingCart = new shoppingCart([
                {
                    id: 1,
                    quantity: 5,
                    price: 5
                },
                {
                    id: 2,
                    quantity: 4,
                    price: 5
                },
                {
                    id: 3,
                    quantity: 1,
                    price: 50
                }
            ]);

            //act

            //assert
            expect(shoppingCart.subtotal).to.equal(95);
        });
    });
});

describe('add method should', () => {
    it('store the item in the shopping cart', () => {
        //arrange
        let shoppingCart = new ShoppingCart ([
            {
                id: 1,
                quantity: 4,
                price: 50
            }
        ]);

        //act
        shoppingCart.add({
            id: 2,
            quantity: 2,
            price: 30
        });

        //assert

    })
})
