const products = [];
const brands = [];

class Products {
  constructor(params) {
    Object.assign(this, params);
  };

  //pushes uploaded new products into products variable
  static addProducts(newProducts) {
    products.push(...newProducts);
  };

  //grabs all the products available in the store
  static getAllProducts() {
    return products;
  };

  //return product by searching by product ID
  static getProductById(id) {
      const foundProduct = products.find(product => product.id == id);
      return foundProduct;
  }

  //adds all the brands to the brands variable
  static addBrands(newBrands) {
    brands.push(...newBrands);
  };

  //returns all the brands
  static getAllBrands() {
    return brands;
  }

  //filters produduct by brand name
  static filterProductsByBrand(_brand) {
    const brandObject = brands.find((brand) => brand.name === _brand );
    if(!brandObject){
      return undefined;
    }
    const filteredProducts = products.filter((product) => product.categoryId === brandObject.id);
    return filteredProducts;
  }
};

//Exports the product for use elsewhere
module.exports = Products;