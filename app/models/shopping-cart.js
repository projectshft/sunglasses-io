let cart = [];

class ShoppingCart {
    constructor(params) {
        Object.assign(this,params);
    }

    static addItem(product) {
        cart.push(product)
        return cart
    }

    static clearCart() {
        cart = [];
    }
}

module.exports = ShoppingCart;