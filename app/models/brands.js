module.exports = class Products {
    constructor() {

    }

    static getAll(brands) {
        return brands;
    }

    static getProductsByBrandID(id, products) {
        return products.filter(product => product.categoryId === id);
    }
}