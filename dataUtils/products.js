const fs = require('fs');

let brands = [];
let products = [];

module.exports = {
    initializeData() {
        // Reading brands.json file and pushing it to brands array.
        fs.readFile('./initial-data/brands.json', 'utf8', function (error, data) {
        if (error) throw error;
        brands = JSON.parse(data);
        console.log(`Server setup: ${brands.length} brands loaded`);
        });

        // Reading products.json file and pushing it to products array.
        fs.readFile('./initial-data/products.json', 'utf8', function (error, data) {
        if (error) throw error;
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
        });
    },

    getAllBrands(){
        return brands;
    },

    getAllBrandsId(){
        let brandIds = brands.map(brand => brand.id);
        return brandIds;
    },

    getBrandSpecificProducts(brandId) {
        let filteredProducts = products.filter(product => product.categoryId === brandId);
        return filteredProducts;
    },

    getBrandId(query) {
        let queriedBrand = brands.find(brand => brand.name.toLowerCase() == query);
        if(queriedBrand){
            return queriedBrand.id;
        }
        return undefined;
    },

    getAllProducts() {
        return products;
    },

    getQueriedProducts(query){
        return products.filter(product => product.name.toLowerCase().includes(query));
    },

    checkProductAvailability(productId){
        let product = products.find(product => product.id == productId);
        return product;
    },

    getProduct(productId) {
        let product = products.find(product => product.id == productId);
        let productInstance = Object.assign({}, product, {"amount":1});
        return productInstance;
    }
}
